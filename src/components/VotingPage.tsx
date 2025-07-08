
import React from 'react';
import { NavigationHeader } from '@/components/NavigationHeader';
import { PollHeader } from '@/components/PollHeader';
import { OptimizedVotingInterface } from '@/components/OptimizedVotingInterface';
import { GameParticles } from '@/components/GameParticles';
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
  isVoting?: boolean;
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
  onSubmitStatement,
  isVoting = false
}) => {
  return (
    <div className="min-h-screen gaming-bg relative overflow-hidden">
      <GameParticles count={12} className="opacity-20" />
      
      <NavigationHeader currentPage="voting" />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl relative z-10">
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
