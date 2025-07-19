
import React from 'react';
import { PollSection } from './PollSection';
import { Poll } from '@/types/poll';
import { getPollStatus } from '@/utils/pollStatusUtils';

interface PollsGridProps {
  polls: Poll[];
  onJoinPoll: (pollId: string) => void;
}

export const PollsGrid: React.FC<PollsGridProps> = ({ polls, onJoinPoll }) => {
  // Group polls by status
  const activePollsData = polls.filter(poll => getPollStatus(poll) === 'active');
  const completedPollsData = polls.filter(poll => getPollStatus(poll) === 'completed');
  const pendingPollsData = polls.filter(poll => getPollStatus(poll) === 'pending');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16">
      <div className="container mx-auto px-4 space-y-16">
        {/* Active Polls */}
        {activePollsData.length > 0 && (
          <PollSection 
            title="🔥 סקרים פעילים"
            subtitle="הצטרף עכשיו ועזור לקהילה להגיע להסכמה"
            polls={activePollsData}
            onJoinPoll={onJoinPoll}
            variant="active"
          />
        )}
        
        {/* Pending Polls */}
        {pendingPollsData.length > 0 && (
          <PollSection 
            title="⏳ סקרים בקרוב"
            subtitle="סקרים שיתחילו בקרוב - הירשם להתראות"
            polls={pendingPollsData}
            onJoinPoll={onJoinPoll}
            variant="pending"
          />
        )}
        
        {/* Completed Polls */}
        {completedPollsData.length > 0 && (
          <PollSection 
            title="✅ סקרים שהושלמו"
            subtitle="צפה בתוצאות ובהישגי הקהילה"
            polls={completedPollsData}
            onJoinPoll={onJoinPoll}
            variant="completed"
          />
        )}
        
        {/* Empty State */}
        {polls.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">אין סקרים זמינים כרגע</h2>
            <p className="text-gray-500">חזור בקרוב לסקרים חדשים ומעניינים</p>
          </div>
        )}
      </div>
    </div>
  );
};
