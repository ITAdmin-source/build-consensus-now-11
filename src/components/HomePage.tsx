
import React from 'react';
import { NavigationHeader } from '@/components/NavigationHeader';
import { HeroSection } from '@/components/HeroSection';
import { QuickStats } from '@/components/QuickStats';
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
      
      <HeroSection />
      <QuickStats polls={polls} />
      <PollsGrid polls={polls} onJoinPoll={onJoinPoll} />
      <HowItWorks />
    </div>
  );
};
