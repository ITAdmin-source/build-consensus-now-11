
-- Drop redundant tables
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS polis_admin_profiles CASCADE;
DROP TABLE IF EXISTS polis_poll_admins CASCADE;

-- Create user role enum
CREATE TYPE user_role AS ENUM ('participant', 'poll_admin', 'super_admin');

-- Create simplified user roles table
CREATE TABLE polis_user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'participant',
  assigned_by uuid REFERENCES auth.users(id),
  assigned_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on user_roles
ALTER TABLE polis_user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.user_has_role(_user_id uuid, _role user_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM polis_user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Create helper function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS user_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role FROM polis_user_roles WHERE user_id = _user_id;
$$;

-- Create function to check if current user has specific role
CREATE OR REPLACE FUNCTION public.current_user_has_role(_role user_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT user_has_role(auth.uid(), _role);
$$;

-- RLS policies for polis_user_roles
CREATE POLICY "Super admins can view all user roles"
  ON polis_user_roles FOR SELECT
  TO authenticated
  USING (user_has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can view their own role"
  ON polis_user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Super admins can manage user roles"
  ON polis_user_roles FOR ALL
  TO authenticated
  USING (user_has_role(auth.uid(), 'super_admin'))
  WITH CHECK (user_has_role(auth.uid(), 'super_admin'));

-- Trigger to automatically assign 'participant' role to new users
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO polis_user_roles (user_id, role)
  VALUES (NEW.id, 'participant');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Migrate existing admin roles from old system
INSERT INTO polis_user_roles (user_id, role, assigned_at)
SELECT 
  user_id,
  CASE 
    WHEN role = 'super_admin' THEN 'super_admin'::user_role
    WHEN role = 'poll_admin' THEN 'poll_admin'::user_role
    ELSE 'participant'::user_role
  END,
  assigned_at
FROM polis_admin_roles
ON CONFLICT (user_id) DO NOTHING;

-- Drop old admin roles table and enum after migration
DROP TABLE IF EXISTS polis_admin_roles CASCADE;
DROP TYPE IF EXISTS polis_admin_role CASCADE;

-- Update functions that referenced old tables
CREATE OR REPLACE FUNCTION public.get_all_users_with_roles()
RETURNS TABLE(
  id uuid,
  email text,
  full_name text,
  role user_role,
  created_at timestamp with time zone,
  assigned_at timestamp with time zone,
  last_sign_in_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data ->> 'full_name', u.email) as full_name,
    COALESCE(ur.role, 'participant'::user_role) as role,
    u.created_at,
    ur.assigned_at,
    u.last_sign_in_at
  FROM auth.users u
  LEFT JOIN polis_user_roles ur ON u.id = ur.user_id
  ORDER BY u.created_at DESC;
$$;

-- Function to assign role to user
CREATE OR REPLACE FUNCTION public.assign_user_role(_user_id uuid, _role user_role, _assigned_by uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if assigner is super admin
  IF NOT user_has_role(_assigned_by, 'super_admin') THEN
    RETURN json_build_object('success', false, 'error', 'Only super admins can assign roles');
  END IF;
  
  INSERT INTO polis_user_roles (user_id, role, assigned_by)
  VALUES (_user_id, _role, _assigned_by)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    role = _role,
    assigned_by = _assigned_by,
    assigned_at = now();
    
  RETURN json_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Function to remove user role (revert to participant)
CREATE OR REPLACE FUNCTION public.remove_user_admin_role(_user_id uuid, _removed_by uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if remover is super admin
  IF NOT user_has_role(_removed_by, 'super_admin') THEN
    RETURN json_build_object('success', false, 'error', 'Only super admins can remove admin roles');
  END IF;
  
  -- Update role to participant instead of deleting
  UPDATE polis_user_roles 
  SET role = 'participant', assigned_by = _removed_by, assigned_at = now()
  WHERE user_id = _user_id;
  
  IF FOUND THEN
    RETURN json_build_object('success', true);
  ELSE
    RETURN json_build_object('success', false, 'error', 'User not found');
  END IF;
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;
