
-- Update the clustering function to use poll-specific consensus thresholds
CREATE OR REPLACE FUNCTION public.trigger_clustering_and_consensus(poll_id_param uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  vote_count INTEGER;
  participant_count INTEGER;
  poll_min_support_pct FLOAT;
  poll_max_opposition_pct FLOAT;
BEGIN
  -- Get vote statistics
  SELECT 
    COUNT(*) as votes,
    COUNT(DISTINCT COALESCE(session_id, user_id::text)) as participants
  INTO vote_count, participant_count
  FROM polis_votes 
  WHERE poll_id = poll_id_param;

  -- Only cluster if we have enough participants
  IF participant_count < 2 THEN
    RETURN;
  END IF;

  -- Get the poll's consensus thresholds
  SELECT min_support_pct, max_opposition_pct
  INTO poll_min_support_pct, poll_max_opposition_pct
  FROM polis_polls
  WHERE poll_id = poll_id_param;

  -- Use default values if not found
  IF poll_min_support_pct IS NULL THEN
    poll_min_support_pct := 50;
  END IF;
  IF poll_max_opposition_pct IS NULL THEN
    poll_max_opposition_pct := 50;
  END IF;

  -- Delete existing groups and memberships for this poll to start fresh
  DELETE FROM polis_user_group_membership WHERE poll_id = poll_id_param;
  DELETE FROM polis_group_statement_stats WHERE poll_id = poll_id_param;
  DELETE FROM polis_consensus_points WHERE poll_id = poll_id_param;
  DELETE FROM polis_groups WHERE poll_id = poll_id_param;

  -- Create exactly 2 groups
  INSERT INTO polis_groups (poll_id, algorithm) VALUES 
    (poll_id_param, 'k-means'),
    (poll_id_param, 'k-means');

  -- Get the group IDs we just created
  WITH group_ids AS (
    SELECT 
      group_id,
      ROW_NUMBER() OVER (ORDER BY group_id) as group_rank
    FROM polis_groups 
    WHERE poll_id = poll_id_param
  ),
  vote_matrix AS (
    SELECT 
      COALESCE(session_id, user_id::text) as session_id,
      statement_id,
      CASE 
        WHEN vote_value = 'support' THEN 1
        WHEN vote_value = 'oppose' THEN -1
        ELSE 0
      END as vote_numeric
    FROM polis_votes 
    WHERE poll_id = poll_id_param
  ),
  user_vote_summary AS (
    SELECT 
      session_id,
      AVG(vote_numeric) as avg_vote
    FROM vote_matrix
    GROUP BY session_id
  )
  INSERT INTO polis_user_group_membership (poll_id, session_id, group_id)
  SELECT 
    poll_id_param,
    uvs.session_id,
    CASE 
      WHEN uvs.avg_vote >= 0 THEN (SELECT group_id FROM group_ids WHERE group_rank = 1)
      ELSE (SELECT group_id FROM group_ids WHERE group_rank = 2)
    END as group_id
  FROM user_vote_summary uvs;

  -- Calculate group statement stats
  WITH group_vote_stats AS (
    SELECT 
      ugm.group_id,
      v.statement_id,
      COUNT(*) as total_votes,
      COUNT(CASE WHEN v.vote_value = 'support' THEN 1 END) as support_count,
      COUNT(CASE WHEN v.vote_value = 'oppose' THEN 1 END) as oppose_count
    FROM polis_user_group_membership ugm
    JOIN polis_votes v ON ugm.session_id = COALESCE(v.session_id, v.user_id::text)
      AND ugm.poll_id = v.poll_id
    WHERE ugm.poll_id = poll_id_param
    GROUP BY ugm.group_id, v.statement_id
  )
  INSERT INTO polis_group_statement_stats (group_id, statement_id, poll_id, support_pct, oppose_pct, total_votes)
  SELECT 
    group_id,
    statement_id,
    poll_id_param,
    CASE WHEN total_votes > 0 THEN (support_count::float / total_votes * 100) ELSE 0 END,
    CASE WHEN total_votes > 0 THEN (oppose_count::float / total_votes * 100) ELSE 0 END,
    total_votes
  FROM group_vote_stats;

  -- Consensus detection using poll-specific thresholds
  WITH consensus_candidates AS (
    SELECT 
      statement_id,
      COUNT(*) as group_count,
      COUNT(CASE WHEN support_pct >= poll_min_support_pct AND oppose_pct <= poll_max_opposition_pct THEN 1 END) as consensus_groups
    FROM polis_group_statement_stats
    WHERE poll_id = poll_id_param AND total_votes > 0
    GROUP BY statement_id
  )
  INSERT INTO polis_consensus_points (statement_id, poll_id)
  SELECT statement_id, poll_id_param
  FROM consensus_candidates
  WHERE group_count = consensus_groups AND group_count > 0;

END;
$function$;

-- Re-run clustering for the hightech poll to apply the correct thresholds
SELECT trigger_clustering_and_consensus('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
