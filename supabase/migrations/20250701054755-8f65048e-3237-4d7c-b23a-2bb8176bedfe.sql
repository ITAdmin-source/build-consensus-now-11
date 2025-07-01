
-- Create the reset_poll_data function to safely delete all poll-related data
CREATE OR REPLACE FUNCTION public.reset_poll_data(poll_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete all poll-related data in the correct order to avoid foreign key conflicts
  
  -- 1. Delete consensus points
  DELETE FROM polis_consensus_points WHERE poll_id = poll_id_param;
  
  -- 2. Delete group statement stats
  DELETE FROM polis_group_statement_stats WHERE poll_id = poll_id_param;
  
  -- 3. Delete user group memberships
  DELETE FROM polis_user_group_membership WHERE poll_id = poll_id_param;
  
  -- 4. Delete groups
  DELETE FROM polis_groups WHERE poll_id = poll_id_param;
  
  -- 5. Delete cluster cache
  DELETE FROM polis_cluster_cache WHERE poll_id = poll_id_param;
  
  -- 6. Delete clustering metrics
  DELETE FROM polis_clustering_metrics WHERE poll_id = poll_id_param;
  
  -- 7. Delete clustering jobs
  DELETE FROM polis_clustering_jobs WHERE poll_id = poll_id_param;
  
  -- 8. Delete clustering queue entries
  DELETE FROM polis_clustering_queue WHERE poll_id = poll_id_param;
  
  -- 9. Delete votes (core data)
  DELETE FROM polis_votes WHERE poll_id = poll_id_param;
  
  -- 10. Update poll metadata to reset clustering status
  UPDATE polis_polls 
  SET 
    clustering_status = 'never_run',
    last_clustered_at = NULL,
    last_clustering_job_id = NULL
  WHERE poll_id = poll_id_param;
END;
$$;
