
import React from 'react';
import { Gamepad2, Zap, Users } from 'lucide-react';
import { HeroCountdown } from '@/components/HeroCountdown';
import { Poll } from '@/types/poll';

interface HeroSectionProps {
  polls: Poll[];
}

export const HeroSection: React.FC<HeroSectionProps> = ({ polls }) => {
  // Helper function to determine countdown target and messaging
  const getCountdownInfo = () => {
    // Check for active rounds first
    const activePolls = polls.filter(poll => 
      poll.round?.active_status === 'active' && poll.status === 'active'
    );
    
    if (activePolls.length > 0) {
      // Find the earliest ending active round
      const earliestEndingPoll = activePolls.reduce((earliest, poll) => {
        const currentEndTime = new Date(poll.round?.end_time || '').getTime();
        const earliestEndTime = new Date(earliest.round?.end_time || '').getTime();
        return currentEndTime < earliestEndTime ? poll : earliest;
      });
      
      return {
        endTime: earliestEndingPoll.round?.end_time || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        title: 'הזמן אוזל! הצביעו עכשיו',
        subtitle: `משחק פעיל: ${earliestEndingPoll.title}`,
        showCountdown: true
      };
    }

    // Check for pending rounds
    const pendingPolls = polls.filter(poll => 
      poll.round?.active_status === 'pending'
    );
    
    if (pendingPolls.length > 0) {
      // Find the earliest starting pending round
      const earliestStartingPoll = pendingPolls.reduce((earliest, poll) => {
        const currentStartTime = new Date(poll.round?.start_time || '').getTime();
        const earliestStartTime = new Date(earliest.round?.start_time || '').getTime();
        return currentStartTime < earliestStartTime ? poll : earliest;
      });
      
      return {
        endTime: earliestStartingPoll.round?.start_time || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        title: 'בקרוב יתחיל משחק חדש!',
        subtitle: `משחק הבא: ${earliestStartingPoll.title}`,
        showCountdown: true
      };
    }

    return {
      endTime: '',
      title: '',
      subtitle: '',
      showCountdown: false
    };
  };

  const countdownInfo = getCountdownInfo();

  return (
    <div className="relative bg-[#1a305b] text-white overflow-hidden text-center">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-4 h-4 bg-white/20 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-20 w-6 h-6 bg-white/10 rounded-full animate-bounce-gentle"></div>
        <div className="absolute bottom-20 left-32 w-3 h-3 bg-white/30 rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-32 right-10 w-5 h-5 bg-white/15 rounded-full animate-bounce-gentle"></div>
        {/* Subtle accent overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[#66c8ca]/10"></div>
      </div>
      
      <div className="container mx-auto px-4 py-16 text-center relative z-10">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Gamepad2 className="h-16 w-16 text-white animate-bounce-gentle" />
            <div className="absolute -top-2 -right-2">
              <Zap className="h-6 w-6 text-[#66c8ca] animate-pulse" />
            </div>
          </div>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold mb-6 hebrew-text">
          <span className="text-white drop-shadow-lg">
            נקודות חיבור
          </span>
        </h1>
        
        {/* Smart Countdown Section */}
        {countdownInfo.showCountdown && (
          <div className="mb-8">
            <HeroCountdown 
              endTime={countdownInfo.endTime}
              title={countdownInfo.title}
              subtitle={countdownInfo.subtitle}
            />
          </div>
        )}
        
        <div className="space-y-4 mb-8">
          <p className="text-xl md:text-2xl font-semibold hebrew-text leading-relaxed text-[#66c8ca]">
            🎮 שחקו ברצינות - בנו הסכמה אמיתית 🏆
          </p>
          <p className="text-lg md:text-xl opacity-90 max-w-3xl mx-auto hebrew-text leading-relaxed">
            משחק אסטרטגי חברתי: אתם זוכים רק אם כולם זוכים. הזמן אוזל. הצטרפו לאתגר!
          </p>
        </div>

        <div className="flex justify-center items-center gap-6 mt-8">
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
            <Users className="h-5 w-5" />
            <span className="text-sm font-semibold hebrew-text">שחקנים פעילים עכשיו</span>
          </div>
          <div className="hidden md:block w-px h-8 bg-white/30"></div>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
            <div className="w-3 h-3 bg-[#66c8ca] rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold hebrew-text">משחקים פעילים</span>
          </div>
        </div>
      </div>
    </div>
  );
};
