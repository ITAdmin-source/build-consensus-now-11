
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Poll } from '@/types/poll';
import { CheckCircle, Clock, Target } from 'lucide-react';

interface VotingProgressProps {
  poll: Poll;
  userVoteCount: number;
  totalStatements: number;
  currentStatementIndex: number;
}

export const VotingProgress: React.FC<VotingProgressProps> = ({
  poll,
  userVoteCount,
  totalStatements,
  currentStatementIndex
}) => {
  const personalProgress = (userVoteCount / totalStatements) * 100;
  const consensusProgress = (poll.current_consensus_points / poll.min_consensus_points_to_win) * 100;
  const isWinning = poll.current_consensus_points >= poll.min_consensus_points_to_win;

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Personal Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium hebrew-text">ההתקדמות שלך</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {userVoteCount}/{totalStatements}
              </Badge>
            </div>
            <Progress value={personalProgress} className="h-2" />
            <p className="text-xs text-muted-foreground hebrew-text">
              הצהרה {currentStatementIndex + 1} מתוך {totalStatements}
            </p>
          </div>

          {/* Consensus Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium hebrew-text">הקונצנזוס</span>
              </div>
              <Badge variant={isWinning ? "default" : "secondary"} className="text-xs">
                {poll.current_consensus_points}/{poll.min_consensus_points_to_win}
              </Badge>
            </div>
            <Progress value={consensusProgress} className="h-2 consensus-gradient" />
            <p className="text-xs text-muted-foreground hebrew-text">
              {isWinning ? 'ניצחון קבוצתי!' : 'נקודות חיבור שנמצאו'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
