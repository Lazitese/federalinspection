-- Migration to add score_30 to final_scores and update the finalize_period_scores function

ALTER TABLE public.final_scores ADD COLUMN IF NOT EXISTS score_30 NUMERIC NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.finalize_period_scores(p_period_id UUID)
RETURNS boolean AS $$
DECLARE
  v_total_members INT;
  v_locked_self_assessments INT;
  v_locked_evaluations INT;
  v_required_evaluations INT;
  v_locked_approver_evaluations INT;
  v_required_approver_evaluations INT;
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
  
  -- Check if at least some evaluations are done (simplified check based on previous migrations)
  IF v_locked_evaluations = 0 AND v_number_of_evaluators > 0 THEN
    RAISE EXCEPTION 'Cannot finalize: Evaluations are missing.';
  END IF;

  -- Check 70-point approver evaluations
  SELECT count(*) INTO v_number_of_approvers FROM public.period_members WHERE period_id = p_period_id AND role = 'approver';
  SELECT count(*) INTO v_locked_approver_evaluations FROM public.approver_evaluations WHERE period_id = p_period_id AND is_locked = true;
  
  IF v_locked_approver_evaluations < (v_total_members - v_number_of_approvers) THEN
    RAISE EXCEPTION 'Cannot finalize: Not all approver evaluations (70 points) have been completed.';
  END IF;

  -- Calculate and insert final scores (10 + 20 + 70) and score_30 (10 + 20)
  INSERT INTO public.final_scores (user_id, period_id, score_30, final_score_100)
  SELECT 
    pm.user_id,
    p_period_id,
    (COALESCE(sa.score_10, 0) + COALESCE(le.avg_score_20, 0)) AS score_30,
    (COALESCE(sa.score_10, 0) + COALESCE(le.avg_score_20, 0) + COALESCE(ae.avg_score_70, 0)) AS final_score_100
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
  SET 
    score_30 = EXCLUDED.score_30,
    final_score_100 = EXCLUDED.final_score_100;

  -- Update period status
  UPDATE public.assessment_periods SET status = 'finalized' WHERE id = p_period_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
