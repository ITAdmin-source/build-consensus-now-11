
-- Add RLS policies for anonymous users on polis_votes table

-- Enable RLS on polis_votes if not already enabled
ALTER TABLE polis_votes ENABLE ROW LEVEL SECURITY;

-- Policy to allow anonymous users to INSERT votes with session_id
CREATE POLICY "Anonymous users can insert votes with session_id" 
ON polis_votes 
FOR INSERT 
WITH CHECK (
  session_id IS NOT NULL AND user_id IS NULL
);

-- Policy to allow anonymous users to SELECT their own votes by session_id
CREATE POLICY "Anonymous users can select their own votes by session_id" 
ON polis_votes 
FOR SELECT 
USING (
  session_id IS NOT NULL AND user_id IS NULL
);

-- Policy to allow authenticated users to INSERT votes with user_id
CREATE POLICY "Authenticated users can insert votes with user_id" 
ON polis_votes 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND user_id = auth.uid()
);

-- Policy to allow authenticated users to SELECT their own votes by user_id
CREATE POLICY "Authenticated users can select their own votes by user_id" 
ON polis_votes 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND user_id = auth.uid()
);
