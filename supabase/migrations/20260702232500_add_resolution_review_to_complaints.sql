-- Add dedicated satisfaction rating and review for complaint resolutions
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS resolution_rating INTEGER;
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS resolution_feedback TEXT;
