
import React from 'react';
import { PollCardNew } from './PollCardNew';
import { Poll } from '@/types/poll';
import { usePollingVotingProgress } from '@/hooks/usePollingVotingProgress';

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
  // Only fetch voting progress for active polls to show user progress
  const activePollIds = variant === 'active' ? polls.map(poll => poll.poll_id) : [];
  const { progressData, loading } = usePollingVotingProgress(activePollIds);

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
            statements={[]}
            userVotes={{}}
            summaryProgress={progressData[poll.poll_id] || null}
            progressLoading={loading[poll.poll_id] || false}
          />
        ))}
      </div>
    </section>
  );
};
