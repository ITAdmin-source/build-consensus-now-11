
import { supabase } from './client';
import { getOrCreateSessionId } from '@/utils/sessionUtils';

export interface UserVotingProgress {
  votedCount: number;
  totalCount: number;
  completionPercentage: number;
  isComplete: boolean;
  isStarted: boolean;
}

export const getUserVotingProgress = async (pollId: string): Promise<UserVotingProgress> => {
  const { data: { user } } = await supabase.auth.getUser();
  const sessionId = getOrCreateSessionId();

  try {
    // Get total approved statements count for this poll
    const { count: totalCount } = await supabase
      .from('polis_statements')
      .select('*', { count: 'exact', head: true })
      .eq('poll_id', pollId)
      .eq('is_approved', true);

    // Get user's votes count for this poll
    let votesQuery = supabase
      .from('polis_votes')
      .select('statement_id', { count: 'exact', head: true })
      .eq('poll_id', pollId);

    if (user) {
      votesQuery = votesQuery.eq('user_id', user.id);
    } else {
      votesQuery = votesQuery.eq('session_id', sessionId);
    }

    const { count: votedCount } = await votesQuery;

    const total = totalCount || 0;
    const voted = votedCount || 0;
    const completionPercentage = total > 0 ? Math.round((voted / total) * 100) : 0;

    return {
      votedCount: voted,
      totalCount: total,
      completionPercentage,
      isComplete: completionPercentage === 100,
      isStarted: voted > 0,
    };
  } catch (error) {
    console.error('Error fetching user voting progress:', error);
    return {
      votedCount: 0,
      totalCount: 0,
      completionPercentage: 0,
      isComplete: false,
      isStarted: false,
    };
  }
};
