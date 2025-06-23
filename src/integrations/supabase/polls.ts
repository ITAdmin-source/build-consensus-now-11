
import { supabase } from './client';
import { Poll } from '@/types/poll';

export const fetchActivePolls = async () => {
  try {
    console.log('Fetching active polls...');
    
    // Fetch polls with categories
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

    console.log('Polls data fetched:', pollsData);

    if (!pollsData || pollsData.length === 0) {
      console.log('No polls found');
      return [];
    }

    const pollIds = pollsData.map(poll => poll.poll_id);
    console.log('Poll IDs:', pollIds);

    // Get consensus points counts for all polls
    const { data: consensusData, error: consensusError } = await supabase
      .from('polis_consensus_points')
      .select('poll_id')
      .in('poll_id', pollIds);

    if (consensusError) {
      console.error('Error fetching consensus points:', consensusError);
    }

    // Get approved statements counts for all polls
    const { data: statementsData, error: statementsError } = await supabase
      .from('polis_statements')
      .select('poll_id')
      .in('poll_id', pollIds)
      .eq('is_approved', true);

    if (statementsError) {
      console.error('Error fetching statements:', statementsError);
    }

    // Get votes counts for all polls using the poll_id column
    const { data: votesData, error: votesError } = await supabase
      .from('polis_votes')
      .select('poll_id')
      .in('poll_id', pollIds);

    if (votesError) {
      console.error('Error fetching votes:', votesError);
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

    const votesCounts = votesData?.reduce((acc, vote) => {
      acc[vote.poll_id] = (acc[vote.poll_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    console.log('Consensus counts:', consensusCounts);
    console.log('Statements counts:', statementsCounts);
    console.log('Votes counts:', votesCounts);

    // Transform the data to match our Poll interface
    const transformedPolls = pollsData.map((poll): Poll => ({
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

    console.log('Transformed polls:', transformedPolls);
    return transformedPolls;
  } catch (error) {
    console.error('Error in fetchActivePolls:', error);
    throw error;
  }
};

export const fetchPollById = async (pollId: string) => {
  try {
    console.log('Fetching poll by ID:', pollId);
    
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

    if (!data) {
      console.log('No poll found with ID:', pollId);
      return null;
    }

    // Get additional data separately to avoid relationship issues
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

    const transformedPoll: Poll = {
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
      total_votes: votesData.data?.length || 0
    };

    console.log('Transformed poll:', transformedPoll);
    return transformedPoll;
  } catch (error) {
    console.error('Error in fetchPollById:', error);
    throw error;
  }
};

// Add function to fetch all polls (not just active ones) for admin dashboard
export const fetchAllPolls = async () => {
  try {
    console.log('Fetching all polls for admin...');
    
    // Fetch all polls with categories (not just active ones)
    const { data: pollsData, error: pollsError } = await supabase
      .from('polis_polls')
      .select(`
        *,
        polis_poll_categories(name)
      `)
      .order('created_at', { ascending: false });

    if (pollsError) {
      console.error('Error fetching all polls:', pollsError);
      throw pollsError;
    }

    console.log('All polls data fetched:', pollsData);

    if (!pollsData || pollsData.length === 0) {
      console.log('No polls found');
      return [];
    }

    const pollIds = pollsData.map(poll => poll.poll_id);

    // Get consensus points counts for all polls
    const { data: consensusData } = await supabase
      .from('polis_consensus_points')
      .select('poll_id')
      .in('poll_id', pollIds);

    // Get approved statements counts for all polls
    const { data: statementsData } = await supabase
      .from('polis_statements')
      .select('poll_id')
      .in('poll_id', pollIds)
      .eq('is_approved', true);

    // Get votes counts for all polls
    const { data: votesData } = await supabase
      .from('polis_votes')
      .select('poll_id')
      .in('poll_id', pollIds);

    // Count occurrences for each poll
    const consensusCounts = consensusData?.reduce((acc, item) => {
      acc[item.poll_id] = (acc[item.poll_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const statementsCounts = statementsData?.reduce((acc, item) => {
      acc[item.poll_id] = (acc[item.poll_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const votesCounts = votesData?.reduce((acc, vote) => {
      acc[vote.poll_id] = (acc[vote.poll_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Transform the data to match our Poll interface
    const transformedPolls = pollsData.map((poll): Poll => ({
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

    console.log('All transformed polls:', transformedPolls);
    return transformedPolls;
  } catch (error) {
    console.error('Error in fetchAllPolls:', error);
    throw error;
  }
};
