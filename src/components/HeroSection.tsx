
import React from 'react';
import { Gamepad2, Zap, Users } from 'lucide-react';
import { HeroCountdown } from './HeroCountdown';
import { Poll } from '@/types/poll';

interface HeroSectionProps {
  polls: Poll[];
}

export const HeroSection: React.FC<HeroSectionProps> = ({ polls }) => {
  // Smart countdown logic
  const getCountdownInfo = () => {
    const now = new Date();
    
    // Find active rounds (priority 1)
    const activeRounds = polls
      .filter(poll => poll.round?.active_status === 'active')
      .map(poll => poll.round!)
      .filter((round, index, self) => 
        index === self.findIndex(r => r.round_id === round.round_id)
      );
    
    if (activeRounds.length > 0) {
      // Get the earliest ending active round
      const earliestEnd = activeRounds.reduce((earliest, round) => 
        new Date(round.end_time) < new Date(earliest.end_time) ? round : earliest
      );
      
      return {
        endTime: earliestEnd.end_time,
        title: '🔥 הזמן אוזל! הצביעו עכשיו',
        subtitle: `סיום הסיבוב: ${earliestEnd.title}`
      };
    }
    
    // Find pending rounds (priority 2)
    const pendingRounds = polls
      .filter(poll => poll.round?.active_status === 'pending')
      .map(poll => poll.round!)
      .filter((round, index, self) => 
        index === self.findIndex(r => r.round_id === round.round_id)
      );
    
    if (pendingRounds.length > 0) {
      // Get the earliest starting pending round
      const earliestStart = pendingRounds.reduce((earliest, round) => 
        new Date(round.start_time) < new Date(earliest.start_time) ? round : earliest
      );
      
      return {
        endTime: earliestStart.start_time,
        title: '⏰ בקרוב יגיע סיבוב חדש!',
        subtitle: `${earliestStart.title} יתחיל בעוד`
      };
    }
    
    return null;
  };

  const countdownInfo = getCountdownInfo();

  return (
    <div className="relative bg-[#1a305b] text-white overflow-hidden">
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
        {/* Main Title Section */}
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
        
        <div className="space-y-4 mb-12">
          <p className="text-xl md:text-2xl font-semibold hebrew-text leading-relaxed text-[#66c8ca]">
            🎮 שחקו ברצינות - בנו הסכמה אמיתית 🏆
          </p>
          <p className="text-lg md:text-xl opacity-90 max-w-3xl mx-auto hebrew-text leading-relaxed">
            משחק אסטרטגי חברתי: אתם זוכים רק אם כולם זוכים. הזמן אוזל. הצטרפו לאתגר!
          </p>
        </div>

        {/* Countdown Section */}
        {countdownInfo && (
          <div className="mb-12">
            <HeroCountdown
              endTime={countdownInfo.endTime}
              title={countdownInfo.title}
              subtitle={countdownInfo.subtitle}
            />
          </div>
        )}

        {/* Stats Section */}
        <div className="flex justify-center items-center gap-6">
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
