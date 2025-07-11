import React, { useState, useEffect } from 'react';
import { NavigationHeader } from '@/components/NavigationHeader';
import { WelcomeOverlay } from '@/components/WelcomeOverlay';
import { GameHeader } from '@/components/GameHeader';
import { OptimizedVotingInterface } from '@/components/OptimizedVotingInterface';
import { LiveActivityFeed } from '@/components/LiveActivityFeed';
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
  participantCount?: number;
  consensusPointsCount?: number;
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

      <NavigationHeader currentPage="voting" userPoints={userPoints} />
      
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        {/* Enhanced Game Header */}
        <div className="mb-6 animate-fade-in">
          <GameHeader
            poll={poll}
            participantCount={participantCount}
            consensusPointsCount={consensusPointsCount}
            userPoints={userPoints}
            isLive={isLive}
          />
        </div>
        
        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Voting Interface - Main Content */}
          <div className="lg:col-span-3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
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

          {/* Live Activity Sidebar
          <div className="lg:col-span-1 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="sticky top-4 space-y-4">
              <LiveActivityFeed
                participantCount={participantCount}
                consensusPointsCount={consensusPointsCount}
                isLive={isLive}
              />
            </div>
          </div>*/}
        </div>
      </div>
    </div>
  );
};