
-- Create RLS policies for polis_groups table
CREATE POLICY "Anyone can view groups for active polls" 
ON polis_groups 
FOR SELECT 
TO public 
USING (
  EXISTS (
    SELECT 1 FROM polis_polls 
    WHERE polis_polls.poll_id = polis_groups.poll_id 
    AND polis_polls.status = 'active'
  )
);

-- Create RLS policies for polis_user_group_membership table
CREATE POLICY "Anyone can view group memberships for active polls" 
ON polis_user_group_membership 
FOR SELECT 
TO public 
USING (
  EXISTS (
    SELECT 1 FROM polis_polls 
    WHERE polis_polls.poll_id = polis_user_group_membership.poll_id 
    AND polis_polls.status = 'active'
  )
);

-- Create RLS policies for polis_group_statement_stats table
CREATE POLICY "Anyone can view group statement stats for active polls" 
ON polis_group_statement_stats 
FOR SELECT 
TO public 
USING (
  EXISTS (
    SELECT 1 FROM polis_polls 
    WHERE polis_polls.poll_id = polis_group_statement_stats.poll_id 
    AND polis_polls.status = 'active'
  )
);

-- Create RLS policy for polis_consensus_points table (if not already present)
CREATE POLICY "Anyone can view consensus points for active polls" 
ON polis_consensus_points 
FOR SELECT 
TO public 
USING (
  EXISTS (
    SELECT 1 FROM polis_polls 
    WHERE polis_polls.poll_id = polis_consensus_points.poll_id 
    AND polis_polls.status = 'active'
  )
);
