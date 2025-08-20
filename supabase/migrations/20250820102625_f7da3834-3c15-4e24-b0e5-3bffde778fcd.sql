-- Add minimum statements voted to end column to polis_polls table
ALTER TABLE polis_polls 
ADD COLUMN min_statements_voted_to_end integer NOT NULL DEFAULT 5;

-- Update existing polls to have the default value
UPDATE polis_polls 
SET min_statements_voted_to_end = 5 
WHERE min_statements_voted_to_end IS NULL;