
import React, { useState, useMemo, useEffect } from 'react';
import { NavigationHeader } from '@/components/NavigationHeader';
import { CompletedPollBanner } from '@/components/CompletedPollBanner';
import { useSmartClustering } from '@/hooks/useSmartClustering';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  onBackToSimplified?: () => void;
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
  onBackToSimplified,
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
      <NavigationHeader currentPage="results" userPoints={userPoints} poll={poll} />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Completed Poll Banner */}
        {isPollCompleted && (
          <div className="mb-6">
            <CompletedPollBanner poll={poll} />
          </div>
        )}

        {/* Action Buttons Section */}
        <Card className="mb-6 bg-slate-50/50 border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
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
              </div>
            </div>
          </CardContent>
        </Card>
        
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
