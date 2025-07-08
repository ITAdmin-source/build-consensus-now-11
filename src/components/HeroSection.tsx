import React from 'react';
import { Gamepad2, Zap, Users, Trophy, Target } from 'lucide-react';
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
        {/* Enhanced icon section */}
        <div className="flex justify-center mb-8">
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-[#66c8ca]/30 to-[#66c8ca]/10 rounded-full blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative bg-white/10 backdrop-blur-sm rounded-full p-4 border border-white/20 shadow-2xl">
              <Gamepad2 className="h-16 w-16 text-white animate-pulse group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute -top-2 -right-2 animate-bounce">
                <Zap className="h-6 w-6 text-[#66c8ca] drop-shadow-lg" />
              </div>
            </div>
          </div>
        </div>
        
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

        {/* Enhanced status indicators */}
        <div className="flex flex-wrap justify-center items-center gap-6 mt-12">
          <div className="group relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-[#66c8ca]/30 to-blue-500/30 rounded-full blur opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center gap-3 bg-white/20 backdrop-blur-lg rounded-full px-6 py-3 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="relative">
                <Users className="h-5 w-5 text-[#66c8ca]" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <span className="text-sm font-semibold hebrew-text">שחקנים פעילים עכשיו</span>
            </div>
          </div>
          
          <div className="hidden md:block w-px h-8 bg-gradient-to-b from-transparent via-white/50 to-transparent"></div>
          
          <div className="group relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/30 to-[#66c8ca]/30 rounded-full blur opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center gap-3 bg-white/20 backdrop-blur-lg rounded-full px-6 py-3 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="relative">
                <Trophy className="h-5 w-5 text-yellow-400" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#66c8ca] rounded-full animate-pulse"></div>
              </div>
              <span className="text-sm font-semibold hebrew-text">משחקים פעילים</span>
            </div>
          </div>
          
          <div className="group relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-green-500/30 to-emerald-500/30 rounded-full blur opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center gap-3 bg-white/20 backdrop-blur-lg rounded-full px-6 py-3 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="relative">
                <Target className="h-5 w-5 text-green-400" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
              </div>
              <span className="text-sm font-semibold hebrew-text">יעדים פתוחים</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Custom animations styles */}
      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.1); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(-15px) translateX(10px); }
          66% { transform: translateY(-5px) translateX(-5px); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(180deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        .animate-float-slow { animation: float-slow 4s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 3s ease-in-out infinite; }
        .animate-float-fast { animation: float-fast 2s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
};