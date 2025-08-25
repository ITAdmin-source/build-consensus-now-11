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
import { Share2, BarChart3, Home, Users, Clock, TrendingUp } from 'lucide-react';
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
        className="sm:max-w-lg text-center [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="space-y-6">
          <div className="flex justify-center">
            <div className="bg-gradient-primary p-4 rounded-full">
              <Users className="h-12 w-12 text-white" />
            </div>
          </div>
          
          <DialogTitle className="text-xl font-bold hebrew-text">
            עזור לנו לקבל תוצאות מדויקות יותר
          </DialogTitle>

          {/* Countdown Timer Section */}
          <div className="bg-card border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-sm hebrew-text">זמן שנותר לסיום הסקר</span>
            </div>
            <CountdownTimer 
              endTime={poll.round?.end_time || ''} 
              className="text-lg font-bold justify-center"
              showIcon={false}
            />
          </div>

          {/* Progress Section */}
          <div className="bg-card border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm hebrew-text">התקדמות השתתפות כללית</span>
            </div>
            <div className="space-y-2">
              <Progress value={votingProgress} className="h-3" />
              <div className="flex justify-between text-sm text-muted-foreground hebrew-text">
                <span>{poll.total_votes} הצבעות</span>
                <span>{Math.round(votingProgress)}% מהיעד</span>
              </div>
            </div>
          </div>

          <div className="text-center space-y-3">
            <p className="text-muted-foreground hebrew-text text-sm">
              ככל שיותר אנשים ישתתפו בסקר, התוצאות יהיו מדויקות ומייצגות יותר.
            </p>
            <p className="font-medium text-primary hebrew-text">
              שתף את הסקר עם חברים ובני משפחה וקבל תמונה מלאה יותר של דעת הקהל
            </p>
          </div>
        </DialogHeader>

        <div className="space-y-3 mt-6">
          <Button
            onClick={() => {
              onShare();
              onOpenChange(false);
            }}
            className="w-full bg-gradient-primary hover:opacity-90 text-white hebrew-text"
          >
            <Share2 className="h-4 w-4 ml-2" />
            שתף את הסקר
          </Button>

          <Button
            onClick={() => {
              onNavigateToResults();
              onOpenChange(false);
            }}
            variant="outline"
            className="w-full hebrew-text"
          >
            <BarChart3 className="h-4 w-4 ml-2" />
            צפה בתוצאות הסקר
          </Button>

          <Button
            onClick={() => {
              onNavigateToHome();
              onOpenChange(false);
            }}
            variant="ghost"
            className="w-full hebrew-text"
          >
            <Home className="h-4 w-4 ml-2" />
            חזור לעמוד הבית
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};