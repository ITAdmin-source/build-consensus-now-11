
import React from 'react';
import { NavigationHeader } from '@/components/NavigationHeader';
import { HeroSection } from '@/components/HeroSection';
import { PollsGrid } from '@/components/PollsGrid';
import { HowItWorks } from '@/components/HowItWorks';
import { Poll } from '@/types/poll';

interface HomePageProps {
  polls: Poll[];
  onJoinPoll: (pollId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ polls, onJoinPoll }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <NavigationHeader currentPage="home" />
      
      <HeroSection polls={polls} />
      <div id="active-polls-section">
        <PollsGrid polls={polls} onJoinPoll={onJoinPoll} />
      </div>
    </div>
  );
};
