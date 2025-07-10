
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  // Use round end_time for countdown
  const endTime = poll.round?.end_time || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  return (
    <Card className="bg-gradient-to-r from-blue-50 via-white to-purple-50 border-0 shadow-lg">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Poll Title and Category */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold hebrew-text text-gradient">
                  {poll.title}
                </h1>
                {isPollCompleted && (
                  <Badge variant="secondary" className="bg-gray-100 text-gray-700 hebrew-text">
                    <Clock className="h-3 w-3 ml-1" />
                    הסקר הסתיים
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground hebrew-text leading-relaxed">
                {poll.description}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="hebrew-text">
                {poll.category}
              </Badge>
              {!isPollCompleted && <CountdownTimer endTime={endTime} />}
            </div>
          </div>

          {/* Navigation for results page only */}
          {currentPage === 'results' && (
            <div className="flex justify-end">
              {onNavigateToVoting && !isPollCompleted && (
                <Button
                  onClick={onNavigateToVoting}
                  className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 hebrew-text"
                >
                  <Target className="h-4 w-4 ml-2" />
                  המשך הצבעה
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
