
import { Database } from '../types';
import { Poll } from '@/types/poll';

type PollRow = Database['public']['Tables']['polis_polls']['Row'] & {
  polis_poll_categories: { name: string } | null;
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
  const timeLeft = poll.end_time ? new Date(poll.end_time).getTime() - Date.now() : 0;
  const isExpired = timeLeft <= 0;

  return {
    poll_id: poll.poll_id,
    title: poll.title,
    topic: poll.topic || '',
    description: poll.description || '',
    category: poll.polis_poll_categories?.name || 'כללי',
    category_id: poll.category_id,
    slug: poll.slug || '',
    end_time: poll.end_time,
    time_left: Math.max(0, timeLeft),
    is_expired: isExpired,
    status: poll.status as 'draft' | 'active' | 'closed',
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
    min_votes_per_group: poll.min_votes_per_group || 1
  };
};
