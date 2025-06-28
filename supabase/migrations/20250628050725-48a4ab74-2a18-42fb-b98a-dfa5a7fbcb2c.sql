
-- Enable RLS on polis_clustering_queue table
ALTER TABLE public.polis_clustering_queue ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for polis_clustering_queue table
CREATE POLICY "Anyone can view clustering queue for active polls" 
ON polis_clustering_queue 
FOR SELECT 
TO public 
USING (
  EXISTS (
    SELECT 1 FROM polis_polls 
    WHERE polis_polls.poll_id = polis_clustering_queue.poll_id 
    AND polis_polls.status = 'active'
  )
);

-- Allow service role and poll creators to insert queue entries
CREATE POLICY "Service role and poll creators can insert clustering queue" 
ON polis_clustering_queue 
FOR INSERT 
TO authenticated, service_role
WITH CHECK (
  -- Always allow service role (for microservice)
  auth.role() = 'service_role' OR
  -- Allow poll creators
  EXISTS (
    SELECT 1 FROM polis_polls 
    WHERE polis_polls.poll_id = polis_clustering_queue.poll_id 
    AND polis_polls.created_by = auth.uid()
  ) OR
  -- Allow super admins
  EXISTS (
    SELECT 1 FROM polis_user_roles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);

-- Allow service role and poll creators to update queue entries
CREATE POLICY "Service role and poll creators can update clustering queue" 
ON polis_clustering_queue 
FOR UPDATE 
TO authenticated, service_role
USING (
  -- Always allow service role (for microservice)
  auth.role() = 'service_role' OR
  -- Allow poll creators
  EXISTS (
    SELECT 1 FROM polis_polls 
    WHERE polis_polls.poll_id = polis_clustering_queue.poll_id 
    AND polis_polls.created_by = auth.uid()
  ) OR
  -- Allow super admins
  EXISTS (
    SELECT 1 FROM polis_user_roles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);

-- Allow poll creators and super admins to delete queue entries
CREATE POLICY "Poll creators and super admins can delete clustering queue" 
ON polis_clustering_queue 
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM polis_polls 
    WHERE polis_polls.poll_id = polis_clustering_queue.poll_id 
    AND polis_polls.created_by = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM polis_user_roles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);
