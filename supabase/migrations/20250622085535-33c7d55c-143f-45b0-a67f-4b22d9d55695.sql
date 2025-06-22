
-- Create the missing enum type for admin roles
DO $$ BEGIN
    CREATE TYPE polis_admin_role AS ENUM ('super_admin', 'poll_admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Insert initial super admin user (you'll need to replace this email with your actual admin email)
-- First, let's create a function to safely add an admin user
CREATE OR REPLACE FUNCTION add_initial_super_admin(admin_email TEXT)
RETURNS VOID AS $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Check if user exists in auth.users
    SELECT id INTO admin_user_id FROM auth.users WHERE email = admin_email;
    
    IF admin_user_id IS NOT NULL THEN
        -- Add or update admin role
        INSERT INTO polis_admin_roles (user_id, role, assigned_by)
        VALUES (admin_user_id, 'super_admin', admin_user_id)
        ON CONFLICT (user_id) 
        DO UPDATE SET 
            role = 'super_admin',
            assigned_at = now();
            
        RAISE NOTICE 'Admin role assigned to user: %', admin_email;
    ELSE
        RAISE NOTICE 'User with email % not found in auth.users. Please sign up first.', admin_email;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Update RLS policies for admin tables
DROP POLICY IF EXISTS "Super admins can view admin profiles" ON polis_admin_profiles;
CREATE POLICY "Super admins can view admin profiles" ON polis_admin_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM polis_admin_roles 
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

DROP POLICY IF EXISTS "Super admins can manage admin roles" ON polis_admin_roles;
CREATE POLICY "Super admins can manage admin roles" ON polis_admin_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM polis_admin_roles 
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- Allow users to view their own admin profile
DROP POLICY IF EXISTS "Users can view own admin profile" ON polis_admin_profiles;
CREATE POLICY "Users can view own admin profile" ON polis_admin_profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow users to view their own admin role
DROP POLICY IF EXISTS "Users can view own admin role" ON polis_admin_roles;
CREATE POLICY "Users can view own admin role" ON polis_admin_roles
  FOR SELECT USING (auth.uid() = user_id);
