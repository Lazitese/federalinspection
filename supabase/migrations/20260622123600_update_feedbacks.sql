-- Add category column
ALTER TABLE feedbacks ADD COLUMN IF NOT EXISTS category TEXT;

-- Drop existing constraint on rating
ALTER TABLE feedbacks DROP CONSTRAINT IF EXISTS feedbacks_rating_check;

-- Add new constraint for rating to allow both old and new values so we don't break old data
ALTER TABLE feedbacks ADD CONSTRAINT feedbacks_rating_check CHECK (
  rating IN ('excellent', 'good', 'bad', 'very-bad', 'very-good', 'needs-improvement')
);
