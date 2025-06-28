
-- Add the missing unsure_pct column to polis_group_statement_stats table
ALTER TABLE polis_group_statement_stats 
ADD COLUMN unsure_pct double precision;
