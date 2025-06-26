
-- Phase 1: Database Schema Enhancement

-- Create clustering jobs table to track clustering operations
CREATE TABLE polis_clustering_jobs (
  job_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES polis_polls(poll_id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed')) DEFAULT 'pending',
  algorithm_version TEXT NOT NULL DEFAULT 'v1.0',
  total_votes INTEGER NOT NULL DEFAULT 0,
  total_participants INTEGER NOT NULL DEFAULT 0,
  groups_created INTEGER DEFAULT NULL,
  consensus_points_found INTEGER DEFAULT NULL,
  processing_time_ms INTEGER DEFAULT NULL,
  error_message TEXT DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_by UUID REFERENCES auth.users(id) DEFAULT NULL
);

-- Create cluster cache table for performance optimization
CREATE TABLE polis_cluster_cache (
  cache_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES polis_polls(poll_id) ON DELETE CASCADE,
  cache_key TEXT NOT NULL, -- vote_count_hash or similar
  vote_matrix JSONB NOT NULL, -- compressed vote matrix
  cluster_results JSONB NOT NULL, -- group assignments and stats
  consensus_results JSONB NOT NULL, -- consensus points data
  opinion_space JSONB DEFAULT NULL, -- PCA coordinates for visualization
  participant_count INTEGER NOT NULL,
  vote_count INTEGER NOT NULL,
  algorithm_version TEXT NOT NULL DEFAULT 'v1.0',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '1 hour'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create clustering metrics table for algorithm performance tracking
CREATE TABLE polis_clustering_metrics (
  metric_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES polis_clustering_jobs(job_id) ON DELETE CASCADE,
  poll_id UUID NOT NULL REFERENCES polis_polls(poll_id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL, -- 'silhouette_score', 'cluster_stability', 'consensus_confidence', etc.
  metric_value NUMERIC NOT NULL,
  metadata JSONB DEFAULT NULL, -- additional metric details
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add clustering configuration fields to polls table
ALTER TABLE polis_polls ADD COLUMN IF NOT EXISTS clustering_min_groups INTEGER DEFAULT 2;
ALTER TABLE polis_polls ADD COLUMN IF NOT EXISTS clustering_max_groups INTEGER DEFAULT 5;
ALTER TABLE polis_polls ADD COLUMN IF NOT EXISTS clustering_min_participants INTEGER DEFAULT 3;
ALTER TABLE polis_polls ADD COLUMN IF NOT EXISTS clustering_cache_ttl_minutes INTEGER DEFAULT 60;
ALTER TABLE polis_polls ADD COLUMN IF NOT EXISTS clustering_batch_size INTEGER DEFAULT 100;
ALTER TABLE polis_polls ADD COLUMN IF NOT EXISTS clustering_algorithm_config JSONB DEFAULT '{"pca_dimensions": 2, "consensus_threshold": 0.7, "min_group_size": 2}';

-- Add clustering status to polls
ALTER TABLE polis_polls ADD COLUMN IF NOT EXISTS last_clustering_job_id UUID REFERENCES polis_clustering_jobs(job_id);
ALTER TABLE polis_polls ADD COLUMN IF NOT EXISTS clustering_status TEXT CHECK (clustering_status IN ('never_run', 'pending', 'running', 'completed', 'failed')) DEFAULT 'never_run';
ALTER TABLE polis_polls ADD COLUMN IF NOT EXISTS last_clustered_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_clustering_jobs_poll_status ON polis_clustering_jobs(poll_id, status);
CREATE INDEX IF NOT EXISTS idx_clustering_jobs_created_at ON polis_clustering_jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_cluster_cache_poll_key ON polis_cluster_cache(poll_id, cache_key);
CREATE INDEX IF NOT EXISTS idx_cluster_cache_expires_at ON polis_cluster_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_clustering_metrics_job ON polis_clustering_metrics(job_id);
CREATE INDEX IF NOT EXISTS idx_clustering_metrics_poll_name ON polis_clustering_metrics(poll_id, metric_name);

-- Update existing groups table to support algorithm metadata
ALTER TABLE polis_groups ADD COLUMN IF NOT EXISTS cluster_center JSONB DEFAULT NULL; -- cluster centroid coordinates
ALTER TABLE polis_groups ADD COLUMN IF NOT EXISTS silhouette_score NUMERIC DEFAULT NULL;
ALTER TABLE polis_groups ADD COLUMN IF NOT EXISTS stability_score NUMERIC DEFAULT NULL;
ALTER TABLE polis_groups ADD COLUMN IF NOT EXISTS opinion_space_coords JSONB DEFAULT NULL; -- 2D coordinates for visualization

-- Add group naming and descriptions based on clustering
ALTER TABLE polis_groups ADD COLUMN IF NOT EXISTS name TEXT DEFAULT NULL;
ALTER TABLE polis_groups ADD COLUMN IF NOT EXISTS description TEXT DEFAULT NULL;
ALTER TABLE polis_groups ADD COLUMN IF NOT EXISTS color TEXT DEFAULT NULL;
ALTER TABLE polis_groups ADD COLUMN IF NOT EXISTS member_count INTEGER DEFAULT 0;

-- Create function to clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_cluster_cache()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM polis_cluster_cache WHERE expires_at < now();
END;
$$;

-- Create function to update group member counts
CREATE OR REPLACE FUNCTION update_group_member_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update member count for the affected group(s)
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE polis_groups 
    SET member_count = (
      SELECT COUNT(*) 
      FROM polis_user_group_membership 
      WHERE group_id = NEW.group_id
    )
    WHERE group_id = NEW.group_id;
  END IF;
  
  IF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND OLD.group_id != NEW.group_id) THEN
    UPDATE polis_groups 
    SET member_count = (
      SELECT COUNT(*) 
      FROM polis_user_group_membership 
      WHERE group_id = OLD.group_id
    )
    WHERE group_id = OLD.group_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger to automatically update group member counts
DROP TRIGGER IF EXISTS update_group_member_counts_trigger ON polis_user_group_membership;
CREATE TRIGGER update_group_member_counts_trigger
  AFTER INSERT OR UPDATE OR DELETE ON polis_user_group_membership
  FOR EACH ROW EXECUTE FUNCTION update_group_member_counts();

-- Enable real-time for new tables
ALTER TABLE polis_clustering_jobs REPLICA IDENTITY FULL;
ALTER TABLE polis_cluster_cache REPLICA IDENTITY FULL;
ALTER TABLE polis_clustering_metrics REPLICA IDENTITY FULL;

-- Add new tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE polis_clustering_jobs;
ALTER PUBLICATION supabase_realtime ADD TABLE polis_cluster_cache;
ALTER PUBLICATION supabase_realtime ADD TABLE polis_clustering_metrics;
