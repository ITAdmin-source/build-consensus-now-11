import React, { useState, useEffect } from 'react';
import { NavigationHeader } from '@/components/NavigationHeader';
import { WelcomeOverlay } from '@/components/WelcomeOverlay';
import { GameHeader } from '@/components/GameHeader';
import { OptimizedVotingInterface } from '@/components/OptimizedVotingInterface';
import { LiveActivityFeed } from '@/components/LiveActivityFeed';
import { Poll, Statement, Group } from '@/types/poll';
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
  participantCount?: number;
  consensusPointsCount?: number;
  totalVotes?: number;
  groups?: Group[];
  isLive?: boolean;
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
  isVoting = false,
  participantCount = 1,
  consensusPointsCount = 0,
  totalVotes = 0,
  groups = [],
  isLive = false
}) => {
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Check if this is the first visit to this poll
    const hasVisited = localStorage.getItem(`poll-welcome-${poll.poll_id}`);
    if (!hasVisited) {
      setShowWelcome(true);
    }
  }, [poll.poll_id]);

  const handleStartVoting = () => {
    setShowWelcome(false);
  };

  const handleShowTutorial = () => {
    // Tutorial is handled within WelcomeOverlay
  };
  return (
    <div className="min-h-screen bg-background">
      {/* Welcome Overlay for first-time visitors */}
      {showWelcome && (
        <WelcomeOverlay
          poll={poll}
          participantCount={participantCount}
          consensusPointsCount={consensusPointsCount}
          onStartVoting={handleStartVoting}
          onShowTutorial={handleShowTutorial}
        />
      )}

      <NavigationHeader currentPage="voting" userPoints={userPoints} poll={poll} />
      
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Simplified Single Column Layout */}
        <div className="animate-fade-in">
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