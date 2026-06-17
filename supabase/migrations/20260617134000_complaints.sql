CREATE TABLE IF NOT EXISTS public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  type TEXT NOT NULL CHECK (type IN ('Complaint', 'Suggestion')),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Under Review', 'Resolved', 'Rejected')),
  resolution JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Grant privileges
GRANT ALL ON TABLE public.complaints TO anon, authenticated, service_role;

-- RLS
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts
CREATE POLICY "Allow anonymous users to insert complaints"
ON public.complaints FOR INSERT
TO anon
WITH CHECK (true);

-- Allow authenticated users to view
CREATE POLICY "Allow authenticated users to view complaints"
ON public.complaints FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to update
CREATE POLICY "Allow authenticated users to update complaints"
ON public.complaints FOR UPDATE
TO authenticated
USING (true);
