
import { supabase } from './client';
import { Poll } from '@/types/poll';

export const fetchActivePolls = async () => {
  const { data, error } = await supabase
    .from('polis_polls')
    .select(`
      *,
      polis_poll_categories(name),
      polis_consensus_points(statement_id),
      polis_statements(statement_id)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching polls:', error);
    throw error;
  }

  // Transform the data to match our Poll interface
  return data?.map((poll): Poll => ({
    poll_id: poll.poll_id,
    title: poll.title,
    topic: poll.topic || '',
    description: poll.description || '',
    category: poll.polis_poll_categories?.name || 'כללי',
    end_time: poll.end_time,
    min_consensus_points_to_win: poll.min_consensus_points_to_win || 3,
    allow_user_statements: poll.allow_user_statements || false,
    auto_approve_statements: poll.auto_approve_statements || false,
    status: poll.status,
    min_support_pct: poll.min_support_pct || 50,
    max_opposition_pct: poll.max_opposition_pct || 50,
    min_votes_per_group: poll.min_votes_per_group || 1,
    current_consensus_points: poll.polis_consensus_points?.length || 0,
    total_statements: poll.polis_statements?.length || 0,
    total_votes: 0 // Will be calculated separately
  })) || [];
};

export const fetchPollById = async (pollId: string) => {
  const { data, error } = await supabase
    .from('polis_polls')
    .select(`
      *,
      polis_poll_categories(name),
      polis_consensus_points(statement_id),
      polis_statements(statement_id)
    `)
    .eq('poll_id', pollId)
    .single();

  if (error) {
    console.error('Error fetching poll:', error);
    throw error;
  }

  if (!data) return null;

  return {
    poll_id: data.poll_id,
    title: data.title,
    topic: data.topic || '',
    description: data.description || '',
    category: data.polis_poll_categories?.name || 'כללי',
    end_time: data.end_time,
    min_consensus_points_to_win: data.min_consensus_points_to_win || 3,
    allow_user_statements: data.allow_user_statements || false,
    auto_approve_statements: data.auto_approve_statements || false,
    status: data.status,
    min_support_pct: data.min_support_pct || 50,
    max_opposition_pct: data.max_opposition_pct || 50,
    min_votes_per_group: data.min_votes_per_group || 1,
    current_consensus_points: data.polis_consensus_points?.length || 0,
    total_statements: data.polis_statements?.length || 0,
    total_votes: 0
  } as Poll;
};
