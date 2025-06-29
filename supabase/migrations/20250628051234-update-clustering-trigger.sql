
-- Update the clustering trigger to call the advanced clustering-engine
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
     (last_job_status = 'completed' AND job_age_minutes < 2) THEN
    RETURN;
  END IF;

  -- Update poll status to indicate clustering is needed
  UPDATE polis_polls
  SET clustering_status = 'pending'
  WHERE poll_id = poll_id_param;

  -- Call the advanced clustering-engine Edge Function
  PERFORM net.http_post(
    url := 'https://reuddlnprvkpgiirxqhr.supabase.co/functions/v1/clustering-engine',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJldWRkbG5wcnZrcGdpaXJ4cWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3Mjk5MDUsImV4cCI6MjA2MzMwNTkwNX0.50JCjMuJ6WRQcrNjojqlpYUqdlVOVaDIgoI3lp1nBEs'
    ),
    body := jsonb_build_object(
      'poll_id', poll_id_param,
      'force_recalculate', false
    )
  );

  -- Log for debugging
  RAISE NOTICE 'Triggered advanced clustering-engine for poll %', poll_id_param;
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error calling clustering-engine: %', SQLERRM;
END;
$$;
