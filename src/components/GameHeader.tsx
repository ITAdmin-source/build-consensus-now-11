import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CountdownTimer } from './CountdownTimer';
import { Poll } from '@/types/poll';
import { UserPoints } from '@/integrations/supabase/userPoints';
import { Users, Target, Trophy, Zap } from 'lucide-react';

interface GameHeaderProps {
  poll: Poll;
  participantCount: number;
  consensusPointsCount: number;
  userPoints: UserPoints;
  isLive?: boolean;
}

export const GameHeader: React.FC<GameHeaderProps> = ({ 
  poll, 
  participantCount, 
  consensusPointsCount, 
  userPoints,
  isLive = false 
}) => {
  // Use round end_time for countdown
  const endTime = poll.round?.end_time || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const targetConsensusPoints = poll.min_consensus_points_to_win || 3;
  const progressPercentage = Math.min((consensusPointsCount / targetConsensusPoints) * 100, 100);

  return (
    <Card className="border-0 shadow-sm bg-card">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left Side - Live Stats */}
          <div className="flex items-center gap-4">
            {/* Participants */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Users className="h-4 w-4 text-primary" />
                {isLive && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                )}
              </div>
              <span className="text-sm font-medium">
                {participantCount}
              </span>
              <span className="text-xs text-muted-foreground hebrew-text hidden sm:inline">
                משתתפים מקוונים
              </span>
            </div>

            {/* Victory Progress */}
            <div className="flex items-center gap-2 min-w-0 flex-1 max-w-xs">
              <Target className="h-4 w-4 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">
                    {consensusPointsCount}/{targetConsensusPoints}
                  </span>
                  <span className="text-xs text-muted-foreground hebrew-text">
                    נקודות הסכמה
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            </div>
          </div>

          {/* Center - Poll Title */}
          <div className="text-center flex-1 min-w-0 hidden md:block">
            <h1 className="text-lg font-bold hebrew-text truncate">
              {poll.title}
            </h1>
          </div>

          {/* Right Side - Timer & Score */}
          <div className="flex items-center gap-4">
            {/* User Score */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-bold text-primary">
                  {userPoints.total_points}
                </span>
              </div>
              <span className="text-xs text-muted-foreground hebrew-text hidden sm:inline">
                נקודות
              </span>
            </div>

            {/* Countdown Timer */}
            <CountdownTimer endTime={endTime} />
          </div>
        </div>

        {/* Mobile Title */}
        <div className="md:hidden mt-3 text-center">
          <h1 className="text-lg font-bold hebrew-text">
            {poll.title}
          </h1>
        </div>

        {/* Victory Status */}
        {consensusPointsCount >= targetConsensusPoints && (
          <div className="mt-3 flex items-center justify-center gap-2 p-2 bg-green-50 rounded-lg">
            <Trophy className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800 hebrew-text">
              המטרה הושגה! המשיכו להצביע לעוד תובנות
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};