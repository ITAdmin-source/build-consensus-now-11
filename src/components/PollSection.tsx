
import React from 'react';
import { PollCard } from '@/components/PollCard';
import { Poll } from '@/types/poll';
import { Gamepad2, Trophy, Clock } from 'lucide-react';

interface PollSectionProps {
  title: string;
  subtitle: string;
  polls: Poll[];
  onJoinPoll: (pollId: string) => void;
  sectionType: 'active' | 'completed' | 'pending';
  icon: React.ReactNode;
}

export const PollSection: React.FC<PollSectionProps> = ({ 
  title, 
  subtitle, 
  polls, 
  onJoinPoll, 
  sectionType,
  icon 
}) => {
  if (polls.length === 0) {
    return null;
  }

  const getSectionColors = () => {
    switch (sectionType) {
      case 'active':
        return {
          iconBg: 'bg-[#ec0081]',
          titleColor: 'text-[#ec0081]',
          borderColor: 'border-[#ec0081]/20'
        };
      case 'completed':
        return {
          iconBg: 'bg-[#66c8ca]',
          titleColor: 'text-[#66c8ca]',
          borderColor: 'border-[#66c8ca]/20'
        };
      case 'pending':
        return {
          iconBg: 'bg-[#1a305b]',
          titleColor: 'text-[#1a305b]',
          borderColor: 'border-[#1a305b]/20'
        };
    }
  };

  const colors = getSectionColors();

  return (
    <div className={`mb-16 pb-8 border-b-2 ${colors.borderColor} last:border-b-0`}>
      {/* Section Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center items-center gap-4 mb-4">
          <div className={`w-12 h-12 ${colors.iconBg} rounded-full flex items-center justify-center`}>
            {icon}
          </div>
          <h2 className={`text-2xl md:text-3xl font-bold hebrew-text ${colors.titleColor}`}>
            {title}
          </h2>
        </div>
        <p className="text-lg text-gray-600 hebrew-text">
          {subtitle}
        </p>
        <div className="mt-2">
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${colors.iconBg} text-white`}>
            {polls.length} משחקים
          </span>
        </div>
      </div>

      {/* Polls Grid */}
      <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-6 ${sectionType === 'active' ? 'lg:grid-cols-2 gap-8' : ''}`}>
        {polls.map((poll) => (
          <PollCard
            key={poll.poll_id}
            poll={poll}
            onJoinPoll={onJoinPoll}
            variant={sectionType}
          />
        ))}
      </div>
    </div>
  );
};
