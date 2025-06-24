
import { Poll } from '@/types/poll';
import type { PollQueryResult } from './types';

export const transformPollData = (
  poll: PollQueryResult,
  consensusCount: number = 0,
  statementsCount: number = 0,
  votesCount: number = 0
): Poll => ({
  poll_id: poll.poll_id,
  title: poll.title,
  topic: poll.topic || '',
  description: poll.description || '',
  category: poll.polis_poll_categories?.name || 'כללי',
  end_time: poll.end_time,
  min_consensus_points_to_win: poll.min_consensus_points_to_win || 3,
  allow_user_statements: poll.allow_user_statements || false,
  auto_approve_statements: poll.auto_approve_statements || false,
  status: poll.status as 'draft' | 'active' | 'closed',
  min_support_pct: poll.min_support_pct || 50,
  max_opposition_pct: poll.max_opposition_pct || 50,
  min_votes_per_group: poll.min_votes_per_group || 1,
  current_consensus_points: consensusCount,
  total_statements: statementsCount,
  total_votes: votesCount,
  slug: poll.slug || ''
});
