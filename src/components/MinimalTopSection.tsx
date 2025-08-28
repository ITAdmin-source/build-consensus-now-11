import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CountdownTimer } from '@/components/CountdownTimer';
import { Share2, Users, Target } from 'lucide-react';
import { Poll } from '@/types/poll';
import { calculateVotingProgress } from '@/utils/votingProgress';

interface MinimalTopSectionProps {
  poll: Poll;
  isPollCompleted?: boolean;
  onShareClick: () => void;
}

export const MinimalTopSection: React.FC<MinimalTopSectionProps> = ({
  poll,
  isPollCompleted = false,
  onShareClick
}) => {
  const progress = calculateVotingProgress(poll.total_votes || 0, poll.voting_goal || 1000);

  return (
    <div className="bg-white border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Progress Section */}
          <div className="flex items-center gap-4 flex-1">
            {isPollCompleted ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{(poll.total_votes || 0).toLocaleString()} הצבעות</span>
                <span>•</span>
                <span>{(poll.total_participants || 0).toLocaleString()} משתתפים</span>
              </div>
            ) : (
              <div className="flex items-center gap-3 flex-1">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{progress.currentVotes.toLocaleString()}</span>
                  <span className="text-muted-foreground">מתוך {progress.goalVotes.toLocaleString()}</span>
                </div>
                <Progress value={progress.percentage} className="h-2 flex-1 max-w-32" />
                <span className="text-sm text-muted-foreground">{Math.round(progress.percentage)}%</span>
              </div>
            )}
          </div>

          {/* Countdown Timer */}
          {!isPollCompleted && poll.time_left > 0 && (
            <div className="flex items-center">
              <CountdownTimer 
                endTime={new Date(Date.now() + poll.time_left).toISOString()} 
                className="text-sm"
                compact={true}
              />
            </div>
          )}

          {/* Share Button */}
          <Button
            onClick={onShareClick}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 hebrew-text"
          >
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">שתף</span>
          </Button>
        </div>
      </div>
    </div>
  );
};