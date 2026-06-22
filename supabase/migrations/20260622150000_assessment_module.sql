-- 1. Custom Enums
CREATE TYPE public.team_status AS ENUM ('active', 'finalized');
CREATE TYPE public.team_role AS ENUM ('admin', 'sebsabi', 'tsehafi', 'mktl_tsehafi', 'regular');

-- 2. Tables

-- users table (references auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number TEXT UNIQUE NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- teams table
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status public.team_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- team_members table
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role public.team_role NOT NULL DEFAULT 'regular',
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- self_assessments table
CREATE TABLE public.self_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  responses JSONB NOT NULL DEFAULT '{}',
  total_score_10 NUMERIC NOT NULL DEFAULT 0,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- leadership_evaluations table
CREATE TABLE public.leadership_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  score_20 NUMERIC NOT NULL DEFAULT 0,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(team_id, evaluator_id, target_user_id)
);

-- final_scores table
CREATE TABLE public.final_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  final_score_30 NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- 3. Grants
GRANT ALL ON TABLE public.users TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.teams TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.team_members TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.self_assessments TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.leadership_evaluations TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.final_scores TO anon, authenticated, service_role;

-- 4. RLS & Security DEFINER functions

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.self_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leadership_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.final_scores ENABLE ROW LEVEL SECURITY;

-- Helper to check if a user is an assessment admin (bypasses RLS to prevent recursion)
CREATE OR REPLACE FUNCTION public.is_assessment_admin()
RETURNS boolean AS $$
BEGIN
  -- If super_admin from existing global profiles, return true
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_super_admin') THEN
    IF public.is_super_admin() THEN RETURN true; END IF;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.team_members
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Helper to check user's role in a specific team securely
CREATE OR REPLACE FUNCTION public.get_team_role(p_team_id UUID, p_user_id UUID)
RETURNS public.team_role AS $$
  SELECT role FROM public.team_members
  WHERE team_id = p_team_id AND user_id = p_user_id
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- Users RLS
CREATE POLICY "Users can be read by authenticated" ON public.users FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can be created by authenticated" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own record" ON public.users FOR UPDATE USING (auth.uid() = id OR public.is_assessment_admin());

-- Teams RLS
CREATE POLICY "Teams can be viewed by members or admins" ON public.teams FOR SELECT USING (
  public.is_assessment_admin() OR 
  EXISTS (SELECT 1 FROM public.team_members WHERE team_id = id AND user_id = auth.uid())
);
CREATE POLICY "Admins can insert teams" ON public.teams FOR INSERT WITH CHECK (public.is_assessment_admin());
CREATE POLICY "Admins can update teams" ON public.teams FOR UPDATE USING (public.is_assessment_admin());

-- Team Members RLS
CREATE POLICY "Team members are viewable by members of the same team or admins" ON public.team_members FOR SELECT USING (
  public.is_assessment_admin() OR
  EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = public.team_members.team_id AND tm.user_id = auth.uid())
);
CREATE POLICY "Sebsabi and Admins can insert team members" ON public.team_members FOR INSERT WITH CHECK (
  public.is_assessment_admin() OR 
  public.get_team_role(team_id, auth.uid()) = 'sebsabi'
);
CREATE POLICY "Admins can update team members" ON public.team_members FOR UPDATE USING (public.is_assessment_admin());

-- Self Assessments RLS
CREATE POLICY "Self assessments are viewable by the user, admins, and evaluators" ON public.self_assessments FOR SELECT USING (
  auth.uid() = user_id OR 
  public.is_assessment_admin() OR
  public.get_team_role(team_id, auth.uid()) IN ('sebsabi', 'tsehafi', 'mktl_tsehafi')
);
CREATE POLICY "Users can insert their own self assessment" ON public.self_assessments FOR INSERT WITH CHECK (
  (auth.uid() = user_id AND is_locked = false) OR public.is_assessment_admin()
);
CREATE POLICY "Users can update their own self assessment if not locked" ON public.self_assessments FOR UPDATE USING (
  (auth.uid() = user_id AND is_locked = false) OR public.is_assessment_admin()
);

-- Leadership Evaluations RLS
CREATE POLICY "Evaluations viewable by evaluator and admins" ON public.leadership_evaluations FOR SELECT USING (
  auth.uid() = evaluator_id OR public.is_assessment_admin()
);
CREATE POLICY "Evaluators can insert evaluations if unlocked" ON public.leadership_evaluations FOR INSERT WITH CHECK (
  (auth.uid() = evaluator_id AND public.get_team_role(team_id, auth.uid()) IN ('sebsabi', 'tsehafi', 'mktl_tsehafi') AND is_locked = false) OR 
  public.is_assessment_admin()
);
CREATE POLICY "Evaluators can update evaluations if unlocked" ON public.leadership_evaluations FOR UPDATE USING (
  (auth.uid() = evaluator_id AND public.get_team_role(team_id, auth.uid()) IN ('sebsabi', 'tsehafi', 'mktl_tsehafi') AND is_locked = false) OR 
  public.is_assessment_admin()
);

-- Final Scores RLS
CREATE POLICY "Users can view their own final score" ON public.final_scores FOR SELECT USING (
  auth.uid() = user_id OR public.is_assessment_admin()
);
-- Only edge function / RPC or admin can insert/update final scores
CREATE POLICY "Only admins or RPC can manage final scores" ON public.final_scores FOR ALL USING (
  public.is_assessment_admin()
);

-- 5. RPC function to finalize team scores
CREATE OR REPLACE FUNCTION public.finalize_team_scores(p_team_id UUID)
RETURNS boolean AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
