
-- Drop the existing function and create the improved version
DROP FUNCTION IF EXISTS public.reset_poll_data(uuid);

-- Create the improved reset_poll_data function with proper permissions and return type
CREATE OR REPLACE FUNCTION public.reset_poll_data(poll_id_param uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected_rows INTEGER := 0;
  total_deleted INTEGER := 0;
BEGIN
  -- Verify the user has permission to reset this poll
  IF NOT EXISTS (
    SELECT 1 FROM polis_polls 
    WHERE poll_id = poll_id_param 
    AND (created_by = auth.uid() OR EXISTS (
      SELECT 1 FROM polis_user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'poll_admin')
    ))
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Permission denied: You can only reset polls you created or have admin privileges'
    );
  END IF;

  -- Delete in correct order to avoid foreign key conflicts
  
  -- 1. Delete consensus points
  DELETE FROM polis_consensus_points WHERE poll_id = poll_id_param;
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  total_deleted := total_deleted + affected_rows;

  -- 2. Delete group statement stats
  DELETE FROM polis_group_statement_stats WHERE poll_id = poll_id_param;
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  total_deleted := total_deleted + affected_rows;

  -- 3. Delete user group memberships
  DELETE FROM polis_user_group_membership WHERE poll_id = poll_id_param;
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  total_deleted := total_deleted + affected_rows;

  -- 4. Delete groups
  DELETE FROM polis_groups WHERE poll_id = poll_id_param;
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  total_deleted := total_deleted + affected_rows;

  -- 5. Delete cluster cache
  DELETE FROM polis_cluster_cache WHERE poll_id = poll_id_param;
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  total_deleted := total_deleted + affected_rows;

  -- 6. Delete clustering metrics
  DELETE FROM polis_clustering_metrics WHERE poll_id = poll_id_param;
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  total_deleted := total_deleted + affected_rows;

  -- 7. Delete clustering queue entries
  DELETE FROM polis_clustering_queue WHERE poll_id = poll_id_param;
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  total_deleted := total_deleted + affected_rows;

  -- 8. Delete votes (main data)
  DELETE FROM polis_votes WHERE poll_id = poll_id_param;
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  total_deleted := total_deleted + affected_rows;

  -- 9. Delete statement weights
  DELETE FROM polis_statement_weights WHERE poll_id = poll_id_param;
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  total_deleted := total_deleted + affected_rows;

  -- 10. Delete participant vectors
  DELETE FROM polis_participant_vectors WHERE poll_id = poll_id_param;
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  total_deleted := total_deleted + affected_rows;

  -- 11. Update poll metadata to clear clustering job reference BEFORE deleting jobs
  UPDATE polis_polls
  SET 
    clustering_status = 'never_run',
    last_clustered_at = NULL,
    last_clustering_job_id = NULL
  WHERE poll_id = poll_id_param;

  -- 12. Now delete clustering jobs (after clearing the foreign key reference)
  DELETE FROM polis_clustering_jobs WHERE poll_id = poll_id_param;
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  total_deleted := total_deleted + affected_rows;

  RETURN json_build_object(
    'success', true,
    'total_deleted', total_deleted,
    'message', 'Poll data reset successfully'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;
