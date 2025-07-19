
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
    
    // Cap completion percentage at 100% to handle cases where statements were deleted after voting
    const rawCompletionPercentage = total > 0 ? (voted / total) * 100 : 0;
    const completionPercentage = Math.min(100, Math.round(rawCompletionPercentage));
    
    // Mark as complete if voted count meets or exceeds total count
    const isComplete = voted >= total && total > 0;

    return {
      votedCount: voted,
      totalCount: total,
      completionPercentage,
      isComplete,
      isStarted: voted > 0,
    };
  } catch (error) {
    console.error('Error fetching user voting progress:', error);
    // Return empty progress for errors or guest users without session
    return {
      votedCount: 0,
      totalCount: 0,
      completionPercentage: 0,
      isComplete: false,
      isStarted: false,
    };
  }
};

export const subscribeToPointsUpdates = async (
  callback: (points: UserPoints) => void
) => {
  const { data: { user } } = await supabase.auth.getUser();
  const sessionId = getOrCreateSessionId();

  if (!user && !sessionId) return null;

  const channel = supabase
    .channel('user-points-changes')
    .on(
      'postgres_changes',
      {
        event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'polis_user_points',
        filter: user ? `user_id=eq.${user.id}` : `session_id=eq.${sessionId}`
      },
      (payload) => {
        console.log('Points update received:', payload);
        const newData = payload.new as UserPoints;
        if (newData) {
          callback(newData);
        }
      }
    )
    .subscribe((status) => {
      console.log('Points subscription status:', status);
    });

  return channel;
};

// Add missing UserPoints interface import
interface UserPoints {
  total_points: number;
  votes_count: number;
  last_updated: string;
}
