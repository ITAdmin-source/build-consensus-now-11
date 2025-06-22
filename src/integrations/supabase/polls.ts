
import { supabase } from './client';
import { Poll } from '@/types/poll';

export const fetchActivePolls = async () => {
  // First, get the basic poll data with categories
  const { data: pollsData, error: pollsError } = await supabase
    .from('polis_polls')
    .select(`
      *,
      polis_poll_categories(name)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (pollsError) {
    console.error('Error fetching polls:', pollsError);
    throw pollsError;
  }

  if (!pollsData || pollsData.length === 0) {
    return [];
  }

  // Get consensus points counts for all polls
  const { data: consensusData, error: consensusError } = await supabase
    .from('polis_consensus_points')
    .select('poll_id')
    .in('poll_id', pollsData.map(poll => poll.poll_id));

  if (consensusError) {
    console.error('Error fetching consensus points:', consensusError);
  }

  // Get statements counts for all polls
  const { data: statementsData, error: statementsError } = await supabase
    .from('polis_statements')
    .select('poll_id')
    .in('poll_id', pollsData.map(poll => poll.poll_id))
    .eq('is_approved', true);

  if (statementsError) {
    console.error('Error fetching statements:', statementsError);
  }

  // Get votes counts for all polls - simpler approach
  const { data: votesData, error: votesError } = await supabase
    .from('polis_votes')
    .select('vote_id, statement_id');

  if (votesError) {
    console.error('Error fetching votes:', votesError);
  }

  // Get statement to poll mapping
  const { data: statementPollMapping, error: mappingError } = await supabase
    .from('polis_statements')
    .select('statement_id, poll_id')
    .in('poll_id', pollsData.map(poll => poll.poll_id));

  if (mappingError) {
    console.error('Error fetching statement-poll mapping:', mappingError);
  }

  // Count occurrences for each poll
  const consensusCounts = consensusData?.reduce((acc, item) => {
    acc[item.poll_id] = (acc[item.poll_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const statementsCounts = statementsData?.reduce((acc, item) => {
    acc[item.poll_id] = (acc[item.poll_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  // Map votes to polls via statements
  const statementToPoll = statementPollMapping?.reduce((acc, item) => {
    acc[item.statement_id] = item.poll_id;
    return acc;
  }, {} as Record<string, string>) || {};

  const votesCounts = votesData?.reduce((acc, vote) => {
    const pollId = statementToPoll[vote.statement_id];
    if (pollId) {
      acc[pollId] = (acc[pollId] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>) || {};

  // Transform the data to match our Poll interface
  return pollsData.map((poll): Poll => ({
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
    current_consensus_points: consensusCounts[poll.poll_id] || 0,
    total_statements: statementsCounts[poll.poll_id] || 0,
    total_votes: votesCounts[poll.poll_id] || 0
  }));
};

export const fetchPollById = async (pollId: string) => {
  const { data, error } = await supabase
    .from('polis_polls')
    .select(`
      *,
      polis_poll_categories(name)
    `)
    .eq('poll_id', pollId)
    .single();

  if (error) {
    console.error('Error fetching poll:', error);
    throw error;
  }

  if (!data) return null;

  // Get additional data separately to avoid relationship issues
  const [consensusData, statementsData] = await Promise.all([
    supabase
      .from('polis_consensus_points')
      .select('statement_id')
      .eq('poll_id', pollId),
    supabase
      .from('polis_statements')
      .select('statement_id')
      .eq('poll_id', pollId)
      .eq('is_approved', true)
  ]);

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
    current_consensus_points: consensusData.data?.length || 0,
    total_statements: statementsData.data?.length || 0,
    total_votes: 0
  } as Poll;
};
