
import React from 'react';
import { NavigationHeader } from '@/components/NavigationHeader';
import { PollHeader } from '@/components/PollHeader';
import { VotingProgress } from '@/components/VotingProgress';
import { VotingInterface } from '@/components/VotingInterface';
import { Poll, Statement } from '@/types/poll';

interface VotingPageProps {
  poll: Poll;
  currentStatement: Statement | null;
  unvotedStatements: Statement[];
  totalStatements: number;
  userVoteCount: number;
  onVote: (statementId: string, vote: string) => void;
  onViewResults: () => void;
  onBackToHome: () => void;
  onSubmitStatement: (content: string, contentType: string) => void;
}

export const VotingPage: React.FC<VotingPageProps> = ({
  poll,
  currentStatement,
  unvotedStatements,
  totalStatements,
  userVoteCount,
  onVote,
  onViewResults,
  onBackToHome,
  onSubmitStatement
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <NavigationHeader currentPage="voting" />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-4">
          <PollHeader
            poll={poll}
            currentPage="voting"
            onNavigateToResults={onViewResults}
          />
        </div>
        
        <VotingProgress
          poll={poll}
          userVoteCount={userVoteCount}
          totalStatements={totalStatements}
          remainingStatements={unvotedStatements.length}
        />
        
        <VotingInterface
          poll={poll}
          statement={currentStatement}
          userVoteCount={userVoteCount}
          totalStatements={totalStatements}
          remainingStatements={unvotedStatements.length}
          onVote={onVote}
          onViewResults={onViewResults}
          onSubmitStatement={onSubmitStatement}
        />
      </div>
    </div>
  );
};
