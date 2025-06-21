
import React from 'react';
import { Poll } from '@/types/poll';

interface QuickStatsProps {
  polls: Poll[];
}

export const QuickStats: React.FC<QuickStatsProps> = ({ polls }) => {
  const activePolls = polls.filter(p => p.status === 'active').length;
  const totalConsensusPoints = polls.reduce((sum, p) => sum + p.current_consensus_points, 0);
  const totalVotes = polls.reduce((sum, p) => sum + p.total_votes, 0);
  const winningPolls = polls.filter(p => p.current_consensus_points >= p.min_consensus_points_to_win).length;

  return (
    <div className="bg-white border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-xl md:text-2xl font-bold text-blue-600">
              {activePolls}
            </div>
            <div className="text-xs md:text-sm text-muted-foreground">סקרים פעילים</div>
          </div>
          <div className="space-y-1">
            <div className="text-xl md:text-2xl font-bold text-green-600">
              {totalConsensusPoints}
            </div>
            <div className="text-xs md:text-sm text-muted-foreground">נקודות חיבור</div>
          </div>
          <div className="space-y-1">
            <div className="text-xl md:text-2xl font-bold text-purple-600">
              {totalVotes}
            </div>
            <div className="text-xs md:text-sm text-muted-foreground">הצבעות</div>
          </div>
          <div className="space-y-1">
            <div className="text-xl md:text-2xl font-bold text-orange-600">
              {winningPolls}
            </div>
            <div className="text-xs md:text-sm text-muted-foreground">ניצחונות</div>
          </div>
        </div>
      </div>
    </div>
  );
};
