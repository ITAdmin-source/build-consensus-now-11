
import React, { useState, useMemo, useEffect } from 'react';
import { NavigationHeader } from '@/components/NavigationHeader';
import { PollHeader } from '@/components/PollHeader';
import { LiveIndicator } from '@/components/LiveIndicator';
import { CompletedPollBanner } from '@/components/CompletedPollBanner';
import { useSmartClustering } from '@/hooks/useSmartClustering';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Poll, Statement, ConsensusPoint, Group, GroupStatementStats } from '@/types/poll';
import { UserPoints } from '@/integrations/supabase/userPoints';
import { ResultsStoryLayout } from '@/components/results/ResultsStoryLayout';

interface DetailedResultsPageProps {
  poll: Poll;
  statements: Statement[];
  consensusPoints: ConsensusPoint[];
  groups: Group[];
  groupStats: GroupStatementStats[];
  userPoints: UserPoints;
  onBackToHome: () => void;
  onNavigateToVoting?: () => void;
  onBackToSimplified?: () => void;
  isLive?: boolean;
  isPollCompleted?: boolean;
}

export const DetailedResultsPage: React.FC<DetailedResultsPageProps> = ({
  poll,
  statements,
  consensusPoints,
  groups,
  groupStats,
  userPoints,
  onBackToHome,
  onNavigateToVoting,
  onBackToSimplified,
  isLive = false,
  isPollCompleted = false
}) => {
  const { manualTrigger, isRunning, isChecking } = useSmartClustering({
    pollId: poll.poll_id,
    autoTrigger: !isPollCompleted // Only auto-trigger for active polls
  });

  const handleManualClustering = async () => {
    if (isPollCompleted) return;
    
    try {
      await manualTrigger(true); // Force recalculation
      // The real-time system will automatically update the UI
    } catch (error) {
      console.error('Manual clustering failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <NavigationHeader currentPage="results" userPoints={userPoints} />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Completed Poll Banner */}
        {isPollCompleted && (
          <div className="mb-6">
            <CompletedPollBanner poll={poll} />
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <PollHeader
              poll={poll}
              currentPage="results"
              onNavigateToVoting={onNavigateToVoting}
              isPollCompleted={isPollCompleted}
            />
          </div>
          <div className="flex items-center gap-2">
            {onBackToSimplified && (
              <Button
                onClick={onBackToSimplified}
                variant="outline"
                size="sm"
                className="hebrew-text"
              >
                <div className="h-4 w-4 ml-2">←</div>
                חזור לתצוגה פשוטה
              </Button>
            )}
            {!isPollCompleted && (
              <Button
                onClick={handleManualClustering}
                disabled={isRunning || isChecking}
                variant="outline"
                size="sm"
                className="hebrew-text"
              >
                <RefreshCw className={`h-4 w-4 ml-2 ${(isRunning || isChecking) ? 'animate-spin' : ''}`} />
                {isRunning ? 'מעבד...' : isChecking ? 'בודק...' : 'רענן קבצה'}
              </Button>
            )}
            <LiveIndicator isLive={!isPollCompleted && isLive} className="mr-2" />
          </div>
        </div>
        
        {/* New Story Layout */}
        <ResultsStoryLayout
          poll={poll}
          statements={statements}
          consensusPoints={consensusPoints}
          groups={groups}
          groupStats={groupStats}
          userPoints={userPoints}
          isPollCompleted={isPollCompleted}
        />
      </div>
    </div>
  );
};
