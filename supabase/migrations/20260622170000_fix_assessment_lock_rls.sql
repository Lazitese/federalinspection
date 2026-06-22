-- Fix RLS policies to allow updating 'is_locked' to true

-- Self Assessments RLS (10 Points)
DROP POLICY IF EXISTS "Users can insert their own self assessment" ON public.self_assessments;
DROP POLICY IF EXISTS "Users can update their own self assessment if not locked" ON public.self_assessments;

CREATE POLICY "Users can insert their own self assessment" ON public.self_assessments FOR INSERT WITH CHECK (
  auth.uid() = user_id OR public.is_assessment_admin()
);
CREATE POLICY "Users can update their own self assessment if not locked" ON public.self_assessments FOR UPDATE USING (
  (auth.uid() = user_id AND is_locked = false) OR public.is_assessment_admin()
) WITH CHECK (
  auth.uid() = user_id OR public.is_assessment_admin()
);

-- Evaluations RLS (20 Points)
DROP POLICY IF EXISTS "Evaluators can insert evaluations if unlocked" ON public.evaluations;
DROP POLICY IF EXISTS "Evaluators can update evaluations if unlocked" ON public.evaluations;

CREATE POLICY "Evaluators can insert evaluations if unlocked" ON public.evaluations FOR INSERT WITH CHECK (
  (auth.uid() = evaluator_id AND public.get_period_role(period_id, auth.uid()) = 'evaluator') OR 
  public.is_assessment_admin()
);
CREATE POLICY "Evaluators can update evaluations if unlocked" ON public.evaluations FOR UPDATE USING (
  (auth.uid() = evaluator_id AND public.get_period_role(period_id, auth.uid()) = 'evaluator' AND is_locked = false) OR 
  (public.get_period_role(period_id, auth.uid()) = 'approver') OR 
  public.is_assessment_admin()
) WITH CHECK (
  (auth.uid() = evaluator_id AND public.get_period_role(period_id, auth.uid()) = 'evaluator') OR 
  (public.get_period_role(period_id, auth.uid()) = 'approver') OR 
  public.is_assessment_admin()
);

-- Approver Evaluations RLS (70 Points)
DROP POLICY IF EXISTS "Approvers can insert evaluations if unlocked" ON public.approver_evaluations;
DROP POLICY IF EXISTS "Approvers can update evaluations if unlocked" ON public.approver_evaluations;

CREATE POLICY "Approvers can insert evaluations if unlocked" ON public.approver_evaluations FOR INSERT WITH CHECK (
  (auth.uid() = approver_id AND public.get_period_role(period_id, auth.uid()) = 'approver') OR 
  public.is_assessment_admin()
);
CREATE POLICY "Approvers can update evaluations if unlocked" ON public.approver_evaluations FOR UPDATE USING (
  (auth.uid() = approver_id AND public.get_period_role(period_id, auth.uid()) = 'approver' AND is_locked = false) OR 
  public.is_assessment_admin()
) WITH CHECK (
  (auth.uid() = approver_id AND public.get_period_role(period_id, auth.uid()) = 'approver') OR 
  public.is_assessment_admin()
);
