
-- Add more_info column to polis_statements table
ALTER TABLE polis_statements 
ADD COLUMN more_info TEXT;

-- Add comment to document the purpose of the field
COMMENT ON COLUMN polis_statements.more_info IS 'Optional additional information to help participants make informed voting decisions';
