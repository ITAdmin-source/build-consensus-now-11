
-- Update the clustering trigger to call external microservice instead of Edge Function
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
  microservice_url TEXT;
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

  -- Get microservice URL from system settings
  SELECT setting_value INTO microservice_url
  FROM polis_system_settings
  WHERE setting_key = 'clustering_microservice_url';

  -- If no microservice URL is configured, log and return
  IF microservice_url IS NULL THEN
    RAISE NOTICE 'No clustering microservice URL configured. Skipping clustering.';
    RETURN;
  END IF;

  -- Call the clustering microservice asynchronously
  PERFORM net.http_post(
    url := microservice_url || '/cluster',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || COALESCE(
        (SELECT setting_value FROM polis_system_settings WHERE setting_key = 'clustering_microservice_token'),
        'default-token'
      )
    ),
    body := jsonb_build_object(
      'poll_id', poll_id_param,
      'force_recalculate', false,
      'supabase_url', 'https://reuddlnprvkpgiirxqhr.supabase.co',
      'supabase_key', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJldWRkbG5wcnZrcGdpaXJ4cWhyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzcyOTkwNSwiZXhwIjoyMDYzMzA1OTA1fQ.LI6NxzP3jULqhm0rYLQbJk8K_vINgXUTGOvjkUf3Q7A'
    )
  );

  -- Log the HTTP request for debugging
  RAISE NOTICE 'Triggered clustering microservice for poll % at URL %', poll_id_param, microservice_url;
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error calling clustering microservice: %', SQLERRM;
END;
$$;

-- Add system settings for microservice configuration
INSERT INTO polis_system_settings (setting_key, setting_value, setting_type, description) 
VALUES 
  ('clustering_microservice_url', 'http://localhost:8000', 'string', 'URL of the clustering microservice'),
  ('clustering_microservice_token', 'secure-token-123', 'string', 'Authentication token for the microservice')
ON CONFLICT (setting_key) DO UPDATE SET 
  setting_value = EXCLUDED.setting_value,
  description = EXCLUDED.description;

-- Add a table for microservice job queue management
CREATE TABLE IF NOT EXISTS polis_clustering_queue (
  queue_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL,
  priority INTEGER DEFAULT 5,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);

-- Add index for efficient queue processing
CREATE INDEX IF NOT EXISTS idx_clustering_queue_status_priority ON polis_clustering_queue(status, priority DESC, created_at ASC);
