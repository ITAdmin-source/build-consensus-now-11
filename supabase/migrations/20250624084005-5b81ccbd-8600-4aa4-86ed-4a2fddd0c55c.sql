
-- Drop old functions that reference deleted tables
DROP FUNCTION IF EXISTS public.handle_new_admin_user() CASCADE;
DROP FUNCTION IF EXISTS public.polis_handle_new_admin_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.current_user_is_super_admin() CASCADE;
DROP FUNCTION IF EXISTS public.polis_get_admin_stats() CASCADE;
DROP FUNCTION IF EXISTS public.polis_get_user_management_stats() CASCADE;
DROP FUNCTION IF EXISTS public.polis_remove_user_role(_user_id uuid) CASCADE;
DROP FUNCTION IF EXISTS public.polis_update_user_password(_user_id uuid, _new_password text, _updated_by uuid) CASCADE;
DROP FUNCTION IF EXISTS public.polis_update_user_password_secure(_user_id uuid, _new_password text, _updated_by uuid) CASCADE;
DROP FUNCTION IF EXISTS public.polis_delete_admin_user(_user_id uuid) CASCADE;
DROP FUNCTION IF EXISTS public.add_initial_super_admin(admin_email text) CASCADE;

-- Drop any old triggers that might still exist
DROP TRIGGER IF EXISTS on_auth_user_created_admin ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Ensure the correct trigger exists for new user role assignment
DROP TRIGGER IF EXISTS on_auth_user_created_assign_role ON auth.users;

-- Recreate the trigger function and trigger for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO polis_user_roles (user_id, role)
  VALUES (NEW.id, 'participant')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the error but don't block user creation
  RAISE WARNING 'Failed to assign default role to user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

-- Create the trigger for new user role assignment
CREATE TRIGGER on_auth_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Update the polis_get_user_management_stats function to use the new table
CREATE OR REPLACE FUNCTION public.polis_get_user_management_stats()
RETURNS json
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT json_build_object(
    'total_auth_users', (SELECT COUNT(*) FROM auth.users),
    'users_with_roles', (SELECT COUNT(*) FROM polis_user_roles),
    'super_admins', (SELECT COUNT(*) FROM polis_user_roles WHERE role = 'super_admin'),
    'poll_admins', (SELECT COUNT(*) FROM polis_user_roles WHERE role = 'poll_admin'),
    'participants', (SELECT COUNT(*) FROM polis_user_roles WHERE role = 'participant')
  );
$$;
