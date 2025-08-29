-- Drop existing function first
DROP FUNCTION IF EXISTS public.get_user_poll_participation(uuid);

-- Create function to get user leaderboard ranked by points
CREATE OR REPLACE FUNCTION public.get_user_leaderboard()
RETURNS TABLE(
  user_id uuid,
  display_name text,
  avatar_url text,
  total_points integer,
  votes_count integer,
  rank_position bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(up.user_id, NULL::uuid) as user_id,
    COALESCE(prof.display_name, 'משתמש אנונימי') as display_name,
    prof.avatar_url,
    up.total_points,
    up.votes_count,
    ROW_NUMBER() OVER (ORDER BY up.total_points DESC, up.votes_count DESC) as rank_position
  FROM polis_user_points up
  LEFT JOIN polis_user_profiles prof ON prof.user_id = up.user_id
  WHERE up.user_id IS NOT NULL -- Only authenticated users
  ORDER BY up.total_points DESC, up.votes_count DESC;
END;
$$;

-- Recreate enhanced get_user_poll_participation to include completion status
CREATE OR REPLACE FUNCTION public.get_user_poll_participation(user_id_param uuid)
RETURNS TABLE(
  poll_id uuid, 
  poll_title text, 
  poll_slug text, 
  poll_status polis_poll_status, 
  vote_count bigint, 
  first_vote_at timestamp with time zone, 
  last_vote_at timestamp with time zone,
  total_statements bigint,
  is_completed boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.poll_id,
    p.title as poll_title,
    p.slug as poll_slug,
    p.status as poll_status,
    COUNT(v.vote_id) as vote_count,
    MIN(v.voted_at) as first_vote_at,
    MAX(v.voted_at) as last_vote_at,
    (SELECT COUNT(*) FROM polis_statements WHERE poll_id = p.poll_id) as total_statements,
    (COUNT(DISTINCT v.statement_id) = (SELECT COUNT(*) FROM polis_statements WHERE poll_id = p.poll_id)) as is_completed
  FROM polis_polls p
  INNER JOIN polis_votes v ON p.poll_id = v.poll_id
  WHERE v.user_id = user_id_param
  GROUP BY p.poll_id, p.title, p.slug, p.status
  ORDER BY MAX(v.voted_at) DESC;
END;
$$;