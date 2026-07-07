


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."admin_role" AS ENUM (
    'super_admin',
    'admin'
);


ALTER TYPE "public"."admin_role" OWNER TO "postgres";


CREATE TYPE "public"."assessment_period_status" AS ENUM (
    'active',
    'finalized'
);


ALTER TYPE "public"."assessment_period_status" OWNER TO "postgres";


CREATE TYPE "public"."assessment_role" AS ENUM (
    'admin',
    'approver',
    'evaluator',
    'regular'
);


ALTER TYPE "public"."assessment_role" OWNER TO "postgres";


CREATE TYPE "public"."ethiopia_region" AS ENUM (
    'ኦሮሚያ',
    'አማራ',
    'ሶማሌ',
    'አፋር',
    'ቤን-ጉሙዝ',
    'ጋምቤላ',
    'ሐረሪ',
    'ሲዳማ',
    'ደ/ም/ኢ/ያ',
    'ደቡብ ኢ/ያ',
    'ማዕ/ኢ/ያ',
    'አዲስ አበባ',
    'ድሬ ዳዋ',
    'ፌዴራል ተቋማት',
    'ትግራይ'
);


ALTER TYPE "public"."ethiopia_region" OWNER TO "postgres";


CREATE TYPE "public"."report_period" AS ENUM (
    '1ኛ ሩብ አመት',
    '2ኛ ሩብ አመት',
    'የመጀመሪያ ግማሽ አመት',
    '3ኛ ሩብ አመት',
    '4ኛ ሩብ አመት',
    '2ተኛ ግማሽ አመት',
    'የበጀት አመት (ሙሉ)'
);


ALTER TYPE "public"."report_period" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."enforce_complaint_rate_limit"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  headers json;
  client_ip text;
  req_count int;
BEGIN
  -- Extract IP from Supabase request headers
  headers := current_setting('request.headers', true)::json;
  client_ip := headers->>'x-forwarded-for';
  
  IF client_ip IS NOT NULL THEN
    client_ip := split_part(client_ip, ',', 1);
    
    -- Cleanup old records
    DELETE FROM public.rate_limits WHERE last_request_at < NOW() - INTERVAL '30 minutes';
    
    -- Get current count
    SELECT count INTO req_count FROM public.rate_limits WHERE ip_address = client_ip AND action_type = 'submit_complaint';
    
    IF req_count >= 5 THEN
      RAISE EXCEPTION 'Rate limit exceeded. Please try again later. (Max 5 submissions per 30 minutes)';
    END IF;
    
    IF req_count IS NULL THEN
      INSERT INTO public.rate_limits (ip_address, action_type, count, last_request_at) 
      VALUES (client_ip, 'submit_complaint', 1, NOW());
    ELSE
      UPDATE public.rate_limits 
      SET count = count + 1, last_request_at = NOW() 
      WHERE ip_address = client_ip AND action_type = 'submit_complaint';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."enforce_complaint_rate_limit"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."finalize_period_scores"("p_period_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_total_members INT;
  v_locked_self_assessments INT;
  v_locked_evaluations INT;
  v_locked_approver_evaluations INT;
  v_number_of_evaluators INT;
  v_number_of_approvers INT;
BEGIN
  -- Security check: Must be approver or admin
  IF NOT (public.is_assessment_admin() OR public.get_period_role(p_period_id, auth.uid()) = 'approver') THEN
    RAISE EXCEPTION 'Unauthorized: Only approver or admin can finalize scores';
  END IF;

  -- Get total members
  SELECT count(*) INTO v_total_members FROM public.period_members WHERE period_id = p_period_id;
  
  -- Check 10-point self assessments
  SELECT count(*) INTO v_locked_self_assessments FROM public.self_assessments WHERE period_id = p_period_id AND is_locked = true;
  IF v_locked_self_assessments < v_total_members THEN
    RAISE EXCEPTION 'Cannot finalize: Not all members have completed their self assessments.';
  END IF;

  -- Check 20-point evaluations
  SELECT count(*) INTO v_number_of_evaluators FROM public.period_members WHERE period_id = p_period_id AND role = 'evaluator';
  SELECT count(*) INTO v_locked_evaluations FROM public.evaluations WHERE period_id = p_period_id AND is_locked = true;
  IF v_locked_evaluations = 0 AND v_number_of_evaluators > 0 THEN
    RAISE EXCEPTION 'Cannot finalize: Evaluations are missing.';
  END IF;

  -- Check 70-point approver evaluations
  SELECT count(*) INTO v_number_of_approvers FROM public.period_members WHERE period_id = p_period_id AND role = 'approver';
  SELECT count(*) INTO v_locked_approver_evaluations FROM public.approver_evaluations WHERE period_id = p_period_id AND is_locked = true;
  
  -- Relaxed check: approvers don't evaluate themselves out of 70
  IF v_locked_approver_evaluations < (v_total_members - v_number_of_approvers) THEN
    RAISE EXCEPTION 'Cannot finalize: Not all approver evaluations (70 points) have been completed.';
  END IF;

  -- Calculate and insert final scores (10 + 20 + 70)
  INSERT INTO public.final_scores (user_id, period_id, final_score_100)
  SELECT 
    pm.user_id,
    p_period_id,
    COALESCE(sa.score_10, 0) + COALESCE(le.avg_score_20, 0) + COALESCE(ae.avg_score_70, 0) AS final_score_100
  FROM public.period_members pm
  LEFT JOIN public.self_assessments sa ON sa.period_id = p_period_id AND sa.user_id = pm.user_id
  LEFT JOIN (
    SELECT target_user_id, AVG(score_20) as avg_score_20
    FROM public.evaluations
    WHERE period_id = p_period_id
    GROUP BY target_user_id
  ) le ON le.target_user_id = pm.user_id
  LEFT JOIN (
    SELECT target_user_id, AVG(score_70) as avg_score_70
    FROM public.approver_evaluations
    WHERE period_id = p_period_id
    GROUP BY target_user_id
  ) ae ON ae.target_user_id = pm.user_id
  WHERE pm.period_id = p_period_id
  ON CONFLICT (period_id, user_id) DO UPDATE 
  SET final_score_100 = EXCLUDED.final_score_100;

  -- Update period status
  UPDATE public.assessment_periods SET status = 'finalized' WHERE id = p_period_id;

  RETURN true;
END;
$$;


ALTER FUNCTION "public"."finalize_period_scores"("p_period_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."finalize_team_scores"("p_team_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_sebsabi_count INT;
  v_total_members INT;
  v_locked_self_assessments INT;
  v_locked_evaluations INT;
  v_required_evaluations INT;
  v_number_of_leaders INT;
BEGIN
  -- Security check: Must be sebsabi of the team or an admin
  IF NOT (public.is_assessment_admin() OR public.get_team_role(p_team_id, auth.uid()) = 'sebsabi') THEN
    RAISE EXCEPTION 'Unauthorized: Only sebsabi or admin can finalize scores';
  END IF;

  -- Get total members in the team
  SELECT count(*) INTO v_total_members FROM public.team_members WHERE team_id = p_team_id;
  
  -- Get locked self assessments
  SELECT count(*) INTO v_locked_self_assessments FROM public.self_assessments WHERE team_id = p_team_id AND is_locked = true;
  
  -- Gate Check 1: All members must have locked self assessments
  IF v_locked_self_assessments < v_total_members THEN
    RAISE EXCEPTION 'Cannot finalize: Not all team members have completed their self assessments.';
  END IF;

  -- Get number of leaders
  SELECT count(*) INTO v_number_of_leaders FROM public.team_members WHERE team_id = p_team_id AND role IN ('sebsabi', 'tsehafi', 'mktl_tsehafi');

  -- Get locked leadership evaluations
  SELECT count(*) INTO v_locked_evaluations FROM public.leadership_evaluations WHERE team_id = p_team_id AND is_locked = true;
  
  -- Gate Check 2: All leaders must have evaluated all team members
  -- The PRD states: count(leadership_evaluations where is_locked = true) == (count(team_members) * number_of_leaders)
  v_required_evaluations := v_total_members * v_number_of_leaders;
  IF v_locked_evaluations < v_required_evaluations THEN
    RAISE EXCEPTION 'Cannot finalize: Not all leadership evaluations have been completed and locked.';
  END IF;

  -- Calculate and insert final scores
  INSERT INTO public.final_scores (user_id, team_id, final_score_30)
  SELECT 
    tm.user_id,
    p_team_id,
    COALESCE(sa.total_score_10, 0) + COALESCE(le.avg_score_20, 0) AS final_score_30
  FROM public.team_members tm
  LEFT JOIN public.self_assessments sa ON sa.team_id = p_team_id AND sa.user_id = tm.user_id
  LEFT JOIN (
    SELECT target_user_id, AVG(score_20) as avg_score_20
    FROM public.leadership_evaluations
    WHERE team_id = p_team_id
    GROUP BY target_user_id
  ) le ON le.target_user_id = tm.user_id
  WHERE tm.team_id = p_team_id
  ON CONFLICT (team_id, user_id) DO UPDATE 
  SET final_score_30 = EXCLUDED.final_score_30;

  -- Update team status
  UPDATE public.teams SET status = 'finalized' WHERE id = p_team_id;

  RETURN true;
END;
$$;


ALTER FUNCTION "public"."finalize_team_scores"("p_team_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_analytics_summary"("start_date" timestamp with time zone, "end_date" timestamp with time zone) RETURNS json
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    result json;
    time_series_data json;
    top_pages_data json;
    entry_pages_data json;
    exit_pages_data json;
    top_referrers_data json;
    devices_data json;
    locations_data json;
    total_views_count integer;
    unique_visitors_count integer;
    bounce_rate_calc numeric;
    session_duration_calc text;
    interval_step interval;
BEGIN
    -- Determine interval step for time series based on date range
    IF (end_date - start_date) <= interval '2 days' THEN
        interval_step := interval '2 hours';
    ELSIF (end_date - start_date) <= interval '31 days' THEN
        interval_step := interval '1 day';
    ELSE
        interval_step := interval '1 week';
    END IF;

    -- 1. Time Series
    WITH series AS (
        SELECT generate_series(
            date_trunc('hour', start_date),
            end_date,
            interval_step
        ) as bucket
    ),
    bucket_sessions AS (
        SELECT 
            CASE 
                WHEN interval_step = interval '2 hours' THEN 
                     date_trunc('hour', timestamp) - (EXTRACT(hour FROM timestamp)::int % 2) * interval '1 hour'
                WHEN interval_step = interval '1 day' THEN date_trunc('day', timestamp)
                ELSE date_trunc('week', timestamp)
            END as date,
            ip_address,
            COUNT(*) as view_count,
            MIN(timestamp) as session_start,
            MAX(timestamp) as session_end
        FROM page_views
        WHERE timestamp BETWEEN start_date AND end_date
        GROUP BY 1, 2
    ),
    bucket_metrics AS (
        SELECT
            date,
            SUM(view_count) as views,
            COUNT(DISTINCT ip_address) as unique,
            COUNT(*) as total_sessions,
            COUNT(*) FILTER (WHERE view_count = 1) as bounce_sessions,
            AVG(EXTRACT(EPOCH FROM (session_end - session_start))) FILTER (WHERE view_count > 1) as avg_duration_seconds
        FROM bucket_sessions
        GROUP BY date
    )
    SELECT 
        COALESCE(json_agg(
            json_build_object(
                'date', s.bucket,
                'views', COALESCE(bm.views, 0),
                'unique', COALESCE(bm.unique, 0),
                'bounce_rate', CASE WHEN COALESCE(bm.total_sessions, 0) = 0 THEN 0 ELSE ROUND((COALESCE(bm.bounce_sessions, 0)::numeric * 100.0) / bm.total_sessions, 1) END,
                'duration_seconds', COALESCE(bm.avg_duration_seconds, 0)
            ) ORDER BY s.bucket
        ), '[]'::json)
    INTO time_series_data
    FROM series s
    LEFT JOIN bucket_metrics bm ON 
        (interval_step = interval '2 hours' AND bm.date = (s.bucket - (EXTRACT(hour FROM s.bucket)::int % 2) * interval '1 hour')) OR
        (interval_step != interval '2 hours' AND bm.date = s.bucket);

    -- 2. Sessions (Entry, Exit, Duration, Bounce)
    WITH user_sessions AS (
        SELECT 
            ip_address,
            MIN(timestamp) as session_start,
            MAX(timestamp) as session_end,
            COUNT(*) as view_count,
            (ARRAY_AGG(path ORDER BY timestamp ASC))[1] as entry_page,
            (ARRAY_AGG(path ORDER BY timestamp DESC))[1] as exit_page
        FROM page_views
        WHERE timestamp BETWEEN start_date AND end_date
        GROUP BY ip_address, date_trunc('day', timestamp)
    ),
    session_metrics AS (
        SELECT 
            COUNT(*) as total_sessions,
            COUNT(*) FILTER (WHERE view_count = 1) as bounce_sessions,
            AVG(EXTRACT(EPOCH FROM (session_end - session_start))) FILTER (WHERE view_count > 1) as avg_duration_seconds
        FROM user_sessions
    )
    SELECT 
        CASE WHEN total_sessions = 0 THEN 0 ELSE ROUND((bounce_sessions::numeric * 100.0) / total_sessions, 1) END,
        CASE 
            WHEN avg_duration_seconds IS NULL THEN '0m 0s'
            ELSE floor(avg_duration_seconds / 60)::text || 'm ' || round(avg_duration_seconds % 60)::text || 's'
        END
    INTO bounce_rate_calc, session_duration_calc
    FROM session_metrics;

    -- Entry pages
    WITH user_sessions AS (
        SELECT (ARRAY_AGG(path ORDER BY timestamp ASC))[1] as entry_page
        FROM page_views
        WHERE timestamp BETWEEN start_date AND end_date
        GROUP BY ip_address, date_trunc('day', timestamp)
    )
    SELECT COALESCE(json_agg(json_build_object('path', entry_page, 'views', views)), '[]'::json)
    INTO entry_pages_data
    FROM (
        SELECT entry_page, COUNT(*) as views
        FROM user_sessions
        GROUP BY entry_page
        ORDER BY views DESC LIMIT 10
    ) t;

    -- Exit pages
    WITH user_sessions AS (
        SELECT (ARRAY_AGG(path ORDER BY timestamp DESC))[1] as exit_page
        FROM page_views
        WHERE timestamp BETWEEN start_date AND end_date
        GROUP BY ip_address, date_trunc('day', timestamp)
    )
    SELECT COALESCE(json_agg(json_build_object('path', exit_page, 'views', views)), '[]'::json)
    INTO exit_pages_data
    FROM (
        SELECT exit_page, COUNT(*) as views
        FROM user_sessions
        GROUP BY exit_page
        ORDER BY views DESC LIMIT 10
    ) t;

    -- Totals
    SELECT COUNT(*), COUNT(DISTINCT ip_address)
    INTO total_views_count, unique_visitors_count
    FROM page_views
    WHERE timestamp BETWEEN start_date AND end_date;

    -- Top Pages
    SELECT COALESCE(json_agg(json_build_object('path', path, 'views', views)), '[]'::json)
    INTO top_pages_data
    FROM (
        SELECT path, COUNT(*) as views
        FROM page_views
        WHERE timestamp BETWEEN start_date AND end_date
        GROUP BY path
        ORDER BY views DESC LIMIT 10
    ) t;

    -- Referrers
    SELECT COALESCE(json_agg(json_build_object('referrer', referrer, 'views', views)), '[]'::json)
    INTO top_referrers_data
    FROM (
        SELECT referrer, COUNT(*) as views
        FROM page_views
        WHERE timestamp BETWEEN start_date AND end_date AND referrer IS NOT NULL AND referrer != ''
        GROUP BY referrer
        ORDER BY views DESC LIMIT 10
    ) t;

    -- Devices
    SELECT COALESCE(json_agg(json_build_object('device_type', device_type, 'views', views)), '[]'::json)
    INTO devices_data
    FROM (
        SELECT device_type, COUNT(*) as views
        FROM page_views
        WHERE timestamp BETWEEN start_date AND end_date
        GROUP BY device_type
        ORDER BY views DESC LIMIT 10
    ) t;

    -- Locations
    SELECT COALESCE(json_agg(json_build_object('country', country, 'country_code', country_code, 'city', city, 'views', views)), '[]'::json)
    INTO locations_data
    FROM (
        SELECT country, country_code, city, COUNT(*) as views
        FROM page_views
        WHERE timestamp BETWEEN start_date AND end_date
        GROUP BY country, country_code, city
        ORDER BY views DESC LIMIT 10
    ) t;

    -- Build final JSON
    result := json_build_object(
        'total_views', COALESCE(total_views_count, 0),
        'unique_visitors', COALESCE(unique_visitors_count, 0),
        'bounce_rate', COALESCE(bounce_rate_calc, 0),
        'session_duration', COALESCE(session_duration_calc, '0m 0s'),
        'time_series', time_series_data,
        'top_pages', top_pages_data,
        'entry_pages', entry_pages_data,
        'exit_pages', exit_pages_data,
        'top_referrers', top_referrers_data,
        'devices', devices_data,
        'locations', locations_data
    );

    RETURN result;
END;
$$;


ALTER FUNCTION "public"."get_analytics_summary"("start_date" timestamp with time zone, "end_date" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_period_role"("p_period_id" "uuid", "p_user_id" "uuid") RETURNS "public"."assessment_role"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT role FROM public.period_members
  WHERE period_id = p_period_id AND user_id = p_user_id
  LIMIT 1;
$$;


ALTER FUNCTION "public"."get_period_role"("p_period_id" "uuid", "p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = auth.uid()
  );
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_assessment_admin"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- If super_admin from existing global profiles, return true
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_super_admin') THEN
    IF public.is_super_admin() THEN RETURN true; END IF;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.period_members
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$;


ALTER FUNCTION "public"."is_assessment_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_period_member"("p_period_id" "uuid") RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.period_members
    WHERE period_id = p_period_id AND user_id = auth.uid()
  );
$$;


ALTER FUNCTION "public"."is_period_member"("p_period_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_super_admin"() RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$$;


ALTER FUNCTION "public"."is_super_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_team_member"("p_team_id" "uuid") RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = p_team_id AND user_id = auth.uid()
  );
$$;


ALTER FUNCTION "public"."is_team_member"("p_team_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."join_period_via_qr"("p_period_id" "uuid", "p_full_name" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_phone_number TEXT;
BEGIN
  -- Get the current authenticated user's phone number
  SELECT raw_user_meta_data->>'phone' INTO v_phone_number 
  FROM auth.users 
  WHERE id = auth.uid();
  
  -- If not in metadata, try getting it from phone column
  IF v_phone_number IS NULL THEN
    SELECT phone INTO v_phone_number FROM auth.users WHERE id = auth.uid();
  END IF;

  -- Upsert into public.users
  INSERT INTO public.users (id, phone_number, full_name)
  VALUES (auth.uid(), v_phone_number, p_full_name)
  ON CONFLICT (id) DO UPDATE 
  SET full_name = EXCLUDED.full_name,
      phone_number = EXCLUDED.phone_number;

  -- Add to period_members with default role 'regular'
  INSERT INTO public.period_members (period_id, user_id, role)
  VALUES (p_period_id, auth.uid(), 'regular')
  ON CONFLICT (period_id, user_id) DO NOTHING;

  RETURN true;
END;
$$;


ALTER FUNCTION "public"."join_period_via_qr"("p_period_id" "uuid", "p_full_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_complaints_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_complaints_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."admin_profiles" (
    "id" "uuid" NOT NULL,
    "role" "public"."admin_role" DEFAULT 'admin'::"public"."admin_role" NOT NULL,
    "permissions" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "first_name" "text",
    "last_name" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "email" "text",
    "phone" "text",
    "access_level" "text" DEFAULT 'specific'::"text",
    "groups" "text"[] DEFAULT '{}'::"text"[],
    "modules" "text"[] DEFAULT '{}'::"text"[],
    "status" "text" DEFAULT 'Active'::"text",
    "last_login" timestamp with time zone,
    "requires_password_change" boolean DEFAULT true
);


ALTER TABLE "public"."admin_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."approver_evaluations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "approver_id" "uuid" NOT NULL,
    "target_user_id" "uuid" NOT NULL,
    "period_id" "uuid" NOT NULL,
    "score_70" numeric DEFAULT 0 NOT NULL,
    "is_locked" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."approver_evaluations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."assessment_periods" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "year" "text" NOT NULL,
    "period_half" "text" NOT NULL,
    "status" "public"."assessment_period_status" DEFAULT 'active'::"public"."assessment_period_status" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."assessment_periods" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."complaints" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "phone" "text" NOT NULL,
    "email" "text",
    "type" "text" NOT NULL,
    "subject" "text" NOT NULL,
    "message" "text" NOT NULL,
    "attachments" "jsonb" DEFAULT '[]'::"jsonb",
    "status" "text" DEFAULT 'New'::"text" NOT NULL,
    "resolution" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "age" integer,
    "gender" "text",
    "address" "text",
    "submission_mode" "text" DEFAULT 'በግል'::"text",
    "member_count" integer,
    "institution" "text",
    "requested_resolution" "text",
    "tracking_code" "text",
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "processed_at" timestamp with time zone,
    "resolved_at" timestamp with time zone,
    "processed_by" "text",
    "resolved_by" "text",
    "group_members" "text"[] DEFAULT '{}'::"text"[],
    "assigned_committee" "text",
    "service_name" "text",
    "resolution_rating" integer,
    "resolution_feedback" "text",
    CONSTRAINT "complaints_status_check" CHECK (("status" = ANY (ARRAY['New'::"text", 'Processing'::"text", 'Resolved'::"text", 'Rejected'::"text"]))),
    CONSTRAINT "complaints_type_check" CHECK (("type" = ANY (ARRAY['Complaint'::"text", 'Suggestion'::"text"])))
);


ALTER TABLE "public"."complaints" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."document_access_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "document_id" "uuid" NOT NULL,
    "accessed_by" "text" NOT NULL,
    "action" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."document_access_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."document_folders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "code" "text" NOT NULL,
    "parent_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."document_folders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "folder_id" "uuid",
    "title" "text" NOT NULL,
    "storage_path" "text",
    "file_type" "text",
    "file_size" bigint,
    "uploaded_by" "text" NOT NULL,
    "version" "text" DEFAULT '1.0'::"text",
    "visibility" "text" DEFAULT 'Internal'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "description" "text",
    "office" "text" DEFAULT 'main'::"text",
    "main_category" "text" DEFAULT '000'::"text",
    "sub_category" "text" DEFAULT '010'::"text",
    "year" "text" DEFAULT '2026'::"text",
    "upload_date" "text",
    "files" "jsonb" DEFAULT '[]'::"jsonb",
    "is_public" boolean DEFAULT true
);


ALTER TABLE "public"."documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."evaluations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "evaluator_id" "uuid" NOT NULL,
    "target_user_id" "uuid" NOT NULL,
    "period_id" "uuid" NOT NULL,
    "score_20" numeric DEFAULT 0 NOT NULL,
    "is_locked" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "responses" "jsonb" DEFAULT '{}'::"jsonb",
    CONSTRAINT "eval_not_self" CHECK (("evaluator_id" <> "target_user_id"))
);


ALTER TABLE "public"."evaluations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."feedbacks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "rating" "text" NOT NULL,
    "review" "text" NOT NULL,
    "sentiment" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "category" "text",
    "region" "public"."ethiopia_region",
    "sector" "text",
    CONSTRAINT "feedbacks_rating_check" CHECK (("rating" = ANY (ARRAY['excellent'::"text", 'good'::"text", 'bad'::"text", 'very-bad'::"text", 'very-good'::"text", 'needs-improvement'::"text"]))),
    CONSTRAINT "feedbacks_sentiment_check" CHECK (("sentiment" = ANY (ARRAY['positive'::"text", 'neutral'::"text", 'negative'::"text"])))
);


ALTER TABLE "public"."feedbacks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."final_scores" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "period_id" "uuid" NOT NULL,
    "final_score_100" numeric DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."final_scores" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."news_articles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "lang" "text" DEFAULT 'English'::"text" NOT NULL,
    "status" "text" DEFAULT 'Draft'::"text" NOT NULL,
    "author" "text" NOT NULL,
    "created" timestamp with time zone DEFAULT "now"(),
    "published" timestamp with time zone,
    "category" "text",
    "content" "text",
    "description" "text",
    "image" "text",
    "video_url" "text",
    "images" "text"[],
    "excerpt" "text"
);


ALTER TABLE "public"."news_articles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."otp_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "phone_number" "text" NOT NULL,
    "otp_code" "text" NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "used" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."otp_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."page_views" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "timestamp" timestamp with time zone DEFAULT "now"(),
    "path" "text",
    "referrer" "text",
    "ip_address" "text",
    "user_agent" "text",
    "device_type" "text",
    "country" "text",
    "city" "text",
    "country_code" "text"
);


ALTER TABLE "public"."page_views" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."period_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "period_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "public"."assessment_role" DEFAULT 'regular'::"public"."assessment_role" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."period_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."personnel" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "name_am" "text",
    "position" "text" NOT NULL,
    "position_am" "text" NOT NULL,
    "office_category" "text" NOT NULL,
    "office_category_am" "text" NOT NULL,
    "department" "text",
    "email" "text",
    "phone" "text",
    "photo" "text",
    "message" "text",
    "status" "text" DEFAULT 'Active'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "facebook_url" "text",
    "archived_at" timestamp with time zone,
    "x_url" "text",
    "linkedin_url" "text",
    "whatsapp_url" "text"
);


ALTER TABLE "public"."personnel" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."public_files" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "title" "text" NOT NULL,
    "category" "text" NOT NULL,
    "file_url" "text" NOT NULL,
    "file_name" "text" NOT NULL,
    "file_size" "text",
    "file_type" "text",
    "uploaded_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "public_files_category_check" CHECK (("category" = ANY (ARRAY['መተዳደርያ ደንብ'::"text", 'የኮሚሽኑ መመሪያዎች'::"text", 'የፓርቲ መመሪያዎች'::"text", 'የኮሚሽኑ ሚስጥራዊ ሰነዶች'::"text"])))
);


ALTER TABLE "public"."public_files" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."qr_codes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "active" boolean DEFAULT true,
    "duration" "text" NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."qr_codes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."rate_limits" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "ip_address" "text" NOT NULL,
    "action_type" "text" NOT NULL,
    "count" integer DEFAULT 1 NOT NULL,
    "last_request_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."rate_limits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."report_feedbacks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "report_id" "uuid" NOT NULL,
    "reviewer_id" "uuid" NOT NULL,
    "feedback_level" "text" NOT NULL,
    "description" "text" NOT NULL,
    "file_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "report_feedbacks_feedback_level_check" CHECK (("feedback_level" = ANY (ARRAY['region'::"text", 'federal'::"text"])))
);


ALTER TABLE "public"."report_feedbacks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reporting_profiles" (
    "user_id" "uuid" NOT NULL,
    "hierarchy_level" "text" NOT NULL,
    "region_name" "text",
    "subcity_name" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "reporting_profiles_hierarchy_level_check" CHECK (("hierarchy_level" = ANY (ARRAY['federal'::"text", 'region'::"text", 'subcity'::"text"])))
);


ALTER TABLE "public"."reporting_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "report_type" "text" NOT NULL,
    "period_category" "text" NOT NULL,
    "budget_year" "text" NOT NULL,
    "submitter_id" "uuid" NOT NULL,
    "submitter_level" "text" NOT NULL,
    "region_name" "text",
    "subcity_name" "text",
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "numerical_data" "jsonb" DEFAULT '{}'::"jsonb",
    "file_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "region_enum" "public"."ethiopia_region",
    CONSTRAINT "reports_period_category_check" CHECK (("period_category" = ANY (ARRAY['q1'::"text", 'q2'::"text", 'h1'::"text", 'q3'::"text", 'q4'::"text", 'h2'::"text", 'yearly'::"text"]))),
    CONSTRAINT "reports_report_type_check" CHECK (("report_type" = ANY (ARRAY['numerical'::"text", 'narration'::"text"]))),
    CONSTRAINT "reports_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'submitted_to_region'::"text", 'accepted_by_region'::"text", 'submitted_to_federal'::"text", 'accepted_by_federal'::"text"]))),
    CONSTRAINT "reports_submitter_level_check" CHECK (("submitter_level" = ANY (ARRAY['subcity'::"text", 'region'::"text", 'federal'::"text"])))
);


ALTER TABLE "public"."reports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."scan_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "requester_device" "text" NOT NULL,
    "file_name" "text" NOT NULL,
    "ip_address" "text",
    "status" "text" DEFAULT 'Pending'::"text",
    "approver_name" "text",
    "duration_granted" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "resolved_at" timestamp with time zone
);


ALTER TABLE "public"."scan_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."self_assessments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "period_id" "uuid" NOT NULL,
    "responses" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "score_10" numeric DEFAULT 0 NOT NULL,
    "is_locked" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."self_assessments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "user_id" "uuid" NOT NULL,
    "gender" "text",
    "age" integer,
    "education_level" "text",
    "professional_field" "text",
    "experience_professional" integer,
    "experience_leadership" integer,
    "institution" "text",
    "current_responsibility_gov" "text",
    "current_responsibility_com" "text",
    "system_role" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "photo_url" "text",
    "region" "public"."ethiopia_region"
);


ALTER TABLE "public"."user_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "phone_number" "text" NOT NULL,
    "full_name" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."admin_profiles"
    ADD CONSTRAINT "admin_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."approver_evaluations"
    ADD CONSTRAINT "approver_evaluations_period_id_approver_id_target_user_id_key" UNIQUE ("period_id", "approver_id", "target_user_id");



ALTER TABLE ONLY "public"."approver_evaluations"
    ADD CONSTRAINT "approver_evaluations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."assessment_periods"
    ADD CONSTRAINT "assessment_periods_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."complaints"
    ADD CONSTRAINT "complaints_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."complaints"
    ADD CONSTRAINT "complaints_tracking_code_key" UNIQUE ("tracking_code");



ALTER TABLE ONLY "public"."document_access_logs"
    ADD CONSTRAINT "document_access_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."document_folders"
    ADD CONSTRAINT "document_folders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."evaluations"
    ADD CONSTRAINT "evaluations_period_id_evaluator_id_target_user_id_key" UNIQUE ("period_id", "evaluator_id", "target_user_id");



ALTER TABLE ONLY "public"."evaluations"
    ADD CONSTRAINT "evaluations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."feedbacks"
    ADD CONSTRAINT "feedbacks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."final_scores"
    ADD CONSTRAINT "final_scores_period_id_user_id_key" UNIQUE ("period_id", "user_id");



ALTER TABLE ONLY "public"."final_scores"
    ADD CONSTRAINT "final_scores_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."news_articles"
    ADD CONSTRAINT "news_articles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."otp_requests"
    ADD CONSTRAINT "otp_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."page_views"
    ADD CONSTRAINT "page_views_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."period_members"
    ADD CONSTRAINT "period_members_period_id_user_id_key" UNIQUE ("period_id", "user_id");



ALTER TABLE ONLY "public"."period_members"
    ADD CONSTRAINT "period_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."personnel"
    ADD CONSTRAINT "personnel_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."public_files"
    ADD CONSTRAINT "public_files_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."qr_codes"
    ADD CONSTRAINT "qr_codes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."rate_limits"
    ADD CONSTRAINT "rate_limits_ip_address_action_type_key" UNIQUE ("ip_address", "action_type");



ALTER TABLE ONLY "public"."rate_limits"
    ADD CONSTRAINT "rate_limits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."report_feedbacks"
    ADD CONSTRAINT "report_feedbacks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reporting_profiles"
    ADD CONSTRAINT "reporting_profiles_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."scan_requests"
    ADD CONSTRAINT "scan_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."self_assessments"
    ADD CONSTRAINT "self_assessments_period_id_user_id_key" UNIQUE ("period_id", "user_id");



ALTER TABLE ONLY "public"."self_assessments"
    ADD CONSTRAINT "self_assessments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_phone_number_key" UNIQUE ("phone_number");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_otp_requests_phone" ON "public"."otp_requests" USING "btree" ("phone_number");



CREATE INDEX "idx_page_views_ip_address" ON "public"."page_views" USING "btree" ("ip_address");



CREATE INDEX "idx_page_views_path" ON "public"."page_views" USING "btree" ("path");



CREATE INDEX "idx_page_views_timestamp" ON "public"."page_views" USING "btree" ("timestamp");



CREATE OR REPLACE TRIGGER "tr_enforce_complaint_rate_limit" BEFORE INSERT ON "public"."complaints" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_complaint_rate_limit"();



CREATE OR REPLACE TRIGGER "trigger_complaints_updated_at" BEFORE UPDATE ON "public"."complaints" FOR EACH ROW EXECUTE FUNCTION "public"."update_complaints_updated_at"();



ALTER TABLE ONLY "public"."admin_profiles"
    ADD CONSTRAINT "admin_profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."approver_evaluations"
    ADD CONSTRAINT "approver_evaluations_approver_id_fkey" FOREIGN KEY ("approver_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."approver_evaluations"
    ADD CONSTRAINT "approver_evaluations_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "public"."assessment_periods"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."approver_evaluations"
    ADD CONSTRAINT "approver_evaluations_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_access_logs"
    ADD CONSTRAINT "document_access_logs_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_folders"
    ADD CONSTRAINT "document_folders_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."document_folders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "public"."document_folders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."evaluations"
    ADD CONSTRAINT "evaluations_evaluator_id_fkey" FOREIGN KEY ("evaluator_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."evaluations"
    ADD CONSTRAINT "evaluations_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "public"."assessment_periods"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."evaluations"
    ADD CONSTRAINT "evaluations_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."final_scores"
    ADD CONSTRAINT "final_scores_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "public"."assessment_periods"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."final_scores"
    ADD CONSTRAINT "final_scores_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."period_members"
    ADD CONSTRAINT "period_members_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "public"."assessment_periods"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."period_members"
    ADD CONSTRAINT "period_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."public_files"
    ADD CONSTRAINT "public_files_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."report_feedbacks"
    ADD CONSTRAINT "report_feedbacks_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."report_feedbacks"
    ADD CONSTRAINT "report_feedbacks_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reporting_profiles"
    ADD CONSTRAINT "reporting_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_submitter_id_fkey" FOREIGN KEY ("submitter_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."self_assessments"
    ADD CONSTRAINT "self_assessments_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "public"."assessment_periods"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."self_assessments"
    ADD CONSTRAINT "self_assessments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can delete members" ON "public"."period_members" FOR DELETE USING ("public"."is_assessment_admin"());



CREATE POLICY "Admins can delete news" ON "public"."news_articles" FOR DELETE USING ("public"."is_admin"());



CREATE POLICY "Admins can delete periods" ON "public"."assessment_periods" FOR DELETE USING ("public"."is_assessment_admin"());



CREATE POLICY "Admins can insert members" ON "public"."period_members" FOR INSERT WITH CHECK ("public"."is_assessment_admin"());



CREATE POLICY "Admins can insert news" ON "public"."news_articles" FOR INSERT WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can insert periods" ON "public"."assessment_periods" FOR INSERT WITH CHECK ("public"."is_assessment_admin"());



CREATE POLICY "Admins can manage access logs" ON "public"."document_access_logs" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage documents" ON "public"."documents" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage folders" ON "public"."document_folders" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage personnel" ON "public"."personnel" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can update members" ON "public"."period_members" FOR UPDATE USING ("public"."is_assessment_admin"());



CREATE POLICY "Admins can update news" ON "public"."news_articles" FOR UPDATE USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can update periods" ON "public"."assessment_periods" FOR UPDATE USING ("public"."is_assessment_admin"());



CREATE POLICY "Admins can view all news" ON "public"."news_articles" FOR SELECT USING ("public"."is_admin"());



CREATE POLICY "Admins can view their own profile" ON "public"."admin_profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Admins have full access to user profiles" ON "public"."user_profiles" USING ("public"."is_assessment_admin"()) WITH CHECK ("public"."is_assessment_admin"());



CREATE POLICY "Allow anon insert to scan_requests" ON "public"."scan_requests" FOR INSERT TO "anon" WITH CHECK (true);



CREATE POLICY "Allow anon select on scan_requests" ON "public"."scan_requests" FOR SELECT TO "anon" USING (true);



CREATE POLICY "Allow anon to read complaints by tracking code" ON "public"."complaints" FOR SELECT TO "anon" USING (("tracking_code" IS NOT NULL));



CREATE POLICY "Allow anonymous users to insert complaints" ON "public"."complaints" FOR INSERT TO "anon" WITH CHECK (true);



CREATE POLICY "Allow anonymous users to insert feedbacks" ON "public"."feedbacks" FOR INSERT TO "anon" WITH CHECK (true);



CREATE POLICY "Allow authenticated admins to delete public_files" ON "public"."public_files" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated admins to insert public_files" ON "public"."public_files" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow authenticated admins to update public_files" ON "public"."public_files" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated full access to qr_codes" ON "public"."qr_codes" USING (("auth"."role"() = 'authenticated'::"text")) WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow authenticated full access to scan_requests" ON "public"."scan_requests" USING (("auth"."role"() = 'authenticated'::"text")) WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow authenticated users to insert complaints" ON "public"."complaints" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow authenticated users to update complaints" ON "public"."complaints" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to view complaints" ON "public"."complaints" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to view feedbacks" ON "public"."feedbacks" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow public read access to public_files" ON "public"."public_files" FOR SELECT USING (true);



CREATE POLICY "Approver Evaluations viewable by approver, admins" ON "public"."approver_evaluations" FOR SELECT USING ((("auth"."uid"() = "approver_id") OR "public"."is_assessment_admin"()));



CREATE POLICY "Approvers can insert evaluations if unlocked" ON "public"."approver_evaluations" FOR INSERT WITH CHECK (((("auth"."uid"() = "approver_id") AND ("public"."get_period_role"("period_id", "auth"."uid"()) = 'approver'::"public"."assessment_role")) OR "public"."is_assessment_admin"()));



CREATE POLICY "Approvers can update evaluations if unlocked" ON "public"."approver_evaluations" FOR UPDATE USING (((("auth"."uid"() = "approver_id") AND ("public"."get_period_role"("period_id", "auth"."uid"()) = 'approver'::"public"."assessment_role") AND ("is_locked" = false)) OR "public"."is_assessment_admin"())) WITH CHECK (((("auth"."uid"() = "approver_id") AND ("public"."get_period_role"("period_id", "auth"."uid"()) = 'approver'::"public"."assessment_role")) OR "public"."is_assessment_admin"()));



CREATE POLICY "Approvers can update self assessments" ON "public"."self_assessments" FOR UPDATE USING (("public"."get_period_role"("period_id", "auth"."uid"()) = 'approver'::"public"."assessment_role")) WITH CHECK (("public"."get_period_role"("period_id", "auth"."uid"()) = 'approver'::"public"."assessment_role"));



CREATE POLICY "Evaluations viewable by evaluator, approver, admins" ON "public"."evaluations" FOR SELECT USING ((("auth"."uid"() = "evaluator_id") OR "public"."is_assessment_admin"() OR ("public"."get_period_role"("period_id", "auth"."uid"()) = 'approver'::"public"."assessment_role")));



CREATE POLICY "Evaluators can insert evaluations if unlocked" ON "public"."evaluations" FOR INSERT WITH CHECK (((("auth"."uid"() = "evaluator_id") AND ("public"."get_period_role"("period_id", "auth"."uid"()) = 'evaluator'::"public"."assessment_role")) OR "public"."is_assessment_admin"()));



CREATE POLICY "Evaluators can update evaluations if unlocked" ON "public"."evaluations" FOR UPDATE USING (((("auth"."uid"() = "evaluator_id") AND ("public"."get_period_role"("period_id", "auth"."uid"()) = 'evaluator'::"public"."assessment_role") AND ("is_locked" = false)) OR ("public"."get_period_role"("period_id", "auth"."uid"()) = 'approver'::"public"."assessment_role") OR "public"."is_assessment_admin"())) WITH CHECK (((("auth"."uid"() = "evaluator_id") AND ("public"."get_period_role"("period_id", "auth"."uid"()) = 'evaluator'::"public"."assessment_role")) OR ("public"."get_period_role"("period_id", "auth"."uid"()) = 'approver'::"public"."assessment_role") OR "public"."is_assessment_admin"()));



CREATE POLICY "Federal can update submitted reports" ON "public"."reports" FOR UPDATE USING (((EXISTS ( SELECT 1
   FROM "public"."reporting_profiles" "rp"
  WHERE (("rp"."user_id" = "auth"."uid"()) AND ("rp"."hierarchy_level" = 'federal'::"text")))) AND ("status" = ANY (ARRAY['submitted_to_federal'::"text", 'accepted_by_federal'::"text"]))));



CREATE POLICY "Federal can view feedback" ON "public"."report_feedbacks" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."reporting_profiles" "rp"
  WHERE (("rp"."user_id" = "auth"."uid"()) AND ("rp"."hierarchy_level" = 'federal'::"text")))));



CREATE POLICY "Federal can view submitted reports" ON "public"."reports" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."reporting_profiles" "rp"
  WHERE (("rp"."user_id" = "auth"."uid"()) AND ("rp"."hierarchy_level" = 'federal'::"text")))) AND ("status" = ANY (ARRAY['submitted_to_federal'::"text", 'accepted_by_federal'::"text"]))));



CREATE POLICY "Members viewable by period members or admins" ON "public"."period_members" FOR SELECT USING (("public"."is_assessment_admin"() OR ("user_id" = "auth"."uid"()) OR "public"."is_period_member"("period_id")));



CREATE POLICY "Only admins or RPC can manage final scores" ON "public"."final_scores" USING ("public"."is_assessment_admin"());



CREATE POLICY "Periods can be viewed by members or admins" ON "public"."assessment_periods" FOR SELECT USING (("public"."is_assessment_admin"() OR "public"."is_period_member"("id")));



CREATE POLICY "Public can view personnel" ON "public"."personnel" FOR SELECT USING (true);



CREATE POLICY "Public can view published news" ON "public"."news_articles" FOR SELECT USING (("status" = 'Published'::"text"));



CREATE POLICY "Regions can update reports they received" ON "public"."reports" FOR UPDATE USING (((EXISTS ( SELECT 1
   FROM "public"."reporting_profiles" "rp"
  WHERE (("rp"."user_id" = "auth"."uid"()) AND ("rp"."hierarchy_level" = 'region'::"text") AND ("rp"."region_name" = "reports"."region_name")))) AND ("status" = ANY (ARRAY['submitted_to_region'::"text", 'accepted_by_region'::"text", 'submitted_to_federal'::"text"]))));



CREATE POLICY "Regions can view and update submitted reports" ON "public"."reports" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."reporting_profiles" "rp"
  WHERE (("rp"."user_id" = "auth"."uid"()) AND ("rp"."hierarchy_level" = 'region'::"text") AND ("rp"."region_name" = "reports"."region_name")))) AND ("status" = ANY (ARRAY['submitted_to_region'::"text", 'accepted_by_region'::"text", 'submitted_to_federal'::"text", 'accepted_by_federal'::"text"]))));



CREATE POLICY "Regions can view feedback" ON "public"."report_feedbacks" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."reports" "r"
     JOIN "public"."reporting_profiles" "rp" ON (("rp"."user_id" = "auth"."uid"())))
  WHERE (("r"."id" = "report_feedbacks"."report_id") AND ("rp"."hierarchy_level" = 'region'::"text") AND ("rp"."region_name" = "r"."region_name")))));



CREATE POLICY "Reviewers can insert feedback" ON "public"."report_feedbacks" FOR INSERT WITH CHECK (("auth"."uid"() = "reviewer_id"));



CREATE POLICY "Self assessments viewable by user, evaluators, approvers, admin" ON "public"."self_assessments" FOR SELECT USING ((("auth"."uid"() = "user_id") OR "public"."is_assessment_admin"() OR ("public"."get_period_role"("period_id", "auth"."uid"()) = ANY (ARRAY['evaluator'::"public"."assessment_role", 'approver'::"public"."assessment_role"]))));



CREATE POLICY "Service role full access to rate_limits" ON "public"."rate_limits" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Super admins can delete profiles" ON "public"."admin_profiles" FOR DELETE USING ("public"."is_super_admin"());



CREATE POLICY "Super admins can insert profiles" ON "public"."admin_profiles" FOR INSERT WITH CHECK ("public"."is_super_admin"());



CREATE POLICY "Super admins can update profiles" ON "public"."admin_profiles" FOR UPDATE USING ("public"."is_super_admin"());



CREATE POLICY "Super admins can view all profiles" ON "public"."admin_profiles" FOR SELECT USING ("public"."is_super_admin"());



CREATE POLICY "Users can be created by authenticated" ON "public"."users" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can be read by authenticated" ON "public"."users" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Users can insert own reporting profile" ON "public"."reporting_profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own self assessment" ON "public"."self_assessments" FOR INSERT WITH CHECK ((("auth"."uid"() = "user_id") OR "public"."is_assessment_admin"()));



CREATE POLICY "Users can manage their own reports" ON "public"."reports" USING (("auth"."uid"() = "submitter_id")) WITH CHECK (("auth"."uid"() = "submitter_id"));



CREATE POLICY "Users can read own reporting profile" ON "public"."reporting_profiles" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own reporting profile" ON "public"."reporting_profiles" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own record" ON "public"."users" FOR UPDATE USING ((("auth"."uid"() = "id") OR "public"."is_assessment_admin"()));



CREATE POLICY "Users can update their own self assessment if not locked" ON "public"."self_assessments" FOR UPDATE USING (((("auth"."uid"() = "user_id") AND ("is_locked" = false)) OR "public"."is_assessment_admin"())) WITH CHECK ((("auth"."uid"() = "user_id") OR "public"."is_assessment_admin"()));



CREATE POLICY "Users can view feedback on their reports" ON "public"."report_feedbacks" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."reports" "r"
  WHERE (("r"."id" = "report_feedbacks"."report_id") AND ("r"."submitter_id" = "auth"."uid"())))));



CREATE POLICY "Users can view own profile" ON "public"."user_profiles" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own final score" ON "public"."final_scores" FOR SELECT USING ((("auth"."uid"() = "user_id") OR "public"."is_assessment_admin"()));



ALTER TABLE "public"."admin_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."approver_evaluations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."assessment_periods" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."complaints" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."document_access_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."document_folders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."evaluations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."feedbacks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."final_scores" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."news_articles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."otp_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."page_views" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."period_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."personnel" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."public_files" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."qr_codes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."rate_limits" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."report_feedbacks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reporting_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."scan_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."self_assessments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."scan_requests";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";











































































































































































GRANT ALL ON TABLE "public"."admin_profiles" TO "anon";
GRANT ALL ON TABLE "public"."admin_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."approver_evaluations" TO "anon";
GRANT ALL ON TABLE "public"."approver_evaluations" TO "authenticated";
GRANT ALL ON TABLE "public"."approver_evaluations" TO "service_role";



GRANT ALL ON TABLE "public"."assessment_periods" TO "anon";
GRANT ALL ON TABLE "public"."assessment_periods" TO "authenticated";
GRANT ALL ON TABLE "public"."assessment_periods" TO "service_role";



GRANT ALL ON TABLE "public"."complaints" TO "anon";
GRANT ALL ON TABLE "public"."complaints" TO "authenticated";
GRANT ALL ON TABLE "public"."complaints" TO "service_role";



GRANT ALL ON TABLE "public"."document_access_logs" TO "anon";
GRANT ALL ON TABLE "public"."document_access_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."document_access_logs" TO "service_role";



GRANT ALL ON TABLE "public"."document_folders" TO "anon";
GRANT ALL ON TABLE "public"."document_folders" TO "authenticated";
GRANT ALL ON TABLE "public"."document_folders" TO "service_role";



GRANT ALL ON TABLE "public"."documents" TO "anon";
GRANT ALL ON TABLE "public"."documents" TO "authenticated";
GRANT ALL ON TABLE "public"."documents" TO "service_role";



GRANT ALL ON TABLE "public"."evaluations" TO "anon";
GRANT ALL ON TABLE "public"."evaluations" TO "authenticated";
GRANT ALL ON TABLE "public"."evaluations" TO "service_role";



GRANT ALL ON TABLE "public"."feedbacks" TO "anon";
GRANT ALL ON TABLE "public"."feedbacks" TO "authenticated";
GRANT ALL ON TABLE "public"."feedbacks" TO "service_role";



GRANT ALL ON TABLE "public"."final_scores" TO "anon";
GRANT ALL ON TABLE "public"."final_scores" TO "authenticated";
GRANT ALL ON TABLE "public"."final_scores" TO "service_role";



GRANT ALL ON TABLE "public"."news_articles" TO "anon";
GRANT ALL ON TABLE "public"."news_articles" TO "authenticated";
GRANT ALL ON TABLE "public"."news_articles" TO "service_role";



GRANT ALL ON TABLE "public"."otp_requests" TO "anon";
GRANT ALL ON TABLE "public"."otp_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."otp_requests" TO "service_role";



GRANT ALL ON TABLE "public"."page_views" TO "anon";
GRANT ALL ON TABLE "public"."page_views" TO "authenticated";
GRANT ALL ON TABLE "public"."page_views" TO "service_role";



GRANT ALL ON TABLE "public"."period_members" TO "anon";
GRANT ALL ON TABLE "public"."period_members" TO "authenticated";
GRANT ALL ON TABLE "public"."period_members" TO "service_role";



GRANT ALL ON TABLE "public"."personnel" TO "anon";
GRANT ALL ON TABLE "public"."personnel" TO "authenticated";
GRANT ALL ON TABLE "public"."personnel" TO "service_role";



GRANT ALL ON TABLE "public"."public_files" TO "anon";
GRANT ALL ON TABLE "public"."public_files" TO "authenticated";
GRANT ALL ON TABLE "public"."public_files" TO "service_role";



GRANT ALL ON TABLE "public"."qr_codes" TO "anon";
GRANT ALL ON TABLE "public"."qr_codes" TO "authenticated";
GRANT ALL ON TABLE "public"."qr_codes" TO "service_role";



GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."rate_limits" TO "anon";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."rate_limits" TO "authenticated";
GRANT ALL ON TABLE "public"."rate_limits" TO "service_role";



GRANT ALL ON TABLE "public"."report_feedbacks" TO "anon";
GRANT ALL ON TABLE "public"."report_feedbacks" TO "authenticated";
GRANT ALL ON TABLE "public"."report_feedbacks" TO "service_role";



GRANT ALL ON TABLE "public"."reporting_profiles" TO "anon";
GRANT ALL ON TABLE "public"."reporting_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."reporting_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."reports" TO "anon";
GRANT ALL ON TABLE "public"."reports" TO "authenticated";
GRANT ALL ON TABLE "public"."reports" TO "service_role";



GRANT ALL ON TABLE "public"."scan_requests" TO "anon";
GRANT ALL ON TABLE "public"."scan_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."scan_requests" TO "service_role";



GRANT ALL ON TABLE "public"."self_assessments" TO "anon";
GRANT ALL ON TABLE "public"."self_assessments" TO "authenticated";
GRANT ALL ON TABLE "public"."self_assessments" TO "service_role";



GRANT ALL ON TABLE "public"."user_profiles" TO "anon";
GRANT ALL ON TABLE "public"."user_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT UPDATE ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT UPDATE ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT UPDATE ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLES TO "service_role";































