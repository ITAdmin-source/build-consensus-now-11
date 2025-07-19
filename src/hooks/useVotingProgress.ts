
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
  statements: Statement[],
  userVotes: Record<string, string>
): VotingProgress => {
  return useMemo(() => {
    if (!poll || statements.length === 0) {
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
    const completionPercentage = totalCount > 0 ? Math.round((votedCount / totalCount) * 100) : 0;
    
    return {
      votedCount,
      totalCount,
      completionPercentage,
      isComplete: completionPercentage === 100,
      isStarted: votedCount > 0,
    };
  }, [poll, statements, userVotes]);
};
