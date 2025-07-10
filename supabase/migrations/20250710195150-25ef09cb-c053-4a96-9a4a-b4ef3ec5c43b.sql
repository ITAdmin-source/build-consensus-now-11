
-- Recalculate and update polis_user_points based on existing votes in polis_votes
WITH vote_counts AS (
  SELECT 
    user_id,
    session_id,
    COUNT(*) as total_votes
  FROM polis_votes
  GROUP BY user_id, session_id
),
user_points_data AS (
  SELECT 
    user_id,
    session_id,
    total_votes as votes_count,
    total_votes as total_points -- 1 point per vote
  FROM vote_counts
)
INSERT INTO polis_user_points (user_id, session_id, total_points, votes_count, last_updated)
SELECT 
  user_id,
  session_id,
  total_points,
  votes_count,
  now()
FROM user_points_data
ON CONFLICT (user_id) 
DO UPDATE SET 
  total_points = EXCLUDED.total_points,
  votes_count = EXCLUDED.votes_count,
  last_updated = now()
WHERE polis_user_points.user_id IS NOT NULL
ON CONFLICT (session_id)
DO UPDATE SET 
  total_points = EXCLUDED.total_points,
  votes_count = EXCLUDED.votes_count,
  last_updated = now()
WHERE polis_user_points.session_id IS NOT NULL;

-- Also handle any orphaned records by cleaning up points for users/sessions with no votes
DELETE FROM polis_user_points 
WHERE (user_id IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM polis_votes WHERE polis_votes.user_id = polis_user_points.user_id
)) OR (session_id IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM polis_votes WHERE polis_votes.session_id = polis_user_points.session_id
));
