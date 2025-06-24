import { supabase } from './client';

export const fetchAdminStats = async () => {
  try {
    // Get active polls count
    const { data: activePolls, error: pollsError } = await supabase
      .from('polis_polls')
      .select('poll_id')
      .eq('status', 'active');

    if (pollsError) {
      console.error('Error fetching active polls:', pollsError);
      throw pollsError;
    }

    // Get total participants (distinct user_id and session_id from votes)
    const { data: votes, error: votesError } = await supabase
      .from('polis_votes')
      .select('user_id, session_id');

    if (votesError) {
      console.error('Error fetching votes for participants:', votesError);
      throw votesError;
    }

    // Count unique participants (either user_id or session_id)
    const uniqueParticipants = new Set();
    votes?.forEach(vote => {
      if (vote.user_id) {
        uniqueParticipants.add(vote.user_id);
      } else if (vote.session_id) {
        uniqueParticipants.add(vote.session_id);
      }
    });

    // Get votes from today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data: todayVotes, error: todayVotesError } = await supabase
      .from('polis_votes')
      .select('vote_id')
      .gte('voted_at', today.toISOString());

    if (todayVotesError) {
      console.error('Error fetching today votes:', todayVotesError);
      throw todayVotesError;
    }

    // Get pending statements count
    const { data: pendingStatements, error: pendingError } = await supabase
      .from('polis_statements')
      .select('statement_id')
      .eq('is_approved', false)
      .eq('is_user_suggested', true);

    if (pendingError) {
      console.error('Error fetching pending statements:', pendingError);
      throw pendingError;
    }

    return {
      activePolls: activePolls?.length || 0,
      totalParticipants: uniqueParticipants.size,
      votesToday: todayVotes?.length || 0,
      pendingStatements: pendingStatements?.length || 0
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    // Return default values instead of throwing
    return {
      activePolls: 0,
      totalParticipants: 0,
      votesToday: 0,
      pendingStatements: 0
    };
  }
};

export const fetchPendingStatements = async () => {
  try {
    // First, get pending statements without the problematic join
    const { data: statements, error: statementsError } = await supabase
      .from('polis_statements')
      .select(`
        statement_id,
        content,
        content_type,
        created_at,
        poll_id
      `)
      .eq('is_approved', false)
      .eq('is_user_suggested', true)
      .order('created_at', { ascending: false });

    if (statementsError) {
      console.error('Error fetching pending statements:', statementsError);
      throw statementsError;
    }

    if (!statements || statements.length === 0) {
      return [];
    }

    // Get unique poll IDs
    const pollIds = [...new Set(statements.map(s => s.poll_id))];
    
    // Fetch poll titles separately
    const { data: polls, error: pollsError } = await supabase
      .from('polis_polls')
      .select('poll_id, title')
      .in('poll_id', pollIds);

    if (pollsError) {
      console.error('Error fetching poll titles:', pollsError);
      // Continue without poll titles rather than failing completely
    }

    // Create a map of poll_id to title
    const pollTitlesMap = new Map();
    polls?.forEach(poll => {
      pollTitlesMap.set(poll.poll_id, poll.title);
    });

    // Combine statements with poll titles
    const statementsWithPollTitles = statements.map(statement => ({
      ...statement,
      polis_polls: {
        title: pollTitlesMap.get(statement.poll_id) || 'סקר לא זמין'
      }
    }));

    return statementsWithPollTitles;
  } catch (error) {
    console.error('Error in fetchPendingStatements:', error);
    // Return empty array instead of throwing to prevent dashboard crash
    return [];
  }
};

export const approveStatement = async (statementId: string) => {
  try {
    const { error } = await supabase
      .from('polis_statements')
      .update({ is_approved: true })
      .eq('statement_id', statementId);

    if (error) {
      console.error('Error approving statement:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in approveStatement:', error);
    throw error;
  }
};

export const rejectStatement = async (statementId: string) => {
  try {
    const { error } = await supabase
      .from('polis_statements')
      .delete()
      .eq('statement_id', statementId);

    if (error) {
      console.error('Error rejecting statement:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in rejectStatement:', error);
    throw error;
  }
};

export const extendPollTime = async (pollId: string, newEndTime: string) => {
  try {
    const { error } = await supabase
      .from('polis_polls')
      .update({ end_time: newEndTime })
      .eq('poll_id', pollId);

    if (error) {
      console.error('Error extending poll time:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in extendPollTime:', error);
    throw error;
  }
};

export const createPoll = async (pollData: {
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
}) => {
  try {
    // First, get or create the category
    let categoryId: string;
    
    const { data: existingCategory, error: categoryFetchError } = await supabase
      .from('polis_poll_categories')
      .select('category_id')
      .eq('name', pollData.category)
      .maybeSingle();

    if (categoryFetchError) {
      console.error('Error fetching category:', categoryFetchError);
      throw categoryFetchError;
    }

    if (existingCategory) {
      categoryId = existingCategory.category_id;
    } else {
      // Create new category
      const { data: newCategory, error: categoryCreateError } = await supabase
        .from('polis_poll_categories')
        .insert({ name: pollData.category })
        .select('category_id')
        .single();

      if (categoryCreateError) {
        console.error('Error creating category:', categoryCreateError);
        throw categoryCreateError;
      }

      categoryId = newCategory.category_id;
    }

    // Create the poll
    const { data, error } = await supabase
      .from('polis_polls')
      .insert({
        title: pollData.title,
        topic: pollData.topic,
        description: pollData.description,
        category_id: categoryId,
        end_time: pollData.end_time,
        min_consensus_points_to_win: pollData.min_consensus_points_to_win,
        allow_user_statements: pollData.allow_user_statements,
        auto_approve_statements: pollData.auto_approve_statements,
        status: 'active',
        min_support_pct: pollData.min_support_pct,
        max_opposition_pct: pollData.max_opposition_pct,
        min_votes_per_group: pollData.min_votes_per_group
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating poll:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createPoll:', error);
    throw error;
  }
};

export const resetPoll = async (pollId: string) => {
  try {
    // Delete all votes for this poll
    await supabase
      .from('polis_votes')
      .delete()
      .eq('poll_id', pollId);

    // Delete all consensus points
    await supabase
      .from('polis_consensus_points')
      .delete()
      .eq('poll_id', pollId);

    // Delete all groups
    await supabase
      .from('polis_groups')
      .delete()
      .eq('poll_id', pollId);

    // Delete all group memberships
    await supabase
      .from('polis_user_group_membership')
      .delete()
      .eq('poll_id', pollId);

    console.log(`Poll ${pollId} has been reset successfully`);
  } catch (error) {
    console.error('Error resetting poll:', error);
    throw error;
  }
};

export const fetchAllUsers = async () => {
  try {
    const { data, error } = await supabase.rpc('polis_get_all_users');
    
    if (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchAllUsers:', error);
    throw error;
  }
};

export const createAdminUser = async (userData: {
  email: string;
  password: string;
  full_name: string;
  role: 'super_admin' | 'poll_admin';
}) => {
  try {
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser.user) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase.rpc('polis_create_admin_user', {
      _email: userData.email,
      _password: userData.password,
      _full_name: userData.full_name,
      _role: userData.role,
      _created_by: currentUser.user.id
    });

    if (error) {
      console.error('Error creating admin user:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createAdminUser:', error);
    throw error;
  }
};

export const assignUserRole = async (userId: string, role: 'super_admin' | 'poll_admin') => {
  try {
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser.user) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase.rpc('polis_assign_role_to_user', {
      _user_id: userId,
      _role: role,
      _assigned_by: currentUser.user.id
    });

    if (error) {
      console.error('Error assigning user role:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in assignUserRole:', error);
    throw error;
  }
};

export const removeUserRole = async (userId: string) => {
  try {
    const { data, error } = await supabase.rpc('polis_remove_user_role', {
      _user_id: userId
    });

    if (error) {
      console.error('Error removing user role:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in removeUserRole:', error);
    throw error;
  }
};

export const deleteAdminUser = async (userId: string) => {
  try {
    const { data, error } = await supabase.rpc('polis_delete_admin_user', {
      _user_id: userId
    });

    if (error) {
      console.error('Error deleting admin user:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in deleteAdminUser:', error);
    throw error;
  }
};

export const updateUserPassword = async (userId: string, newPassword: string) => {
  try {
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser.user) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase.rpc('polis_update_user_password', {
      _user_id: userId,
      _new_password: newPassword,
      _updated_by: currentUser.user.id
    });

    if (error) {
      console.error('Error updating user password:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateUserPassword:', error);
    throw error;
  }
};
