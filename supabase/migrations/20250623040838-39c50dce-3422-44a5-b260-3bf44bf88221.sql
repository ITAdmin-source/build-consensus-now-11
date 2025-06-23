
-- Add poll_id column to polis_votes table to establish direct poll-vote relationship
ALTER TABLE polis_votes ADD COLUMN poll_id UUID;

-- Add foreign key constraint to link votes to polls
ALTER TABLE polis_votes ADD CONSTRAINT fk_votes_poll_id 
FOREIGN KEY (poll_id) REFERENCES polis_polls(poll_id) ON DELETE CASCADE;

-- Create index for better performance on poll_id queries
CREATE INDEX idx_polis_votes_poll_id ON polis_votes(poll_id);

-- Update existing votes to have poll_id by joining through statements
UPDATE polis_votes 
SET poll_id = polis_statements.poll_id 
FROM polis_statements 
WHERE polis_votes.statement_id = polis_statements.statement_id;

-- Make poll_id NOT NULL after updating existing records
ALTER TABLE polis_votes ALTER COLUMN poll_id SET NOT NULL;

-- Ensure vote_value enum exists and has correct values
DO $$ BEGIN
    CREATE TYPE polis_vote_value AS ENUM ('support', 'oppose', 'unsure');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update vote_value column to use the enum if not already
DO $$ BEGIN
    ALTER TABLE polis_votes ALTER COLUMN vote_value TYPE polis_vote_value USING vote_value::polis_vote_value;
EXCEPTION
    WHEN others THEN null;
END $$;
