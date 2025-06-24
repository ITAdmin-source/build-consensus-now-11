
-- Add Row Level Security policies for polis_polls table to allow updates
-- First enable RLS if not already enabled
ALTER TABLE polis_polls ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to select polls (for viewing in admin)
CREATE POLICY "Authenticated users can view polls" 
ON polis_polls 
FOR SELECT 
TO authenticated 
USING (true);

-- Allow poll creators and super admins to update their polls
CREATE POLICY "Poll creators and super admins can update polls" 
ON polis_polls 
FOR UPDATE 
TO authenticated 
USING (
  created_by = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM polis_user_roles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);

-- Allow super admins and poll admins to insert new polls
CREATE POLICY "Admins can create polls" 
ON polis_polls 
FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM polis_user_roles 
    WHERE user_id = auth.uid() AND role IN ('super_admin', 'poll_admin')
  )
);

-- Allow super admins to delete polls
CREATE POLICY "Super admins can delete polls" 
ON polis_polls 
FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM polis_user_roles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);
