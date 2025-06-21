
import React from 'react';
import { NavigationHeader } from '@/components/NavigationHeader';
import { PollHeader } from '@/components/PollHeader';
import { ResultsDashboard } from '@/components/ResultsDashboard';
import { Poll, Statement, ConsensusPoint, Group, GroupStatementStats } from '@/types/poll';

interface ResultsPageProps {
  poll: Poll;
  statements: Statement[];
  consensusPoints: ConsensusPoint[];
  groups: Group[];
  groupStats: GroupStatementStats[];
  onBackToHome: () => void;
  onNavigateToVoting?: () => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({
  poll,
  statements,
  consensusPoints,
  groups,
  groupStats,
  onBackToHome,
  onNavigateToVoting
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <NavigationHeader currentPage="results" />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <PollHeader
          poll={poll}
          currentPage="results"
          onNavigateToVoting={onNavigateToVoting}
        />
        
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
