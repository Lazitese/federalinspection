CREATE OR REPLACE FUNCTION public.is_assessment_admin()
RETURNS boolean AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
