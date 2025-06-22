
import { supabase } from './client';
import type { Poll } from '@/types/poll';

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
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to create polls');
  }

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
    
    if (categoryError) throw categoryError;
    categoryId = newCategory.category_id;
  }

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
      min_votes_per_group: pollData.min_votes_per_group,
      created_by: user.id
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const fetchPendingStatements = async () => {
  const { data, error } = await supabase
    .from('polis_statements')
    .select(`
      *,
      polis_polls(title)
    `)
    .eq('is_approved', false)
    .eq('is_user_suggested', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const approveStatement = async (statementId: string) => {
  const { data, error } = await supabase
    .from('polis_statements')
    .update({ is_approved: true })
    .eq('statement_id', statementId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const rejectStatement = async (statementId: string) => {
  const { data, error } = await supabase
    .from('polis_statements')
    .delete()
    .eq('statement_id', statementId);

  if (error) throw error;
  return data;
};

export const fetchAdminStats = async () => {
  // Get polls count
  const { data: pollsData, error: pollsError } = await supabase
    .from('polis_polls')
    .select('poll_id, status')
    .eq('status', 'active');

  if (pollsError) throw pollsError;

  // Get total participants (unique session_ids across all votes)
  const { data: participantsData, error: participantsError } = await supabase
    .from('polis_votes')
    .select('session_id')
    .not('session_id', 'is', null);

  if (participantsError) throw participantsError;

  const uniqueParticipants = new Set(participantsData?.map(v => v.session_id) || []).size;

  // Get votes from today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const { data: todayVotesData, error: todayVotesError } = await supabase
    .from('polis_votes')
    .select('vote_id')
    .gte('voted_at', today.toISOString());

  if (todayVotesError) throw todayVotesError;

  // Get pending statements count
  const { data: pendingData, error: pendingError } = await supabase
    .from('polis_statements')
    .select('statement_id')
    .eq('is_approved', false)
    .eq('is_user_suggested', true);

  if (pendingError) throw pendingError;

  return {
    activePolls: pollsData?.length || 0,
    totalParticipants: uniqueParticipants,
    votesToday: todayVotesData?.length || 0,
    pendingStatements: pendingData?.length || 0
  };
};

export const extendPollTime = async (pollId: string, newEndTime: string) => {
  const { data, error } = await supabase
    .from('polis_polls')
    .update({ end_time: newEndTime })
    .eq('poll_id', pollId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updatePollStatus = async (pollId: string, status: 'draft' | 'active' | 'closed') => {
  const { data, error } = await supabase
    .from('polis_polls')
    .update({ status })
    .eq('poll_id', pollId)
    .select()
    .single();

  if (error) throw error;
  return data;
};
