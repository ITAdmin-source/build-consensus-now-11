import { supabase } from './client';

export const fetchAdminStats = async () => {
  try {
    // Get active polls count
    const { data: activePolls, error: pollsError } = await supabase
      .from('polis_polls')
      .select('poll_id')
      .eq('status', 'active');

    if (pollsError) throw pollsError;

    // Get total participants (distinct session_ids from votes)
    const { data: participants, error: participantsError } = await supabase
      .from('polis_votes')
      .select('session_id');

    if (participantsError) throw participantsError;

    const uniqueParticipants = new Set(participants?.map(p => p.session_id) || []);

    // Get votes from today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data: todayVotes, error: votesError } = await supabase
      .from('polis_votes')
      .select('vote_id')
      .gte('voted_at', today.toISOString());

    if (votesError) throw votesError;

    // Get pending statements count
    const { data: pendingStatements, error: pendingError } = await supabase
      .from('polis_statements')
      .select('statement_id')
      .eq('is_approved', false)
      .eq('is_user_suggested', true);

    if (pendingError) throw pendingError;

    return {
      activePolls: activePolls?.length || 0,
      totalParticipants: uniqueParticipants.size,
      votesToday: todayVotes?.length || 0,
      pendingStatements: pendingStatements?.length || 0
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return {
      activePolls: 0,
      totalParticipants: 0,
      votesToday: 0,
      pendingStatements: 0
    };
  }
};

export const fetchPendingStatements = async () => {
  const { data, error } = await supabase
    .from('polis_statements')
    .select(`
      statement_id,
      content,
      content_type,
      created_at,
      poll_id,
      polis_polls!inner(title)
    `)
    .eq('is_approved', false)
    .eq('is_user_suggested', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching pending statements:', error);
    throw error;
  }

  return data || [];
};

export const approveStatement = async (statementId: string) => {
  const { error } = await supabase
    .from('polis_statements')
    .update({ is_approved: true })
    .eq('statement_id', statementId);

  if (error) {
    console.error('Error approving statement:', error);
    throw error;
  }
};

export const rejectStatement = async (statementId: string) => {
  const { error } = await supabase
    .from('polis_statements')
    .delete()
    .eq('statement_id', statementId);

  if (error) {
    console.error('Error rejecting statement:', error);
    throw error;
  }
};

export const extendPollTime = async (pollId: string, newEndTime: string) => {
  const { error } = await supabase
    .from('polis_polls')
    .update({ end_time: newEndTime })
    .eq('poll_id', pollId);

  if (error) {
    console.error('Error extending poll time:', error);
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
  // First, get or create the category
  let categoryId: string;
  
  const { data: existingCategory, error: categoryFetchError } = await supabase
    .from('polis_poll_categories')
    .select('category_id')
    .eq('name', pollData.category)
    .single();

  if (categoryFetchError && categoryFetchError.code !== 'PGRST116') {
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
};
