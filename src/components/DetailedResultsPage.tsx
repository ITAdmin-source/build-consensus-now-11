
import React from 'react';
import { UnifiedLayoutWrapper } from '@/components/UnifiedLayoutWrapper';
import { CompletedPollBanner } from '@/components/CompletedPollBanner';
import { useSmartClustering } from '@/hooks/useSmartClustering';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, LayoutGrid, List } from 'lucide-react';
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
    <UnifiedLayoutWrapper
      poll={poll}
      userPoints={userPoints}
      currentState="results"
      containerWidth="full"
      isPollCompleted={isPollCompleted}
      className="animate-fade-in"
    >
      {/* Completed Poll Banner */}
      {isPollCompleted && (
        <div className="mb-6">
          <CompletedPollBanner poll={poll} />
        </div>
      )}

      {/* Action Buttons Section */}
      <Card className="mb-6 bg-card/50 border-border shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {onBackToSimplified && (
                <Button
                  onClick={onBackToSimplified}
                  variant="outline"
                  size="sm"
                  className="hebrew-text hover:bg-muted/50 transition-colors"
                >
                  <List className="h-4 w-4 ml-2" />
                  תצוגה פשוטה
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
      <div className="animate-fade-in">
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
    </UnifiedLayoutWrapper>
  );
};
