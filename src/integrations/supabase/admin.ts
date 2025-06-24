
import { supabase } from './client';
import type { CreatePollData } from './polls/types';

export const createPoll = async (pollData: CreatePollData) => {
  try {
    console.log('Creating poll with data:', pollData);
    
    // First, get or create the category
    let categoryId: string;
    
    const { data: existingCategory } = await supabase
      .from('polis_poll_categories')
      .select('category_id')
      .eq('name', pollData.category)
      .single();
    
    if (existingCategory) {
      categoryId = existingCategory.category_id;
    } else {
      const { data: newCategory, error: categoryError } = await supabase
        .from('polis_poll_categories')
        .insert({ name: pollData.category })
        .select('category_id')
        .single();
      
      if (categoryError) {
        console.error('Error creating category:', categoryError);
        throw categoryError;
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
        slug: pollData.slug,
        end_time: pollData.end_time,
        min_consensus_points_to_win: pollData.min_consensus_points_to_win,
        allow_user_statements: pollData.allow_user_statements,
        auto_approve_statements: pollData.auto_approve_statements,
        min_support_pct: pollData.min_support_pct,
        max_opposition_pct: pollData.max_opposition_pct,
        min_votes_per_group: pollData.min_votes_per_group,
        status: 'active',
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating poll:', error);
      throw error;
    }
    
    console.log('Poll created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in createPoll:', error);
    throw error;
  }
};

// User management functions
export const fetchAllUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('polis_user_roles')
      .select(`
        user_id,
        role,
        assigned_at,
        assigned_by
      `);
    
    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
    
    // Transform the data to match the expected format
    const users = data?.map(user => ({
      id: user.user_id,
      email: '', // We don't have access to auth.users table
      full_name: '',
      role: user.role,
      created_at: '',
      assigned_at: user.assigned_at,
      last_sign_in_at: null
    })) || [];
    
    return users;
  } catch (error) {
    console.error('Error in fetchAllUsers:', error);
    throw error;
  }
};

export const assignUserRole = async (userId: string, role: 'poll_admin' | 'super_admin') => {
  try {
    const { error } = await supabase
      .from('polis_user_roles')
      .upsert({
        user_id: userId,
        role: role,
        assigned_by: (await supabase.auth.getUser()).data.user?.id
      });
    
    if (error) {
      console.error('Error assigning user role:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in assignUserRole:', error);
    throw error;
  }
};

export const removeUserRole = async (userId: string) => {
  try {
    const { error } = await supabase
      .from('polis_user_roles')
      .delete()
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error removing user role:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in removeUserRole:', error);
    throw error;
  }
};

// Statement management functions
export const fetchPendingStatements = async () => {
  try {
    const { data, error } = await supabase
      .from('polis_statements')
      .select('*')
      .eq('is_approved', false)
      .eq('is_user_suggested', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching pending statements:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchPendingStatements:', error);
    throw error;
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
