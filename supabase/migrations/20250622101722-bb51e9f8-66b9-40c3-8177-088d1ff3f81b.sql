
-- Fix the infinite recursion in RLS policies by using security definer functions

-- First, drop the problematic policies
DROP POLICY IF EXISTS "Super admins can view admin profiles" ON polis_admin_profiles;
DROP POLICY IF EXISTS "Super admins can manage admin roles" ON polis_admin_roles;
DROP POLICY IF EXISTS "Users can view own admin profile" ON polis_admin_profiles;
DROP POLICY IF EXISTS "Users can view own admin role" ON polis_admin_roles;

-- Create a secure function to check if current user has a specific role
CREATE OR REPLACE FUNCTION public.current_user_has_role(_role polis_admin_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM polis_admin_roles 
        WHERE user_id = auth.uid() AND role = _role
    );
$$;

-- Create a secure function to check if current user is super admin
CREATE OR REPLACE FUNCTION public.current_user_is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM polis_admin_roles 
        WHERE user_id = auth.uid() AND role = 'super_admin'
    );
$$;

-- Now create non-recursive RLS policies using the security definer functions

-- Admin profiles policies
CREATE POLICY "Super admins can view all admin profiles" ON polis_admin_profiles
  FOR SELECT USING (public.current_user_is_super_admin());

CREATE POLICY "Users can view own admin profile" ON polis_admin_profiles
  FOR SELECT USING (auth.uid() = id);

-- Admin roles policies  
CREATE POLICY "Super admins can manage all admin roles" ON polis_admin_roles
  FOR ALL USING (public.current_user_is_super_admin());

CREATE POLICY "Users can view own admin role" ON polis_admin_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Ensure the admin profile trigger exists for new users
CREATE OR REPLACE FUNCTION public.handle_new_admin_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    INSERT INTO public.polis_admin_profiles (id, email, full_name)
    VALUES (
        NEW.id, 
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name')
    );
    RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS on_auth_user_created_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_admin_user();
