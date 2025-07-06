
import React from 'react';
import { NavigationHeader } from '@/components/NavigationHeader';
import { PollHeader } from '@/components/PollHeader';
import { ResultsDashboard } from '@/components/ResultsDashboard';
import { LiveIndicator } from '@/components/LiveIndicator';
import { useSmartClustering } from '@/hooks/useSmartClustering';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Poll, Statement, ConsensusPoint, Group, GroupStatementStats } from '@/types/poll';

interface ResultsPageProps {
  poll: Poll;
  statements: Statement[];
  consensusPoints: ConsensusPoint[];
  groups: Group[];
  groupStats: GroupStatementStats[];
  onBackToHome: () => void;
  onNavigateToVoting?: () => void;
  isLive?: boolean;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({
  poll,
  statements,
  consensusPoints,
  groups,
  groupStats,
  onBackToHome,
  onNavigateToVoting,
  isLive = false
}) => {
  const { manualTrigger, isRunning, isChecking } = useSmartClustering({
    pollId: poll.poll_id,
    autoTrigger: true // Enable auto-clustering when visiting results page
  });

  const handleManualClustering = async () => {
    try {
      await manualTrigger(true); // Force recalculation
      // The real-time system will automatically update the UI
    } catch (error) {
      console.error('Manual clustering failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <NavigationHeader currentPage="results" />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <PollHeader
              poll={poll}
              currentPage="results"
              onNavigateToVoting={onNavigateToVoting}
            />
          </div>
          <div className="flex items-center gap-2">
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
            <LiveIndicator isLive={isLive} className="mr-2" />
          </div>
        </div>
        
        <div className="py-6">
          <ResultsDashboard
            poll={poll}
            statements={statements}
            consensusPoints={consensusPoints}
            groups={groups}
            groupStats={groupStats}
          />
        </div>
      </div>
    </div>
  );
};
