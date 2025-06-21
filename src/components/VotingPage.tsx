
import React from 'react';
import { NavigationHeader } from '@/components/NavigationHeader';
import { PollHeader } from '@/components/PollHeader';
import { VotingProgress } from '@/components/VotingProgress';
import { VotingInterface } from '@/components/VotingInterface';
import { Poll, Statement } from '@/types/poll';

interface VotingPageProps {
  poll: Poll;
  statements: Statement[];
  currentStatementIndex: number;
  userVotes: Record<string, string>;
  onVote: (statementId: string, vote: string) => void;
  onViewResults: () => void;
  onBackToHome: () => void;
  onSubmitStatement: (content: string, contentType: string) => void;
}

export const VotingPage: React.FC<VotingPageProps> = ({
  poll,
  statements,
  currentStatementIndex,
  userVotes,
  onVote,
  onViewResults,
  onBackToHome,
  onSubmitStatement
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <NavigationHeader currentPage="voting" />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <PollHeader
          poll={poll}
          currentPage="voting"
          onNavigateToResults={onViewResults}
        />
        
        <VotingProgress
          poll={poll}
          userVoteCount={Object.keys(userVotes).length}
          totalStatements={statements.length}
          currentStatementIndex={currentStatementIndex}
        />
        
        <VotingInterface
          poll={poll}
          statement={statements[currentStatementIndex]}
          onVote={onVote}
          userVoteCount={Object.keys(userVotes).length}
          totalStatements={statements.length}
          onViewResults={onViewResults}
          onSubmitStatement={onSubmitStatement}
        />
      </div>
    </div>
  );
};
