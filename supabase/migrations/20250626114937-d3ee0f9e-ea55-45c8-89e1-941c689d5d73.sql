
-- Enable RLS on clustering tables
ALTER TABLE public.polis_clustering_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polis_cluster_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polis_clustering_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for polis_clustering_jobs table
CREATE POLICY "Anyone can view clustering jobs for active polls" 
ON polis_clustering_jobs 
FOR SELECT 
TO public 
USING (
  EXISTS (
    SELECT 1 FROM polis_polls 
    WHERE polis_polls.poll_id = polis_clustering_jobs.poll_id 
    AND polis_polls.status = 'active'
  )
);

-- Create RLS policies for polis_cluster_cache table
CREATE POLICY "Anyone can view cluster cache for active polls" 
ON polis_cluster_cache 
FOR SELECT 
TO public 
USING (
  EXISTS (
    SELECT 1 FROM polis_polls 
    WHERE polis_polls.poll_id = polis_cluster_cache.poll_id 
    AND polis_polls.status = 'active'
  )
);

-- Create RLS policies for polis_clustering_metrics table
CREATE POLICY "Anyone can view clustering metrics for active polls" 
ON polis_clustering_metrics 
FOR SELECT 
TO public 
USING (
  EXISTS (
    SELECT 1 FROM polis_polls 
    WHERE polis_polls.poll_id = polis_clustering_metrics.poll_id 
    AND polis_polls.status = 'active'
  )
);
