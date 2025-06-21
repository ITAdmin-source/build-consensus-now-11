
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CountdownTimer } from './CountdownTimer';
import { Poll } from '@/types/poll';
import { Target, BarChart3 } from 'lucide-react';

interface PollHeaderProps {
  poll: Poll;
  currentPage: 'voting' | 'results';
  onNavigateToResults?: () => void;
  onNavigateToVoting?: () => void;
}

export const PollHeader: React.FC<PollHeaderProps> = ({
  poll,
  currentPage,
  onNavigateToResults,
  onNavigateToVoting
}) => {
  const consensusProgress = (poll.current_consensus_points / poll.min_consensus_points_to_win) * 100;
  const isWinning = poll.current_consensus_points >= poll.min_consensus_points_to_win;

  return (
    <Card className="bg-gradient-to-r from-blue-50 via-white to-purple-50 border-0 shadow-lg">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Poll Title and Category */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold hebrew-text text-gradient mb-2">
                {poll.title}
              </h1>
              <p className="text-muted-foreground hebrew-text leading-relaxed">
                {poll.description}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="hebrew-text">
                {poll.category}
              </Badge>
              <CountdownTimer endTime={poll.end_time} />
            </div>
          </div>

          {/* Consensus Progress and Navigation */}
          <div className="flex items-center justify-between gap-4 p-4 bg-white/50 rounded-lg border">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-consensus-500" />
                <span className="font-medium hebrew-text">
                  נקודות חיבור: {poll.current_consensus_points}/{poll.min_consensus_points_to_win}
                </span>
                {isWinning && (
                  <Badge variant="default" className="text-xs">
                    ניצחון!
                  </Badge>
                )}
              </div>
              <Progress 
                value={consensusProgress} 
                className="h-3 consensus-gradient" 
              />
              <p className="text-xs text-muted-foreground hebrew-text mt-1">
                {isWinning ? 'ניצחון קבוצתי!' : 'נקודות חיבור שנמצאו'}
              </p>
            </div>

            <div>
              {currentPage === 'voting' && onNavigateToResults && (
                <Button
                  onClick={onNavigateToResults}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hebrew-text"
                >
                  <BarChart3 className="h-4 w-4 ml-2" />
                  צפה בתוצאות
                </Button>
              )}
              {currentPage === 'results' && onNavigateToVoting && (
                <Button
                  onClick={onNavigateToVoting}
                  className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 hebrew-text"
                >
                  <Target className="h-4 w-4 ml-2" />
                  המשך הצבעה
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
