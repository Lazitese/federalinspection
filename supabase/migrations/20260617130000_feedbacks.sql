CREATE TABLE IF NOT EXISTS feedbacks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rating TEXT NOT NULL CHECK (rating IN ('excellent', 'very-good', 'good', 'bad', 'very-bad')),
  review TEXT NOT NULL,
  sentiment TEXT NOT NULL CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts
CREATE POLICY "Allow anonymous users to insert feedbacks"
ON feedbacks
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow authenticated users (e.g. admins viewing dashboard) to read feedbacks
CREATE POLICY "Allow authenticated users to view feedbacks"
ON feedbacks
FOR SELECT
TO authenticated
USING (true);
