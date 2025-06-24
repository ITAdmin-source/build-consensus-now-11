
-- Fix RLS policy on polis_poll_categories to allow proper access
-- Drop the existing overly restrictive policy
DROP POLICY IF EXISTS "Only super admins can manage system settings" ON public.polis_poll_categories;

-- Create new policies that allow authenticated users to read categories
-- and only super admins to modify them
CREATE POLICY "Anyone can view categories" 
ON public.polis_poll_categories 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Super admins can insert categories" 
ON public.polis_poll_categories 
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM polis_user_roles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);

CREATE POLICY "Super admins can update categories" 
ON public.polis_poll_categories 
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM polis_user_roles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);

CREATE POLICY "Super admins can delete categories" 
ON public.polis_poll_categories 
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM polis_user_roles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);
