import React, { useState, useEffect } from 'react';
import { UnifiedLayoutWrapper } from '@/components/UnifiedLayoutWrapper';
import { WelcomeOverlay } from '@/components/WelcomeOverlay';
import { OptimizedVotingInterface } from '@/components/OptimizedVotingInterface';
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
  isDataLoading?: boolean;
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
  isLive = false,
  isDataLoading = false
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
    <>
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

      <UnifiedLayoutWrapper
        poll={poll}
        userPoints={userPoints}
        currentState="voting"
        containerWidth="narrow"
        showTopSection={false} // Hide top section for voting to reduce clutter
        showBreadcrumb={true}
        userVoteCount={userVoteCount}
        totalStatements={totalStatements}
      >
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
          isDataLoading={isDataLoading}
        />
      </UnifiedLayoutWrapper>
    </>
  );
};