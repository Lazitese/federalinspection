-- Drop NOT NULL constraints on deprecated columns in documents table
-- so that new UI uploads (which use flat taxonomy) can insert without errors
ALTER TABLE public.documents ALTER COLUMN folder_id DROP NOT NULL;
ALTER TABLE public.documents ALTER COLUMN storage_path DROP NOT NULL;
ALTER TABLE public.documents ALTER COLUMN file_type DROP NOT NULL;
ALTER TABLE public.documents ALTER COLUMN file_size DROP NOT NULL;
