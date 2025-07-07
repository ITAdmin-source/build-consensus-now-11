
import { Poll } from '@/types/poll';
import { 
  fetchActivePolls as fetchActivePollsQuery,
  fetchAllPolls as fetchAllPollsQuery,
  fetchPollBySlug as fetchPollBySlugQuery
} from './queries';

export const fetchActivePolls = async (): Promise<Poll[]> => {
  try {
    console.log('Fetching active polls...');
    return await fetchActivePollsQuery();
  } catch (error) {
    console.error('Error in fetchActivePolls:', error);
    throw error;
  }
};

export const fetchPollById = async (pollId: string): Promise<Poll | null> => {
  try {
    console.log('Fetching poll by ID:', pollId);
    return await fetchPollBySlugQuery(pollId); // For now, use slug query as fallback
  } catch (error) {
    console.error('Error in fetchPollById:', error);
    throw error;
  }
};

export const fetchPollBySlug = async (slug: string): Promise<Poll | null> => {
  try {
    console.log('Fetching poll by slug:', slug);
    return await fetchPollBySlugQuery(slug);
  } catch (error) {
    console.error('Error in fetchPollBySlug:', error);
    throw error;
  }
};

export const fetchAllPolls = async (): Promise<Poll[]> => {
  try {
    console.log('Fetching all polls for admin...');
    return await fetchAllPollsQuery();
  } catch (error) {
    console.error('Error in fetchAllPolls:', error);
    throw error;
  }
};

// Re-export types for convenience
export type { CreatePollData } from './types';

