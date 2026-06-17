-- 1. Align News Articles Schema (Safe to run, just adds columns)
ALTER TABLE public.news_articles
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS images TEXT[],
ADD COLUMN IF NOT EXISTS excerpt TEXT;

-- 2. Align Documents Schema Safely
-- Instead of dropping the table, we add the new columns required by the flat taxonomy
ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS office TEXT DEFAULT 'main',
ADD COLUMN IF NOT EXISTS main_category TEXT DEFAULT '000',
ADD COLUMN IF NOT EXISTS sub_category TEXT DEFAULT '010',
ADD COLUMN IF NOT EXISTS year TEXT DEFAULT '2026',
ADD COLUMN IF NOT EXISTS upload_date TEXT,
ADD COLUMN IF NOT EXISTS files JSONB DEFAULT '[]'::jsonb;

-- Migrate existing files into the new 'files' JSONB array
UPDATE public.documents
SET files = jsonb_build_array(
  jsonb_build_object(
    'id', id,
    'fileType', file_type,
    'name', title,
    'fileSize', file_size || ' Bytes'
  )
)
WHERE files = '[]'::jsonb AND file_type IS NOT NULL;

-- 3. We leave document_folders and document_access_logs intact for safety,
-- but the new UI will simply ignore them and use the new flat columns on `documents`.
