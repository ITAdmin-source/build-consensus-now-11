
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CountdownTimer } from './CountdownTimer';
import { Poll } from '@/types/poll';
import { Target, BarChart3, Clock } from 'lucide-react';

interface PollHeaderProps {
  poll: Poll;
  currentPage: 'voting' | 'results';
  onNavigateToResults?: () => void;
  onNavigateToVoting?: () => void;
  isPollCompleted?: boolean;
}

export const PollHeader: React.FC<PollHeaderProps> = ({
  poll,
  currentPage,
  onNavigateToResults,
  onNavigateToVoting,
  isPollCompleted = false
}) => {
  const consensusProgress = (poll.current_consensus_points / poll.min_consensus_points_to_win) * 100;
  const isWinning = poll.current_consensus_points >= poll.min_consensus_points_to_win;

  // Use round end_time for countdown
  const endTime = poll.round?.end_time || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  return (
    <Card className="bg-gradient-to-r from-[#66c8ca]/10 via-white to-[#ec0081]/10 border-[#66c8ca]/30 shadow-lg">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Poll Title and Category */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold hebrew-text text-[#1a305b]">
                  {poll.title}
                </h1>
                {isPollCompleted && (
                  <Badge variant="secondary" className="bg-[#66c8ca]/20 text-[#1a305b] hebrew-text">
                    <Clock className="h-3 w-3 ml-1" />
                    הסקר הסתיים
                  </Badge>
                )}
              </div>
              <p className="text-[#1a305b]/70 hebrew-text leading-relaxed">
                {poll.description}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="hebrew-text border-[#66c8ca] text-[#1a305b]">
                {poll.category}
              </Badge>
              {!isPollCompleted && <CountdownTimer endTime={endTime} />}
            </div>
          </div>

          {/* Consensus Progress and Navigation */}
          <div className="flex items-center justify-between gap-4 p-4 bg-white/50 rounded-lg border border-[#66c8ca]/20">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-[#ec0081]" />
                <span className="font-medium hebrew-text text-[#1a305b]">
                  נקודות חיבור: {poll.current_consensus_points}/{poll.min_consensus_points_to_win}
                </span>
                {isWinning && (
                  <Badge variant="default" className="text-xs bg-[#ec0081] text-white">
                    ניצחון!
                  </Badge>
                )}
              </div>
              <Progress 
                value={consensusProgress} 
                className="h-3 [&>div]:bg-gradient-to-r [&>div]:from-[#66c8ca] [&>div]:to-[#ec0081]" 
              />
              <p className="text-xs text-[#1a305b]/60 hebrew-text mt-1">
                {isPollCompleted 
                  ? (isWinning ? 'ניצחון קבוצתי הושג!' : 'התוצאות הסופיות')
                  : (isWinning ? 'ניצחון קבוצתי!' : 'נקודות חיבור שנמצאו')
                }
              </p>
            </div>

            <div>
              {currentPage === 'voting' && onNavigateToResults && (
                <Button
                  onClick={onNavigateToResults}
                  className="bg-gradient-to-r from-[#66c8ca] to-[#ec0081] hover:from-[#66c8ca]/90 hover:to-[#ec0081]/90 hebrew-text text-white"
                >
                  <BarChart3 className="h-4 w-4 ml-2" />
                  צפה בתוצאות
                </Button>
              )}
              {currentPage === 'results' && onNavigateToVoting && !isPollCompleted && (
                <Button
                  onClick={onNavigateToVoting}
                  className="bg-gradient-to-r from-[#1a305b] to-[#ec0081] hover:from-[#1a305b]/90 hover:to-[#ec0081]/90 hebrew-text text-white"
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
