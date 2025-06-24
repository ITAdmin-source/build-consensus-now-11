
import { supabase } from '../client';

export const getPollsWithCategories = async (status?: 'active') => {
  let query = supabase
    .from('polis_polls')
    .select(`
      *,
      polis_poll_categories(name)
    `)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  return query;
};

export const getPollByField = async (field: 'poll_id' | 'slug', value: string) => {
  return supabase
    .from('polis_polls')
    .select(`
      *,
      polis_poll_categories(name)
    `)
    .eq(field, value)
    .single();
};

export const getConsensusPointsCounts = async (pollIds: string[]) => {
  const { data, error } = await supabase
    .from('polis_consensus_points')
    .select('poll_id')
    .in('poll_id', pollIds);

  if (error) {
    console.error('Error fetching consensus points:', error);
    return {};
  }

  return data?.reduce((acc, item) => {
    acc[item.poll_id] = (acc[item.poll_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};
};

export const getStatementsCounts = async (pollIds: string[]) => {
  const { data, error } = await supabase
    .from('polis_statements')
    .select('poll_id')
    .in('poll_id', pollIds)
    .eq('is_approved', true);

  if (error) {
    console.error('Error fetching statements:', error);
    return {};
  }

  return data?.reduce((acc, item) => {
    acc[item.poll_id] = (acc[item.poll_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};
};

export const getVotesCounts = async (pollIds: string[]) => {
  const { data, error } = await supabase
    .from('polis_votes')
    .select('poll_id')
    .in('poll_id', pollIds);

  if (error) {
    console.error('Error fetching votes:', error);
    return {};
  }

  return data?.reduce((acc, vote) => {
    acc[vote.poll_id] = (acc[vote.poll_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};
};

export const getPollStatistics = async (pollId: string) => {
  const [consensusData, statementsData, votesData] = await Promise.all([
    supabase
      .from('polis_consensus_points')
      .select('statement_id')
      .eq('poll_id', pollId),
    supabase
      .from('polis_statements')
      .select('statement_id')
      .eq('poll_id', pollId)
      .eq('is_approved', true),
    supabase
      .from('polis_votes')
      .select('vote_id')
      .eq('poll_id', pollId)
  ]);

  return {
    consensusCount: consensusData.data?.length || 0,
    statementsCount: statementsData.data?.length || 0,
    votesCount: votesData.data?.length || 0
  };
};
