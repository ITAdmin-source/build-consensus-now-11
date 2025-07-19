
import React from 'react';
import { PollCardNew } from './PollCardNew';
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
      
      <div className="flex flex-wrap justify-center gap-6">
        {polls.map((poll) => (
          <PollCardNew
            key={poll.poll_id}
            poll={poll}
            onJoinPoll={onJoinPoll}
            variant={variant}
            // For grid context, we don't have detailed voting data
            statements={[]}
            userVotes={{}}
          />
        ))}
      </div>
    </section>
  );
};
