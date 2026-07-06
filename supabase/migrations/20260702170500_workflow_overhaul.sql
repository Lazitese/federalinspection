-- Modify complaints table
ALTER TABLE public.complaints 
  ADD COLUMN IF NOT EXISTS group_members TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS assigned_committee TEXT,
  ADD COLUMN IF NOT EXISTS service_name TEXT;

-- Modify feedbacks table
ALTER TABLE public.feedbacks
  ADD COLUMN IF NOT EXISTS region public.ethiopia_region,
  ADD COLUMN IF NOT EXISTS sector TEXT;
