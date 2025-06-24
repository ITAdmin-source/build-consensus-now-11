
-- Enable RLS on polis_statements table if not already enabled
ALTER TABLE polis_statements ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view approved statements
CREATE POLICY "Users can view approved statements" 
ON polis_statements 
FOR SELECT 
TO authenticated 
USING (is_approved = true);

-- Allow admins to view all statements (including pending ones)
CREATE POLICY "Admins can view all statements" 
ON polis_statements 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM polis_user_roles 
    WHERE user_id = auth.uid() AND role IN ('super_admin', 'poll_admin')
  )
);

-- Allow authenticated users to create statements (user suggestions)
CREATE POLICY "Users can create statements" 
ON polis_statements 
FOR INSERT 
TO authenticated 
WITH CHECK (
  created_by_user_id = auth.uid() AND
  is_user_suggested = true AND
  is_approved = false
);

-- Allow admins to create approved statements directly
CREATE POLICY "Admins can create approved statements" 
ON polis_statements 
FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM polis_user_roles 
    WHERE user_id = auth.uid() AND role IN ('super_admin', 'poll_admin')
  )
);

-- Allow admins to update statements (approve/reject, edit content)
CREATE POLICY "Admins can update statements" 
ON polis_statements 
FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM polis_user_roles 
    WHERE user_id = auth.uid() AND role IN ('super_admin', 'poll_admin')
  )
);

-- Allow statement creators to update their own statements (before approval)
CREATE POLICY "Users can update their own pending statements" 
ON polis_statements 
FOR UPDATE 
TO authenticated 
USING (
  created_by_user_id = auth.uid() AND
  is_user_suggested = true AND
  is_approved = false
);

-- Allow admins to delete statements
CREATE POLICY "Admins can delete statements" 
ON polis_statements 
FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM polis_user_roles 
    WHERE user_id = auth.uid() AND role IN ('super_admin', 'poll_admin')
  )
);

-- Allow statement creators to delete their own pending statements
CREATE POLICY "Users can delete their own pending statements" 
ON polis_statements 
FOR DELETE 
TO authenticated 
USING (
  created_by_user_id = auth.uid() AND
  is_user_suggested = true AND
  is_approved = false
);
