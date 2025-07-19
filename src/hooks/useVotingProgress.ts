
import { useMemo } from 'react';
import type { Poll, Statement } from '@/types/poll';

interface VotingProgress {
  votedCount: number;
  totalCount: number;
  completionPercentage: number;
  isComplete: boolean;
  isStarted: boolean;
}

export const useVotingProgress = (
  poll: Poll | null,
  statements: Statement[] = [],
  userVotes: Record<string, string> = {},
  summaryProgress?: VotingProgress | null
): VotingProgress => {
  return useMemo(() => {
    if (!poll) {
      return {
        votedCount: 0,
        totalCount: 0,
        completionPercentage: 0,
        isComplete: false,
        isStarted: false,
      };
    }

    // Summary Mode: Use provided progress data (for home page cards)
    if (summaryProgress) {
      // Ensure summary progress is also capped at 100%
      return {
        ...summaryProgress,
        completionPercentage: Math.min(100, summaryProgress.completionPercentage),
        isComplete: summaryProgress.votedCount >= summaryProgress.totalCount && summaryProgress.totalCount > 0,
      };
    }

    // Detailed Mode: Calculate from statements and votes (for individual poll pages)
    if (statements.length === 0) {
      return {
        votedCount: 0,
        totalCount: 0,
        completionPercentage: 0,
        isComplete: false,
        isStarted: false,
      };
    }

    const approvedStatements = statements.filter(s => s.is_approved);
    const totalCount = approvedStatements.length;
    const votedCount = approvedStatements.filter(s => userVotes[s.statement_id]).length;
    
    // Cap completion percentage at 100% to handle cases where statements were deleted after voting
    const rawCompletionPercentage = totalCount > 0 ? (votedCount / totalCount) * 100 : 0;
    const completionPercentage = Math.min(100, Math.round(rawCompletionPercentage));
    
    // Mark as complete if voted count meets or exceeds total count
    const isComplete = votedCount >= totalCount && totalCount > 0;
    
    return {
      votedCount,
      totalCount,
      completionPercentage,
      isComplete,
      isStarted: votedCount > 0,
    };
  }, [poll, statements, userVotes, summaryProgress]);
};
