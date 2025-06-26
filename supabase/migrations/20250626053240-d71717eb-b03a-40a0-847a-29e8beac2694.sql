
-- Enable replica identity for real-time updates
ALTER TABLE polis_votes REPLICA IDENTITY FULL;
ALTER TABLE polis_consensus_points REPLICA IDENTITY FULL;
ALTER TABLE polis_group_statement_stats REPLICA IDENTITY FULL;
ALTER TABLE polis_groups REPLICA IDENTITY FULL;
ALTER TABLE polis_polls REPLICA IDENTITY FULL;
ALTER TABLE polis_statements REPLICA IDENTITY FULL;
ALTER TABLE polis_user_group_membership REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE polis_votes;
ALTER PUBLICATION supabase_realtime ADD TABLE polis_consensus_points;
ALTER PUBLICATION supabase_realtime ADD TABLE polis_group_statement_stats;
ALTER PUBLICATION supabase_realtime ADD TABLE polis_groups;
ALTER PUBLICATION supabase_realtime ADD TABLE polis_polls;
ALTER PUBLICATION supabase_realtime ADD TABLE polis_statements;
ALTER PUBLICATION supabase_realtime ADD TABLE polis_user_group_membership;
