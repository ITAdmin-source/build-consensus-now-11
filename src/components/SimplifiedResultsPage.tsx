import React, { useState } from 'react';
import { NavigationHeader } from '@/components/NavigationHeader';
import { PollHeader } from '@/components/PollHeader';
import { CountdownTimer } from '@/components/CountdownTimer';
import { SharePopup } from '@/components/SharePopup';
import { SimplifiedStatementsTable } from '@/components/SimplifiedStatementsTable';
import { VotingProgressSection } from '@/components/VotingProgressSection';
import { ConsensusPointsSummary } from '@/components/ConsensusPointsSummary';
import { DetailedResultsPage } from '@/components/DetailedResultsPage';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2, Eye, Home } from 'lucide-react';
import { Poll, Statement, ConsensusPoint, Group, GroupStatementStats } from '@/types/poll';
import { UserPoints } from '@/integrations/supabase/userPoints';

interface SimplifiedResultsPageProps {
  poll: Poll;
  statements: Statement[];
  consensusPoints: ConsensusPoint[];
  groups: Group[];
  groupStats: GroupStatementStats[];
  userPoints: UserPoints;
  onBackToHome: () => void;
  onNavigateToVoting?: () => void;
  isLive?: boolean;
  isPollCompleted?: boolean;
}

export const SimplifiedResultsPage: React.FC<SimplifiedResultsPageProps> = ({
  poll,
  statements,
  consensusPoints,
  groups,
  groupStats,
  userPoints,
  onBackToHome,
  onNavigateToVoting,
  isLive = false,
  isPollCompleted = false
}) => {
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [showDetailedResults, setShowDetailedResults] = useState(false);

  // If detailed results are requested, render the detailed page
  if (showDetailedResults) {
    return (
      <DetailedResultsPage
        poll={poll}
        statements={statements}
        consensusPoints={consensusPoints}
        groups={groups}
        groupStats={groupStats}
        userPoints={userPoints}
        onBackToHome={onBackToHome}
        onNavigateToVoting={onNavigateToVoting}
        onBackToSimplified={() => setShowDetailedResults(false)}
        isLive={isLive}
        isPollCompleted={isPollCompleted}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <NavigationHeader currentPage="results" userPoints={userPoints} />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Poll Header */}
        <div className="mb-6">
          <PollHeader
            poll={poll}
            currentPage="results"
            onNavigateToVoting={onNavigateToVoting}
            isPollCompleted={isPollCompleted}
          />
        </div>

        {/* Main Content Card */}
        <Card className="mb-6">
          <CardContent className="p-6 space-y-6">
            {/* Voting Progress or Total Votes */}
            {isPollCompleted ? (
              <ConsensusPointsSummary
                totalVotes={poll.total_votes || 0}
                consensusPointsCount={consensusPoints.length}
                participantCount={poll.total_participants || 0}
              />
            ) : (
            <VotingProgressSection
              currentVotes={poll.total_votes || 0}
              goalVotes={poll.voting_goal || 1000}
            />
            )}

            {/* Countdown Timer (only for active polls) */}
            {!isPollCompleted && poll.time_left > 0 && (
              <div className="flex justify-center">
                <CountdownTimer 
                  endTime={new Date(Date.now() + poll.time_left).toISOString()} 
                  className="text-lg font-medium"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => setShowSharePopup(true)}
                variant="outline"
                className="flex items-center gap-2 hebrew-text"
              >
                <Share2 className="h-4 w-4" />
                שתף סקר
              </Button>
              
              <Button
                onClick={() => setShowDetailedResults(true)}
                className="flex items-center gap-2 hebrew-text"
              >
                <Eye className="h-4 w-4" />
                צפה בתוצאות מפורטות
              </Button>
              
              <Button
                onClick={onBackToHome}
                variant="secondary"
                className="flex items-center gap-2 hebrew-text"
              >
                <Home className="h-4 w-4" />
                כל הסקרים
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Statements List */}
        <SimplifiedStatementsTable
          statements={statements}
          consensusPoints={consensusPoints}
        />
      </div>

      {/* Share Popup */}
      <SharePopup
        open={showSharePopup}
        onOpenChange={setShowSharePopup}
        poll={poll}
      />
    </div>
  );
};