
-- Add INSERT policies for polis_groups
CREATE POLICY "Service role and poll creators can insert groups" 
ON polis_groups 
FOR INSERT 
TO authenticated, service_role
WITH CHECK (
  -- Always allow service role (for Edge Functions)
  auth.role() = 'service_role' OR
  -- Allow poll creators
  EXISTS (
    SELECT 1 FROM polis_polls 
    WHERE polis_polls.poll_id = polis_groups.poll_id 
    AND polis_polls.created_by = auth.uid()
  ) OR
  -- Allow super admins
  EXISTS (
    SELECT 1 FROM polis_user_roles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);

-- Add UPDATE policies for polis_groups
CREATE POLICY "Service role and poll creators can update groups" 
ON polis_groups 
FOR UPDATE 
TO authenticated, service_role
USING (
  -- Always allow service role (for Edge Functions)
  auth.role() = 'service_role' OR
  -- Allow poll creators
  EXISTS (
    SELECT 1 FROM polis_polls 
    WHERE polis_polls.poll_id = polis_groups.poll_id 
    AND polis_polls.created_by = auth.uid()
  ) OR
  -- Allow super admins
  EXISTS (
    SELECT 1 FROM polis_user_roles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);

-- Add INSERT policies for polis_user_group_membership
CREATE POLICY "Service role and poll creators can insert user group memberships" 
ON polis_user_group_membership 
FOR INSERT 
TO authenticated, service_role
WITH CHECK (
  -- Always allow service role (for Edge Functions)
  auth.role() = 'service_role' OR
  -- Allow poll creators
  EXISTS (
    SELECT 1 FROM polis_polls 
    WHERE polis_polls.poll_id = polis_user_group_membership.poll_id 
    AND polis_polls.created_by = auth.uid()
  ) OR
  -- Allow super admins
  EXISTS (
    SELECT 1 FROM polis_user_roles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);

-- Add UPDATE policies for polis_user_group_membership
CREATE POLICY "Service role and poll creators can update user group memberships" 
ON polis_user_group_membership 
FOR UPDATE 
TO authenticated, service_role
USING (
  -- Always allow service role (for Edge Functions)
  auth.role() = 'service_role' OR
  -- Allow poll creators
  EXISTS (
    SELECT 1 FROM polis_polls 
    WHERE polis_polls.poll_id = polis_user_group_membership.poll_id 
    AND polis_polls.created_by = auth.uid()
  ) OR
  -- Allow super admins
  EXISTS (
    SELECT 1 FROM polis_user_roles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);

-- Add INSERT policies for polis_group_statement_stats
CREATE POLICY "Service role and poll creators can insert group statement stats" 
ON polis_group_statement_stats 
FOR INSERT 
TO authenticated, service_role
WITH CHECK (
  -- Always allow service role (for Edge Functions)
  auth.role() = 'service_role' OR
  -- Allow poll creators
  EXISTS (
    SELECT 1 FROM polis_polls 
    WHERE polis_polls.poll_id = polis_group_statement_stats.poll_id 
    AND polis_polls.created_by = auth.uid()
  ) OR
  -- Allow super admins
  EXISTS (
    SELECT 1 FROM polis_user_roles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);

-- Add UPDATE policies for polis_group_statement_stats
CREATE POLICY "Service role and poll creators can update group statement stats" 
ON polis_group_statement_stats 
FOR UPDATE 
TO authenticated, service_role
USING (
  -- Always allow service role (for Edge Functions)
  auth.role() = 'service_role' OR
  -- Allow poll creators
  EXISTS (
    SELECT 1 FROM polis_polls 
    WHERE polis_polls.poll_id = polis_group_statement_stats.poll_id 
    AND polis_polls.created_by = auth.uid()
  ) OR
  -- Allow super admins
  EXISTS (
    SELECT 1 FROM polis_user_roles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);

-- Add INSERT policies for polis_consensus_points
CREATE POLICY "Service role and poll creators can insert consensus points" 
ON polis_consensus_points 
FOR INSERT 
TO authenticated, service_role
WITH CHECK (
  -- Always allow service role (for Edge Functions)
  auth.role() = 'service_role' OR
  -- Allow poll creators
  EXISTS (
    SELECT 1 FROM polis_polls 
    WHERE polis_polls.poll_id = polis_consensus_points.poll_id 
    AND polis_polls.created_by = auth.uid()
  ) OR
  -- Allow super admins
  EXISTS (
    SELECT 1 FROM polis_user_roles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);

-- Add UPDATE policies for polis_consensus_points
CREATE POLICY "Service role and poll creators can update consensus points" 
ON polis_consensus_points 
FOR UPDATE 
TO authenticated, service_role
USING (
  -- Always allow service role (for Edge Functions)
  auth.role() = 'service_role' OR
  -- Allow poll creators
  EXISTS (
    SELECT 1 FROM polis_polls 
    WHERE polis_polls.poll_id = polis_consensus_points.poll_id 
    AND polis_polls.created_by = auth.uid()
  ) OR
  -- Allow super admins
  EXISTS (
    SELECT 1 FROM polis_user_roles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);

-- Add INSERT policies for polis_clustering_jobs
CREATE POLICY "Service role and poll creators can insert clustering jobs" 
ON polis_clustering_jobs 
FOR INSERT 
TO authenticated, service_role
WITH CHECK (
  -- Always allow service role (for Edge Functions)
  auth.role() = 'service_role' OR
  -- Allow poll creators
  EXISTS (
    SELECT 1 FROM polis_polls 
    WHERE polis_polls.poll_id = polis_clustering_jobs.poll_id 
    AND polis_polls.created_by = auth.uid()
  ) OR
  -- Allow super admins
  EXISTS (
    SELECT 1 FROM polis_user_roles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);

-- Add UPDATE policies for polis_clustering_jobs
CREATE POLICY "Service role and poll creators can update clustering jobs" 
ON polis_clustering_jobs 
FOR UPDATE 
TO authenticated, service_role
USING (
  -- Always allow service role (for Edge Functions)
  auth.role() = 'service_role' OR
  -- Allow poll creators
  EXISTS (
    SELECT 1 FROM polis_polls 
    WHERE polis_polls.poll_id = polis_clustering_jobs.poll_id 
    AND polis_polls.created_by = auth.uid()
  ) OR
  -- Allow super admins
  EXISTS (
    SELECT 1 FROM polis_user_roles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);

-- Add INSERT policies for polis_cluster_cache
CREATE POLICY "Service role and poll creators can insert cluster cache" 
ON polis_cluster_cache 
FOR INSERT 
TO authenticated, service_role
WITH CHECK (
  -- Always allow service role (for Edge Functions)
  auth.role() = 'service_role' OR
  -- Allow poll creators
  EXISTS (
    SELECT 1 FROM polis_polls 
    WHERE polis_polls.poll_id = polis_cluster_cache.poll_id 
    AND polis_polls.created_by = auth.uid()
  ) OR
  -- Allow super admins
  EXISTS (
    SELECT 1 FROM polis_user_roles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);

-- Add UPDATE policies for polis_cluster_cache
CREATE POLICY "Service role and poll creators can update cluster cache" 
ON polis_cluster_cache 
FOR UPDATE 
TO authenticated, service_role
USING (
  -- Always allow service role (for Edge Functions)
  auth.role() = 'service_role' OR
  -- Allow poll creators
  EXISTS (
    SELECT 1 FROM polis_polls 
    WHERE polis_polls.poll_id = polis_cluster_cache.poll_id 
    AND polis_polls.created_by = auth.uid()
  ) OR
  -- Allow super admins
  EXISTS (
    SELECT 1 FROM polis_user_roles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);

-- Add INSERT policies for polis_clustering_metrics
CREATE POLICY "Service role and poll creators can insert clustering metrics" 
ON polis_clustering_metrics 
FOR INSERT 
TO authenticated, service_role
WITH CHECK (
  -- Always allow service role (for Edge Functions)
  auth.role() = 'service_role' OR
  -- Allow poll creators
  EXISTS (
    SELECT 1 FROM polis_polls 
    WHERE polis_polls.poll_id = polis_clustering_metrics.poll_id 
    AND polis_polls.created_by = auth.uid()
  ) OR
  -- Allow super admins
  EXISTS (
    SELECT 1 FROM polis_user_roles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);

-- Add UPDATE policies for polis_clustering_metrics
CREATE POLICY "Service role and poll creators can update clustering metrics" 
ON polis_clustering_metrics 
FOR UPDATE 
TO authenticated, service_role
USING (
  -- Always allow service role (for Edge Functions)
  auth.role() = 'service_role' OR
  -- Allow poll creators
  EXISTS (
    SELECT 1 FROM polis_polls 
    WHERE polis_polls.poll_id = polis_clustering_metrics.poll_id 
    AND polis_polls.created_by = auth.uid()
  ) OR
  -- Allow super admins
  EXISTS (
    SELECT 1 FROM polis_user_roles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);
