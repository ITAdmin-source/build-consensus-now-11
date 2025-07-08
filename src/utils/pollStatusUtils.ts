
import { Poll } from '@/types/poll';

export type PollStatus = 'draft' | 'pending' | 'active' | 'completed' | 'closed';

/**
 * Derives poll status from round status
 * - round.publish_status = 'draft' -> 'draft' (hidden from main page)
 * - round.active_status = 'pending' -> 'pending' (shown on main page)  
 * - round.active_status = 'active' -> 'active'
 * - round.active_status = 'completed' -> 'completed'
 */
export const getPollStatus = (poll: Poll): PollStatus => {
  if (!poll.round) {
    return 'draft';
  }

  // If round is not published, poll is in draft
  if (poll.round.publish_status === 'draft') {
    return 'draft';
  }

  // If round is published, derive status from active_status
  switch (poll.round.active_status) {
    case 'pending':
      return 'pending';
    case 'active':
      return 'active';
    case 'completed':
      return 'completed';
    default:
      return 'draft';
  }
};

/**
 * Check if poll should be visible on main page
 * Draft polls should not be shown
 */
export const isPollVisible = (poll: Poll): boolean => {
  const status = getPollStatus(poll);
  return status !== 'draft';
};

/**
 * Check if poll is currently active for voting
 */
export const isPollActive = (poll: Poll): boolean => {
  const status = getPollStatus(poll);
  return status === 'active' || status === 'pending';
};

/**
 * Check if poll is completed
 */
export const isPollCompleted = (poll: Poll): boolean => {
  const status = getPollStatus(poll);
  return status === 'completed';
};
