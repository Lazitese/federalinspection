ALTER TABLE public.admin_profiles
ADD COLUMN IF NOT EXISTS requires_password_change BOOLEAN DEFAULT true;
