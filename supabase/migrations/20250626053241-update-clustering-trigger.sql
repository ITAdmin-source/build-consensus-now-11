
-- Update the existing clustering trigger to call the Edge Function asynchronously
CREATE OR REPLACE FUNCTION trigger_clustering_and_consensus(poll_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  vote_count INTEGER;
  participant_count INTEGER;
  last_job_status TEXT;
  job_age_minutes INTEGER;
BEGIN
  -- Get vote statistics
  SELECT 
    COUNT(*) as votes,
    COUNT(DISTINCT COALESCE(session_id, user_id::text)) as participants
  INTO vote_count, participant_count
  FROM polis_votes 
  WHERE poll_id = poll_id_param;

  -- Only trigger clustering if we have enough participants
  IF participant_count < 2 THEN
    RETURN;
  END IF;

  -- Check if there's already a recent clustering job running
  SELECT 
    status,
    EXTRACT(EPOCH FROM (now() - created_at))/60 as age_minutes
  INTO last_job_status, job_age_minutes
  FROM polis_clustering_jobs
  WHERE poll_id = poll_id_param
  ORDER BY created_at DESC
  LIMIT 1;

  -- Don't start new job if one is already running or recently completed
  IF last_job_status = 'running' OR 
     (last_job_status = 'completed' AND job_age_minutes < 5) THEN
    RETURN;
  END IF;

  -- Update poll status to indicate clustering is needed
  UPDATE polis_polls
  SET clustering_status = 'pending'
  WHERE poll_id = poll_id_param;

  -- The actual clustering will be triggered by the Edge Function
  -- We could add a notification here to trigger the Edge Function externally
  -- For now, we rely on periodic or manual triggering of the clustering Edge Function
  
END;
$$;
