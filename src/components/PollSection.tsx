
import React from 'react';
import { PollCard } from './PollCard';
import { Poll } from '@/types/poll';

interface PollSectionProps {
  title: string;
  subtitle: string;
  polls: Poll[];
  onJoinPoll: (pollId: string) => void;
  variant: 'active' | 'completed' | 'pending';
}

export const PollSection: React.FC<PollSectionProps> = ({ 
  title, 
  subtitle, 
  polls, 
  onJoinPoll, 
  variant 
}) => {
  return (
    <section className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-[#1a305b] to-[#ec0081] bg-clip-text text-transparent">
          {title}
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {polls.map((poll) => (
          <PollCard
            key={poll.poll_id}
            poll={poll}
            onJoinPoll={onJoinPoll}
            variant={variant}
            // For now, we'll pass empty arrays since we don't have this data in the grid context
            // The voting progress will show as "not started" state which is appropriate for the overview
            statements={[]}
            userVotes={{}}
          />
        ))}
      </div>
    </section>
  );
};
