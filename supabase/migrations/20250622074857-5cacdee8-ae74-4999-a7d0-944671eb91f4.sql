
-- First, drop the existing primary key constraint from polis_user_group_membership
ALTER TABLE polis_user_group_membership 
DROP CONSTRAINT polis_user_group_membership_pkey;

-- Add a surrogate primary key
ALTER TABLE polis_user_group_membership 
ADD COLUMN id UUID DEFAULT gen_random_uuid() PRIMARY KEY;

-- Now make user_id nullable
ALTER TABLE polis_user_group_membership 
ALTER COLUMN user_id DROP NOT NULL;

-- Add session_id column
ALTER TABLE polis_user_group_membership 
ADD COLUMN session_id TEXT;

-- Add constraint to ensure either user_id or session_id is present
ALTER TABLE polis_user_group_membership 
ADD CONSTRAINT check_group_user_or_session 
CHECK ((user_id IS NOT NULL) OR (session_id IS NOT NULL));

-- Create unique constraints to prevent duplicates
CREATE UNIQUE INDEX idx_user_group_membership_user_poll 
ON polis_user_group_membership(user_id, poll_id) 
WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX idx_user_group_membership_session_poll 
ON polis_user_group_membership(session_id, poll_id) 
WHERE session_id IS NOT NULL;

-- Create index for session-based group membership
CREATE INDEX idx_polis_user_group_membership_session_id ON polis_user_group_membership(session_id);

-- Now update polis_votes table to support both authenticated and anonymous users
ALTER TABLE polis_votes 
ADD COLUMN session_id TEXT;

-- Make user_id nullable since anonymous users won't have it
ALTER TABLE polis_votes 
ALTER COLUMN user_id DROP NOT NULL;

-- Add constraint to ensure either user_id or session_id is present
ALTER TABLE polis_votes 
ADD CONSTRAINT check_user_or_session 
CHECK ((user_id IS NOT NULL) OR (session_id IS NOT NULL));

-- Create index for session_id lookups
CREATE INDEX idx_polis_votes_session_id ON polis_votes(session_id);
