import { supabase } from '../client';
import { transformPollData } from './transformers';
import { Poll } from '@/types/poll';

export const fetchActivePolls = async (): Promise<Poll[]> => {
  const { data: polls, error } = await supabase
    .from('polis_polls')
    .select(`
      *,
      polis_poll_categories(name),
      polis_rounds(round_id, title, start_time, end_time, publish_status)
    `)
    .eq('polis_rounds.publish_status', 'published'); // Only include polls from published rounds

  if (error) {
    console.error('Error fetching active polls:', error);
    throw error;
  }

  if (!polls) return [];

  // Transform polls with additional data
  const transformedPolls = await Promise.all(
    polls.map(async (poll) => {
      const [consensusCount, statementsCount, votesCount, participantsCount] = await Promise.all([
        getConsensusPointsCount(poll.poll_id),
        getStatementsCount(poll.poll_id),
        getVotesCount(poll.poll_id),
        getParticipantsCount(poll.poll_id),
      ]);

      return transformPollData(poll, consensusCount, statementsCount, votesCount, participantsCount);
    })
  );

  // Filter out polls from inactive rounds - now handled by round active_status
  return transformedPolls.filter(poll => 
    poll.round?.active_status === 'active' || poll.round?.active_status === 'pending'
  );
};

export const fetchAllPolls = async (): Promise<Poll[]> => {
  const { data: polls, error } = await supabase
    .from('polis_polls')
    .select(`
      *,
      polis_poll_categories(name),
      polis_rounds(round_id, title, start_time, end_time, publish_status)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all polls:', error);
    throw error;
  }

  if (!polls) return [];

  // Transform polls with additional data
  const transformedPolls = await Promise.all(
    polls.map(async (poll) => {
      const [consensusCount, statementsCount, votesCount, participantsCount] = await Promise.all([
        getConsensusPointsCount(poll.poll_id),
        getStatementsCount(poll.poll_id),
        getVotesCount(poll.poll_id),
        getParticipantsCount(poll.poll_id),
      ]);

      return transformPollData(poll, consensusCount, statementsCount, votesCount, participantsCount);
    })
  );

  return transformedPolls;
};

export const fetchPollById = async (pollId: string): Promise<Poll | null> => {
  const { data: poll, error } = await supabase
    .from('polis_polls')
    .select(`
      *,
      polis_poll_categories(name),
      polis_rounds(round_id, title, start_time, end_time, publish_status)
    `)
    .eq('poll_id', pollId)
    .single();

  if (error) {
    console.error('Error fetching poll by ID:', error);
    return null;
  }

  if (!poll) return null;

  const [consensusCount, statementsCount, votesCount, participantsCount] = await Promise.all([
    getConsensusPointsCount(poll.poll_id),
    getStatementsCount(poll.poll_id),
    getVotesCount(poll.poll_id),
    getParticipantsCount(poll.poll_id),
  ]);

  return transformPollData(poll, consensusCount, statementsCount, votesCount, participantsCount);
};

export const fetchPollBySlug = async (slug: string): Promise<Poll | null> => {
  const { data: poll, error } = await supabase
    .from('polis_polls')
    .select(`
      *,
      polis_poll_categories(name),
      polis_rounds(round_id, title, start_time, end_time, publish_status)
    `)
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching poll by slug:', error);
    return null;
  }

  if (!poll) return null;

  const [consensusCount, statementsCount, votesCount, participantsCount] = await Promise.all([
    getConsensusPointsCount(poll.poll_id),
    getStatementsCount(poll.poll_id),
    getVotesCount(poll.poll_id),
    getParticipantsCount(poll.poll_id),
  ]);

  return transformPollData(poll, consensusCount, statementsCount, votesCount, participantsCount);
};

// Helper functions to get additional poll data
async function getConsensusPointsCount(pollId: string): Promise<number> {
  const { count } = await supabase
    .from('polis_consensus_points')
    .select('*', { count: 'exact', head: true })
    .eq('poll_id', pollId);
  
  return count || 0;
}

async function getStatementsCount(pollId: string): Promise<number> {
  const { count } = await supabase
    .from('polis_statements')
    .select('*', { count: 'exact', head: true })
    .eq('poll_id', pollId)
    .eq('is_approved', true);
  
  return count || 0;
}

async function getVotesCount(pollId: string): Promise<number> {
  const { count } = await supabase
    .from('polis_votes')
    .select('*', { count: 'exact', head: true })
    .eq('poll_id', pollId);
  
  return count || 0;
}

async function getParticipantsCount(pollId: string): Promise<number> {
  const { data } = await supabase
    .from('polis_votes')
    .select('user_id, session_id')
    .eq('poll_id', pollId);

  if (!data) return 0;

  const uniqueParticipants = new Set();
  data.forEach(vote => {
    const participantId = vote.user_id || vote.session_id;
    if (participantId) {
      uniqueParticipants.add(participantId);
    }
  });

  return uniqueParticipants.size;
}
