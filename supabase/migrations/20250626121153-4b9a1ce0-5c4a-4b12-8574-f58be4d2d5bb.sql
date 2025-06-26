
-- Add DELETE policies for polis_consensus_points
CREATE POLICY "Poll creators and super admins can delete consensus points" 
ON polis_consensus_points 
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM polis_polls 
    WHERE polis_polls.poll_id = polis_consensus_points.poll_id 
    AND polis_polls.created_by = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM polis_user_roles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);

-- Add DELETE policies for polis_group_statement_stats
CREATE POLICY "Poll creators and super admins can delete group statement stats" 
ON polis_group_statement_stats 
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM polis_polls 
    WHERE polis_polls.poll_id = polis_group_statement_stats.poll_id 
    AND polis_polls.created_by = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM polis_user_roles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);

-- Add DELETE policies for polis_user_group_membership
CREATE POLICY "Poll creators and super admins can delete user group memberships" 
ON polis_user_group_membership 
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM polis_polls 
    WHERE polis_polls.poll_id = polis_user_group_membership.poll_id 
    AND polis_polls.created_by = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM polis_user_roles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);

-- Add DELETE policies for polis_groups
CREATE POLICY "Poll creators and super admins can delete groups" 
ON polis_groups 
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM polis_polls 
    WHERE polis_polls.poll_id = polis_groups.poll_id 
    AND polis_polls.created_by = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM polis_user_roles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);

-- Add DELETE policies for polis_cluster_cache
CREATE POLICY "Poll creators and super admins can delete cluster cache" 
ON polis_cluster_cache 
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM polis_polls 
    WHERE polis_polls.poll_id = polis_cluster_cache.poll_id 
    AND polis_polls.created_by = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM polis_user_roles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);

-- Add DELETE policies for polis_clustering_metrics
CREATE POLICY "Poll creators and super admins can delete clustering metrics" 
ON polis_clustering_metrics 
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM polis_polls 
    WHERE polis_polls.poll_id = polis_clustering_metrics.poll_id 
    AND polis_polls.created_by = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM polis_user_roles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);

-- Add DELETE policies for polis_clustering_jobs
CREATE POLICY "Poll creators and super admins can delete clustering jobs" 
ON polis_clustering_jobs 
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM polis_polls 
    WHERE polis_polls.poll_id = polis_clustering_jobs.poll_id 
    AND polis_polls.created_by = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM polis_user_roles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);

-- Add DELETE policies for polis_votes
CREATE POLICY "Poll creators and super admins can delete votes" 
ON polis_votes 
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM polis_polls 
    WHERE polis_polls.poll_id = polis_votes.poll_id 
    AND polis_polls.created_by = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM polis_user_roles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);
