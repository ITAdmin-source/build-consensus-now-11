
import { supabase } from './client';

// Types for user management
export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: 'participant' | 'poll_admin' | 'super_admin';
  created_at: string;
  assigned_at: string | null;
  last_sign_in_at: string | null;
}

// Fetch all users with their roles
export const fetchAllUsers = async (): Promise<AdminUser[]> => {
  try {
    const { data, error } = await supabase.rpc('get_all_users_with_roles');
    
    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchAllUsers:', error);
    throw error;
  }
};

// Assign a role to a user
export const assignUserRole = async (
  userId: string, 
  role: 'poll_admin' | 'super_admin'
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: currentUser } = await supabase.auth.getUser();
    
    if (!currentUser.user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data, error } = await supabase.rpc('assign_user_role', {
      _user_id: userId,
      _role: role,
      _assigned_by: currentUser.user.id
    });

    if (error) {
      console.error('Error assigning role:', error);
      return { success: false, error: error.message };
    }

    return data;
  } catch (error) {
    console.error('Error in assignUserRole:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

// Remove admin role from user (revert to participant)
export const removeUserRole = async (userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: currentUser } = await supabase.auth.getUser();
    
    if (!currentUser.user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data, error } = await supabase.rpc('remove_user_admin_role', {
      _user_id: userId,
      _removed_by: currentUser.user.id
    });

    if (error) {
      console.error('Error removing role:', error);
      return { success: false, error: error.message };
    }

    return data;
  } catch (error) {
    console.error('Error in removeUserRole:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

// Delete admin user (removes from auth.users)
export const deleteAdminUser = async (userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase.rpc('polis_delete_admin_user', {
      _user_id: userId
    });

    if (error) {
      console.error('Error deleting user:', error);
      return { success: false, error: error.message };
    }

    return data;
  } catch (error) {
    console.error('Error in deleteAdminUser:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

// Get admin statistics
export const getAdminStats = async () => {
  try {
    const { data, error } = await supabase.rpc('polis_get_user_management_stats');
    
    if (error) {
      console.error('Error fetching admin stats:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getAdminStats:', error);
    throw error;
  }
};
