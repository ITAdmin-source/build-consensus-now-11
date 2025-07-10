import React from 'react';
import { NavigationHeader } from '@/components/NavigationHeader';
import { PollHeader } from '@/components/PollHeader';
import { OptimizedVotingInterface } from '@/components/OptimizedVotingInterface';
import { Poll, Statement } from '@/types/poll';
import { UserPoints } from '@/integrations/supabase/userPoints';

interface VotingPageProps {
  poll: Poll;
  currentStatement: Statement | null;
  unvotedStatements: Statement[];
  totalStatements: number;
  userVoteCount: number;
  userPoints: UserPoints;
  onVote: (statementId: string, vote: string) => void;
  onViewResults: () => void;
  onBackToHome: () => void;
  onSubmitStatement: (content: string, contentType: string) => void;
  isVoting?: boolean;
}

export const VotingPage: React.FC<VotingPageProps> = ({
  poll,
  currentStatement,
  unvotedStatements,
  totalStatements,
  userVoteCount,
  userPoints,
  onVote,
  onViewResults,
  onBackToHome,
  onSubmitStatement,
  isVoting = false
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <NavigationHeader currentPage="voting" userPoints={userPoints} />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-4 animate-fade-in">
          <PollHeader
            poll={poll}
            currentPage="voting"
            onNavigateToResults={onViewResults}
          />
        </div>
        
        <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <OptimizedVotingInterface
            poll={poll}
            statement={currentStatement}
            userVoteCount={userVoteCount}
            totalStatements={totalStatements}
            remainingStatements={unvotedStatements.length}
            userPoints={userPoints}
            onVote={onVote}
            onViewResults={onViewResults}
            onSubmitStatement={onSubmitStatement}
            isVoting={isVoting}
          />
        </div>
        
      </div>
    </div>
  );
};