DROP POLICY IF EXISTS "Members viewable by period members or admins" ON public.period_members;

CREATE POLICY "Members viewable by period members or admins" ON public.period_members FOR SELECT USING (
  public.is_assessment_admin() OR
  user_id = auth.uid() OR 
  public.is_period_member(period_id)
);
