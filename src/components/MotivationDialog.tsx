import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CountdownTimer } from '@/components/CountdownTimer';
import { Share2, BarChart3, Home, Users, Clock, TrendingUp, Target, Zap } from 'lucide-react';
import type { Poll } from '@/types/poll';

interface MotivationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShare: () => void;
  onNavigateToResults: () => void;
  onNavigateToHome: () => void;
  poll: Poll;
}

export const MotivationDialog: React.FC<MotivationDialogProps> = ({
  open,
  onOpenChange,
  onShare,
  onNavigateToResults,
  onNavigateToHome,
  poll
}) => {
  const votingProgress = poll.voting_goal && poll.voting_goal > 0 
    ? Math.min((poll.total_votes / poll.voting_goal) * 100, 100)
    : poll.total_participants > 0 
    ? Math.min((poll.total_votes / poll.total_participants) * 100, 100)
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-lg text-center [&>button]:hidden max-h-[95vh] overflow-y-auto border-0 shadow-2xl bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 backdrop-blur-sm"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="space-y-6 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
          
          <div className="flex justify-center relative z-10">
            <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-4 rounded-2xl shadow-lg animate-bounce">
              <Users className="h-12 w-12 text-white drop-shadow-sm" />
            </div>
          </div>
          
          <div className="space-y-2 relative z-10">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent hebrew-text">
              עזור לנו לקבל תוצאות מדויקות יותר
            </DialogTitle>
            <p className="text-sm text-gray-600 hebrew-text font-medium">
              כל הצבעה חשובה ותורמת לדיוק התוצאות
            </p>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-8">
          {/* Countdown Timer Section */}
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center justify-center gap-3 text-gray-600 mb-3">
              <div className="bg-gradient-to-r from-orange-400 to-red-500 p-2 rounded-xl">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm hebrew-text font-semibold">זמן שנותר לסיום הסקר</span>
            </div>
            <CountdownTimer 
              endTime={poll.round?.end_time || ''} 
              className="text-lg font-bold justify-center text-gray-800"
              showIcon={false}
            />
          </div>

          {/* Progress Section */}
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center justify-center gap-3 text-gray-600 mb-4">
              <div className="bg-gradient-to-r from-green-400 to-blue-500 p-2 rounded-xl">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm hebrew-text font-semibold">התקדמות השתתפות כללית</span>
            </div>
            
            <div className="space-y-3">
              <div className="relative">
                <Progress 
                  value={votingProgress} 
                  className="h-3 bg-gray-200/70 rounded-full overflow-hidden" 
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full opacity-20 animate-pulse"></div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-bold text-gray-800 hebrew-text">{poll.total_votes} הצבעות</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-bold text-gray-800 hebrew-text">{Math.round(votingProgress)}% מהיעד</span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Motivation Text */}
          <div className="text-center space-y-4 px-4">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/30 rounded-2xl p-4">
              <p className="text-gray-700 hebrew-text text-sm leading-relaxed font-medium">
                ככל שיותר אנשים ישתתפו בסקר, התוצאות יהיו מדויקות ומייצגות יותר.
              </p>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/30 rounded-2xl p-4">
              <p className="font-semibold text-purple-700 hebrew-text text-sm leading-relaxed">
                שתף את הסקר עם חברים ובני משפחה וקבל תמונה מלאה יותר של דעת הקהל
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Action Buttons */}
        <div className="space-y-3 mt-8 pt-6 border-t border-gray-200/50">
          <Button
            onClick={() => {
              onShare();
              onOpenChange(false);
            }}
            className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white hebrew-text font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border-0"
          >
            <Share2 className="h-5 w-5 ml-2 drop-shadow-sm" />
            שתף את הסקר
          </Button>

          <Button
            onClick={() => {
              onNavigateToResults();
              onOpenChange(false);
            }}
            variant="outline"
            className="w-full hebrew-text font-semibold py-3 rounded-xl border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-300 transform hover:scale-[1.02] bg-white/50 backdrop-blur-sm"
          >
            <BarChart3 className="h-5 w-5 ml-2 text-purple-600" />
            צפה בתוצאות הסקר
          </Button>

          <Button
            onClick={() => {
              onNavigateToHome();
              onOpenChange(false);
            }}
            variant="ghost"
            className="w-full hebrew-text font-semibold py-3 rounded-xl hover:bg-gray-100/80 transition-all duration-300 transform hover:scale-[1.02] text-gray-600 hover:text-gray-800"
          >
            <Home className="h-5 w-5 ml-2" />
            חזור לעמוד הבית
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};