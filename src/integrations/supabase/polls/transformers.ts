
import { Database } from '../types';
import { Poll } from '@/types/poll';

type PollRow = Database['public']['Tables']['polis_polls']['Row'] & {
  polis_poll_categories: { name: string } | null;
  polis_rounds: {
    round_id: string;
    title: string;
    start_time: string;
    end_time: string;
    publish_status: string;
  } | null;
};

type ClusteringStatus = 'never_run' | 'pending' | 'running' | 'completed' | 'failed';

const isValidClusteringStatus = (status: string | null): status is ClusteringStatus => {
  return status !== null && ['never_run', 'pending', 'running', 'completed', 'failed'].includes(status);
};

export const transformPollData = (
  poll: PollRow,
  consensusCount: number,
  statementsCount: number,
  votesCount: number,
  participantsCount?: number
): Poll => {
  // Calculate time_left from round end_time instead of poll end_time
  const endTime = poll.polis_rounds?.end_time || poll.end_time;
  const timeLeft = endTime ? new Date(endTime).getTime() - Date.now() : 0;
  const isExpired = timeLeft <= 0;
  
  // Calculate round active status
  let roundActiveStatus: 'pending' | 'active' | 'completed' | null = null;
  if (poll.polis_rounds && poll.polis_rounds.publish_status === 'published') {
    const now = new Date();
    const startTime = new Date(poll.polis_rounds.start_time);
    const roundEndTime = new Date(poll.polis_rounds.end_time);
    
    if (now < startTime) {
      roundActiveStatus = 'pending';
    } else if (now >= startTime && now <= roundEndTime) {
      roundActiveStatus = 'active';
    } else {
      roundActiveStatus = 'completed';
    }
  }

  return {
    poll_id: poll.poll_id,
    title: poll.title,
    description: poll.description || '',
    category: poll.polis_poll_categories?.name || 'כללי',
    slug: poll.slug || '',
    time_left: Math.max(0, timeLeft),
    is_expired: isExpired,
    // status removed - now derived from round status
    min_consensus_points_to_win: poll.min_consensus_points_to_win || 3,
    current_consensus_points: consensusCount,
    total_statements: statementsCount,
    total_votes: votesCount,
    total_participants: participantsCount || 0,
    allow_user_statements: poll.allow_user_statements || false,
    auto_approve_statements: poll.auto_approve_statements || false,
    created_at: poll.created_at || new Date().toISOString(),
    created_by: poll.created_by,
    clustering_status: isValidClusteringStatus(poll.clustering_status) ? poll.clustering_status : 'never_run',
    last_clustered_at: poll.last_clustered_at,
    min_support_pct: poll.min_support_pct || 50,
    max_opposition_pct: poll.max_opposition_pct || 50,
    min_votes_per_group: poll.min_votes_per_group || 1,
    round_id: poll.round_id,
    round: poll.polis_rounds ? {
      round_id: poll.polis_rounds.round_id,
      title: poll.polis_rounds.title,
      start_time: poll.polis_rounds.start_time,
      end_time: poll.polis_rounds.end_time,
      publish_status: poll.polis_rounds.publish_status as 'draft' | 'published',
      active_status: roundActiveStatus,
    } : undefined,
    support_button_label: poll.support_button_label || 'תומך',
    unsure_button_label: poll.unsure_button_label || 'לא בטוח',
    oppose_button_label: poll.oppose_button_label || 'מתנגד',
    voting_goal: poll.voting_goal || 1000,
  };
};
