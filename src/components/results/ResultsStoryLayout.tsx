
import React from 'react';
import { Poll, Statement, ConsensusPoint, Group, GroupStatementStats } from '@/types/poll';
import { UserPoints } from '@/integrations/supabase/userPoints';
import { WelcomeOverview } from './WelcomeOverview';
import { OpinionGroupsSection } from './OpinionGroupsSection';
import { ConsensusAndDivides } from './ConsensusAndDivides';
import { TakeawaysSection } from './TakeawaysSection';
import { StatementsTable } from '@/components/StatementsTable';

interface ResultsStoryLayoutProps {
  poll: Poll;
  statements: Statement[];
  consensusPoints: ConsensusPoint[];
  groups: Group[];
  groupStats: GroupStatementStats[];
  userPoints: UserPoints;
  isPollCompleted?: boolean;
}

export const ResultsStoryLayout: React.FC<ResultsStoryLayoutProps> = ({
  poll,
  statements,
  consensusPoints,
  groups,
  groupStats,
  userPoints,
  isPollCompleted = false
}) => {
  // Calculate total participants from poll data
  const totalParticipants = poll.total_participants || 
    (groups.length > 0 ? groups.reduce((sum, group) => sum + group.member_count, 0) : 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-16">
        {/* Section 1: Welcome & Overview */}
        <WelcomeOverview 
          poll={poll}
          groups={groups}
          totalParticipants={totalParticipants}
          isPollCompleted={isPollCompleted}
        />

        {/* Section 2: Opinion Groups */}
        <OpinionGroupsSection 
          groups={groups}
          groupStats={groupStats}
          statements={statements}
          userPoints={userPoints}
        />

        {/* Section 3: Consensus & Divides */}
        <ConsensusAndDivides 
          poll={poll}
          statements={statements}
          consensusPoints={consensusPoints}
          groups={groups}
          groupStats={groupStats}
        />

        {/* Section 3b: Detailed Statements Analysis */}
        <div className="mt-12">
          <StatementsTable 
            statements={statements}
            groups={groups}
            groupStats={groupStats}
          />
        </div>

        {/* Section 4: Takeaways */}
        <TakeawaysSection 
          poll={poll}
          statements={statements}
          groups={groups}
          totalParticipants={totalParticipants}
        />
      </div>
    </div>
  );
};
