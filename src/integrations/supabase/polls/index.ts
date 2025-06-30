
import { Poll } from '@/types/poll';
import { 
  getPollsWithCategories, 
  getPollByField, 
  getConsensusPointsCounts, 
  getStatementsCounts, 
  getVotesCounts,
  getPollStatistics
} from './queries';
import { transformPollData } from './transformers';

export const fetchActivePolls = async (): Promise<Poll[]> => {
  try {
    console.log('Fetching active polls...');
    
    const { data: pollsData, error: pollsError } = await getPollsWithCategories('active');

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

    // Get counts for all polls including participants
    const [consensusCounts, statementsCounts, votesCounts] = await Promise.all([
      getConsensusPointsCounts(pollIds),
      getStatementsCounts(pollIds),
      getVotesCounts(pollIds)
    ]);

    // Get participant counts for each poll
    const pollsWithParticipants = await Promise.all(
      pollsData.map(async (poll) => {
        const stats = await getPollStatistics(poll.poll_id);
        return transformPollData(
          poll,
          consensusCounts[poll.poll_id] || 0,
          statementsCounts[poll.poll_id] || 0,
          votesCounts[poll.poll_id] || 0,
          stats.participantsCount
        );
      })
    );

    console.log('Transformed polls with participants:', pollsWithParticipants);
    return pollsWithParticipants;
  } catch (error) {
    console.error('Error in fetchActivePolls:', error);
    throw error;
  }
};

export const fetchPollById = async (pollId: string): Promise<Poll | null> => {
  try {
    console.log('Fetching poll by ID:', pollId);
    
    const { data, error } = await getPollByField('poll_id', pollId);

    if (error) {
      console.error('Error fetching poll:', error);
      throw error;
    }

    if (!data) {
      console.log('No poll found with ID:', pollId);
      return null;
    }

    // Get additional statistics including participants
    const { consensusCount, statementsCount, votesCount, participantsCount } = await getPollStatistics(data.poll_id);

    const transformedPoll = transformPollData(data, consensusCount, statementsCount, votesCount, participantsCount);

    console.log('Transformed poll:', transformedPoll);
    return transformedPoll;
  } catch (error) {
    console.error('Error in fetchPollById:', error);
    throw error;
  }
};

export const fetchPollBySlug = async (slug: string): Promise<Poll | null> => {
  try {
    console.log('Fetching poll by slug:', slug);
    
    const { data, error } = await getPollByField('slug', slug);

    if (error) {
      console.error('Error fetching poll by slug:', error);
      throw error;
    }

    if (!data) {
      console.log('No poll found with slug:', slug);
      return null;
    }

    // Get additional statistics including participants
    const { consensusCount, statementsCount, votesCount, participantsCount } = await getPollStatistics(data.poll_id);

    const transformedPoll = transformPollData(data, consensusCount, statementsCount, votesCount, participantsCount);

    console.log('Transformed poll by slug:', transformedPoll);
    return transformedPoll;
  } catch (error) {
    console.error('Error in fetchPollBySlug:', error);
    throw error;
  }
};

export const fetchAllPolls = async (): Promise<Poll[]> => {
  try {
    console.log('Fetching all polls for admin...');
    
    const { data: pollsData, error: pollsError } = await getPollsWithCategories();

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

    // Get counts for all polls
    const [consensusCounts, statementsCounts, votesCounts] = await Promise.all([
      getConsensusPointsCounts(pollIds),
      getStatementsCounts(pollIds),
      getVotesCounts(pollIds)
    ]);

    // Get participant counts for each poll
    const pollsWithParticipants = await Promise.all(
      pollsData.map(async (poll) => {
        const stats = await getPollStatistics(poll.poll_id);
        return transformPollData(
          poll,
          consensusCounts[poll.poll_id] || 0,
          statementsCounts[poll.poll_id] || 0,
          votesCounts[poll.poll_id] || 0,
          stats.participantsCount
        );
      })
    );

    console.log('All transformed polls with participants:', pollsWithParticipants);
    return pollsWithParticipants;
  } catch (error) {
    console.error('Error in fetchAllPolls:', error);
    throw error;
  }
};

// Re-export types for convenience
export type { CreatePollData } from './types';
