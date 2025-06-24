
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

// Poll creation interface
export interface CreatePollData {
  title: string;
  topic: string;
  description: string;
  category: string;
  end_time: string;
  min_consensus_points_to_win: number;
  allow_user_statements: boolean;
  auto_approve_statements: boolean;
  min_support_pct: number;
  max_opposition_pct: number;
  min_votes_per_group: number;
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

    // Cast the JSON response to the expected type
    return data as { success: boolean; error?: string };
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

    // Cast the JSON response to the expected type
    return data as { success: boolean; error?: string };
  } catch (error) {
    console.error('Error in removeUserRole:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

// Delete user completely (removes from auth.users)
export const deleteAdminUser = async (userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Note: We can't actually delete users from auth.users via the client SDK
    // This would need to be implemented as an edge function with admin privileges
    // For now, we'll just remove their admin role
    return await removeUserRole(userId);
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

// Create a new poll
export const createPoll = async (pollData: CreatePollData) => {
  try {
    const { data: currentUser } = await supabase.auth.getUser();
    
    if (!currentUser.user) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('polis_polls')
      .insert({
        title: pollData.title,
        topic: pollData.topic,
        description: pollData.description,
        category_id: null, // Will need to handle categories properly
        end_time: pollData.end_time,
        min_consensus_points_to_win: pollData.min_consensus_points_to_win,
        allow_user_statements: pollData.allow_user_statements,
        auto_approve_statements: pollData.auto_approve_statements,
        min_support_pct: pollData.min_support_pct,
        max_opposition_pct: pollData.max_opposition_pct,
        min_votes_per_group: pollData.min_votes_per_group,
        status: 'active',
        created_by: currentUser.user.id
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error creating poll:', error);
    throw error;
  }
};

// Extend poll time
export const extendPollTime = async (pollId: string, newEndTime: string) => {
  try {
    const { data, error } = await supabase
      .from('polis_polls')
      .update({ end_time: newEndTime })
      .eq('poll_id', pollId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error extending poll time:', error);
    throw error;
  }
};

// Fetch pending statements
export const fetchPendingStatements = async () => {
  try {
    const { data, error } = await supabase
      .from('polis_statements')
      .select('*')
      .eq('is_approved', false)
      .eq('is_user_suggested', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching pending statements:', error);
    throw error;
  }
};

// Approve statement
export const approveStatement = async (statementId: string) => {
  try {
    const { data, error } = await supabase
      .from('polis_statements')
      .update({ is_approved: true })
      .eq('statement_id', statementId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error approving statement:', error);
    throw error;
  }
};

// Reject statement (delete it)
export const rejectStatement = async (statementId: string) => {
  try {
    const { error } = await supabase
      .from('polis_statements')
      .delete()
      .eq('statement_id', statementId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error rejecting statement:', error);
    throw error;
  }
};
