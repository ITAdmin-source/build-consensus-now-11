
import React from 'react';
import { Gamepad2, Star, Medal, Trophy, Target } from 'lucide-react';
import { HeroCountdown } from '@/components/HeroCountdown';
import { Poll } from '@/types/poll';
import { getPollStatus } from '@/utils/pollStatusUtils';

interface HeroSectionProps {
  polls: Poll[];
}

export const HeroSection: React.FC<HeroSectionProps> = ({ polls }) => {
  // Helper function to determine countdown target and messaging
  const getCountdownInfo = () => {
    // Check for active rounds first
    const activePolls = polls.filter(poll => 
      poll.round?.active_status === 'active' && getPollStatus(poll) === 'active'
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

  // Calculate stats data
  const getStatsData = () => {
    const activeGames = polls.filter(p => {
      const status = getPollStatus(p);
      return status === 'active' || status === 'pending';
    }).length;
    
    const totalVictoryPoints = polls.reduce((sum, p) => sum + p.current_consensus_points, 0);
    const totalMoves = polls.reduce((sum, p) => sum + p.total_votes, 0);
    const collectiveWins = polls.filter(p => p.current_consensus_points >= p.min_consensus_points_to_win).length;

    return [
      {
        icon: Gamepad2,
        value: activeGames,
        label: 'משחקים פעילים',
        color: '#66c8ca',
        bgGradient: 'from-[#66c8ca]/30 to-blue-500/30',
        pulseColor: 'bg-green-400',
        description: 'משחקים שאתם יכולים לשחק בהם עכשיו'
      },
      {
        icon: Star,
        value: totalVictoryPoints,
        label: 'נקודות חיבור',
        color: '#ec0081',
        bgGradient: 'from-[#ec0081]/30 to-purple-500/30',
        pulseColor: 'bg-[#66c8ca]',
        description: 'הסכמות שהושגו בכל המשחקים'
      },
      {
        icon: Medal,
        value: totalMoves,
        label: 'הצבעות כולל',
        color: '#1a305b',
        bgGradient: 'from-[#1a305b]/30 to-blue-600/30',
        pulseColor: 'bg-red-400',
        description: 'כל ההצבעות במערכת'
      },
      {
        icon: Trophy,
        value: collectiveWins,
        label: 'ניצחונות קבוצתיים',
        color: '#f59e0b',
        bgGradient: 'from-yellow-500/30 to-orange-500/30',
        pulseColor: 'bg-yellow-400',
        description: 'משחקים שהגיעו להסכמה מלאה'
      }
    ];
  };

  const countdownInfo = getCountdownInfo();
  const statsData = getStatsData();

  // Format large numbers
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  return (
    <div className="relative bg-gradient-to-br from-[#1a305b] via-[#2a4a7b] to-[#1a305b] text-white overflow-hidden min-h-screen flex items-center">
      {/* Enhanced animated background */}
      <div className="absolute inset-0">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#66c8ca]/20 via-transparent to-[#66c8ca]/10 animate-pulse"></div>
        
        {/* Enhanced floating particles */}
        <div className="absolute top-10 left-10 w-4 h-4 bg-[#66c8ca]/60 rounded-full animate-float-slow shadow-lg shadow-[#66c8ca]/50"></div>
        <div className="absolute top-32 right-20 w-6 h-6 bg-white/20 rounded-full animate-float-medium shadow-lg shadow-white/30"></div>
        <div className="absolute bottom-20 left-32 w-3 h-3 bg-[#66c8ca]/80 rounded-full animate-float-fast shadow-lg shadow-[#66c8ca]/60"></div>
        <div className="absolute bottom-32 right-10 w-5 h-5 bg-white/15 rounded-full animate-float-slow shadow-lg shadow-white/20"></div>
        <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-[#66c8ca]/40 rounded-full animate-float-medium"></div>
        <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-white/10 rounded-full animate-float-fast"></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="h-full w-full bg-[linear-gradient(90deg,transparent_24px,rgba(255,255,255,0.1)_25px,rgba(255,255,255,0.1)_26px,transparent_27px,transparent_100%),linear-gradient(180deg,transparent_24px,rgba(255,255,255,0.1)_25px,rgba(255,255,255,0.1)_26px,transparent_27px,transparent_100%)]" style={{backgroundSize: '50px 50px'}}></div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-16 text-center relative z-10 flex flex-col items-center">
        
        {/* Enhanced main title */}
        <h1 className="text-5xl md:text-7xl font-bold mb-8 hebrew-text relative text-center">
          <span className="bg-gradient-to-r from-white via-[#66c8ca] to-white bg-clip-text text-transparent drop-shadow-2xl animate-pulse-slow">
            נקודות חיבור
          </span>
          <div className="absolute -inset-4 bg-gradient-to-r from-transparent via-[#66c8ca]/20 to-transparent blur-xl opacity-50 animate-pulse"></div>
        </h1>
        
        {/* Enhanced countdown section */}
        {countdownInfo.showCountdown && (
          <div className="mb-12 relative flex justify-center w-full">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#66c8ca]/10 to-transparent blur-lg"></div>
            <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl max-w-2xl w-full text-center">
              <HeroCountdown 
                endTime={countdownInfo.endTime}
                title={countdownInfo.title}
                subtitle={countdownInfo.subtitle}
              />
            </div>
          </div>
        )}
        
        {/* Enhanced tagline */}
        <div className="space-y-6 mb-12 text-center">
          <div className="relative flex justify-center">
            <p className="text-2xl md:text-3xl font-bold hebrew-text leading-relaxed text-[#66c8ca] drop-shadow-lg text-center">
              🎮 שחקו ברצינות - בנו הסכמה אמיתית 🏆
            </p>
            <div className="absolute -inset-2 bg-[#66c8ca]/20 blur-lg rounded-lg opacity-30"></div>
          </div>
          <p className="text-lg md:text-xl opacity-90 max-w-4xl mx-auto hebrew-text leading-relaxed font-medium text-center">
            משחק אסטרטגי חברתי: אתם זוכים רק אם כולם זוכים. הזמן אוזל. הצטרפו לאתגר!
          </p>
        </div>

        {/* Enhanced Stats Cards - Merged from QuickStats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 w-full max-w-6xl">
          {statsData.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="group relative">
                {/* Gradient background blur effect */}
                <div className={`absolute -inset-2 bg-gradient-to-r ${stat.bgGradient} rounded-2xl blur opacity-70 group-hover:opacity-100 transition-opacity duration-300`}></div>
                
                {/* Main card */}
                <div className="relative bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 text-center">
                  {/* Icon with pulsing indicator */}
                  <div className="relative mb-4 flex justify-center">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center shadow-lg border border-white/20">
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    {/* Live indicator */}
                    <div className={`absolute -top-1 -right-1 w-4 h-4 ${stat.pulseColor} rounded-full animate-pulse shadow-lg`}></div>
                  </div>
                  
                  {/* Value */}
                  <div className="text-3xl md:text-4xl font-bold mb-2 text-white drop-shadow-lg">
                    {formatNumber(stat.value)}
                  </div>
                  
                  {/* Label */}
                  <div className="text-sm md:text-base font-semibold hebrew-text text-white/90 mb-2">
                    {stat.label}
                  </div>
                  
                  {/* Description - appears on hover */}
                  <div className="text-xs text-white/70 hebrew-text opacity-0 group-hover:opacity-100 transition-opacity duration-300 max-h-0 group-hover:max-h-20 overflow-hidden transition-all duration-300">
                    {stat.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
