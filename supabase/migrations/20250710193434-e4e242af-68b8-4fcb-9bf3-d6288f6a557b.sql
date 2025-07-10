
-- Enable replica identity for real-time updates on polis_user_points
ALTER TABLE polis_user_points REPLICA IDENTITY FULL;

-- Add polis_user_points table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE polis_user_points;
