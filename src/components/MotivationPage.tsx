import React from 'react';
import { Button } from '@/components/ui/button';
import { SharePopup } from '@/components/SharePopup';
import { UnifiedLayoutWrapper } from '@/components/UnifiedLayoutWrapper';
import { Share2, BarChart3, Home, Users, Clock, TrendingUp, Target, Zap } from 'lucide-react';
import type { Poll } from '@/types/poll';

interface MotivationPageProps {
  poll: Poll;
  onNavigateToResults: () => void;
  onNavigateToHome: () => void;
}

export const MotivationPage: React.FC<MotivationPageProps> = ({
  poll,
  onNavigateToResults,
  onNavigateToHome
}) => {
  const [showSharePopup, setShowSharePopup] = React.useState(false);
  
  const votingProgress = poll.voting_goal && poll.voting_goal > 0 
    ? Math.min((poll.total_votes / poll.voting_goal) * 100, 100)
    : poll.total_participants > 0 
    ? Math.min((poll.total_votes / poll.total_participants) * 100, 100)
    : 0;

  return (
    <>
      <UnifiedLayoutWrapper
        poll={poll}
        currentState="motivation"
        containerWidth="narrow" 
        showTopSection={true} // Show poll progress and timer
        showBreadcrumb={true}
        onShareClick={() => setShowSharePopup(true)}
        onNavigateToResults={onNavigateToResults}
        onNavigateToHome={onNavigateToHome}
        onShare={() => setShowSharePopup(true)}
      >
        <div className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 backdrop-blur-sm border-0 shadow-2xl rounded-3xl overflow-hidden">
          
          {/* Header Section */}
          <div className="text-center space-y-6 relative overflow-hidden p-8">
            {/* Background decoration */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
            
            <div className="flex justify-center relative z-10">
              <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-4 rounded-2xl shadow-lg animate-bounce">
                <Users className="h-12 w-12 text-white drop-shadow-sm" />
              </div>
            </div>
            
            <div className="space-y-3 relative z-10">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent hebrew-text">
                עזור לנו לקבל תוצאות מדויקות יותר
              </h1>
              <p className="text-lg text-gray-600 hebrew-text font-medium">
                כל הצבעה חשובה ותורמת לדיוק התוצאות
              </p>
            </div>
          </div>

          {/* Motivation Text */}
          <div className="p-8 pt-4">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/30 rounded-2xl p-6">
              <p className="font-semibold text-purple-700 hebrew-text text-lg leading-relaxed text-center">
                שתף את הסקר עם חברים ובני משפחה וקבל תמונה מלאה יותר של דעת הקהל
              </p>
            </div>
          </div>

        </div>
      </UnifiedLayoutWrapper>

      <SharePopup
        open={showSharePopup}
        onOpenChange={setShowSharePopup}
        poll={poll}
      />
    </>
  );
};