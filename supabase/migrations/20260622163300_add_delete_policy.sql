-- Add DELETE policy for assessment_periods
CREATE POLICY "Admins can delete periods" 
ON public.assessment_periods 
FOR DELETE 
USING (public.is_assessment_admin());
