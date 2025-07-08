
-- Remove the status column from polis_polls table
ALTER TABLE polis_polls DROP COLUMN IF EXISTS status;

-- Drop the enum type for poll status since we won't need it anymore
DROP TYPE IF EXISTS polis_poll_status;

-- Update RLS policies to use round-based status logic instead of poll.status
-- First, drop existing policies that reference poll.status
DROP POLICY IF EXISTS "Anyone can view active polls" ON polis_polls;
DROP POLICY IF EXISTS "Anyone can view cluster cache for active polls" ON polis_cluster_cache;
DROP POLICY IF EXISTS "Anyone can view clustering jobs for active polls" ON polis_clustering_jobs;
DROP POLICY IF EXISTS "Anyone can view clustering metrics for active polls" ON polis_clustering_metrics;
DROP POLICY IF EXISTS "Anyone can view clustering queue for active polls" ON polis_clustering_queue;
DROP POLICY IF EXISTS "Anyone can view consensus points for active polls" ON polis_consensus_points;
DROP POLICY IF EXISTS "Anyone can view group statement stats for active polls" ON polis_group_statement_stats;
DROP POLICY IF EXISTS "Anyone can view groups for active polls" ON polis_groups;
DROP POLICY IF EXISTS "Anyone can view statement weights for active polls" ON polis_statement_weights;
DROP POLICY IF EXISTS "Anyone can view group memberships for active polls" ON polis_user_group_membership;

-- Create new policies that check for published rounds instead of active poll status
CREATE POLICY "Anyone can view polls in published rounds" ON polis_polls
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM polis_rounds 
    WHERE polis_rounds.round_id = polis_polls.round_id 
    AND polis_rounds.publish_status = 'published'
  )
);

CREATE POLICY "Anyone can view cluster cache for polls in published rounds" ON polis_cluster_cache
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM polis_polls p
    JOIN polis_rounds r ON r.round_id = p.round_id
    WHERE p.poll_id = polis_cluster_cache.poll_id 
    AND r.publish_status = 'published'
  )
);

CREATE POLICY "Anyone can view clustering jobs for polls in published rounds" ON polis_clustering_jobs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM polis_polls p
    JOIN polis_rounds r ON r.round_id = p.round_id
    WHERE p.poll_id = polis_clustering_jobs.poll_id 
    AND r.publish_status = 'published'
  )
);

CREATE POLICY "Anyone can view clustering metrics for polls in published rounds" ON polis_clustering_metrics
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM polis_polls p
    JOIN polis_rounds r ON r.round_id = p.round_id
    WHERE p.poll_id = polis_clustering_metrics.poll_id 
    AND r.publish_status = 'published'
  )
);

CREATE POLICY "Anyone can view clustering queue for polls in published rounds" ON polis_clustering_queue
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM polis_polls p
    JOIN polis_rounds r ON r.round_id = p.round_id
    WHERE p.poll_id = polis_clustering_queue.poll_id 
    AND r.publish_status = 'published'
  )
);

CREATE POLICY "Anyone can view consensus points for polls in published rounds" ON polis_consensus_points
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM polis_polls p
    JOIN polis_rounds r ON r.round_id = p.round_id
    WHERE p.poll_id = polis_consensus_points.poll_id 
    AND r.publish_status = 'published'
  )
);

CREATE POLICY "Anyone can view group statement stats for polls in published rounds" ON polis_group_statement_stats
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM polis_polls p
    JOIN polis_rounds r ON r.round_id = p.round_id
    WHERE p.poll_id = polis_group_statement_stats.poll_id 
    AND r.publish_status = 'published'
  )
);

CREATE POLICY "Anyone can view groups for polls in published rounds" ON polis_groups
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM polis_polls p
    JOIN polis_rounds r ON r.round_id = p.round_id
    WHERE p.poll_id = polis_groups.poll_id 
    AND r.publish_status = 'published'
  )
);

CREATE POLICY "Anyone can view statement weights for polls in published rounds" ON polis_statement_weights
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM polis_polls p
    JOIN polis_rounds r ON r.round_id = p.round_id
    WHERE p.poll_id = polis_statement_weights.poll_id 
    AND r.publish_status = 'published'
  )
);

CREATE POLICY "Anyone can view group memberships for polls in published rounds" ON polis_user_group_membership
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM polis_polls p
    JOIN polis_rounds r ON r.round_id = p.round_id
    WHERE p.poll_id = polis_user_group_membership.poll_id 
    AND r.publish_status = 'published'
  )
);
