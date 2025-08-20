-- Add voting_goal column to polis_polls table
ALTER TABLE polis_polls 
ADD COLUMN voting_goal INTEGER NOT NULL DEFAULT 1000;