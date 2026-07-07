-- Migration to add DELETE policy for period_members
CREATE POLICY "Admins can delete members" ON public.period_members FOR DELETE USING (public.is_assessment_admin());
