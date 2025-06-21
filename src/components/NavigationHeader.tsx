
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CountdownTimer } from './CountdownTimer';
import { Poll } from '@/types/poll';
import { 
  ArrowRight, 
  Home, 
  Target,
  Clock
} from 'lucide-react';

interface NavigationHeaderProps {
  poll?: Poll;
  currentPage?: 'home' | 'voting' | 'results';
  onNavigateHome?: () => void;
  onNavigateToVoting?: () => void;
  onNavigateToResults?: () => void;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  poll,
  currentPage = 'home',
  onNavigateHome,
  onNavigateToVoting,
  onNavigateToResults
}) => {
  const consensusProgress = poll ? (poll.current_consensus_points / poll.min_consensus_points_to_win) * 100 : 0;
  const isWinning = poll ? poll.current_consensus_points >= poll.min_consensus_points_to_win : false;

  return (
    <div className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        {/* App Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onNavigateHome}
              className="hebrew-text font-bold text-xl text-primary hover:bg-transparent"
            >
              נקודות חיבור
            </Button>
          </div>
          
          {poll && (
            <div className="flex items-center gap-4">
              <CountdownTimer endTime={poll.end_time} className="text-sm" />
              <Badge variant={isWinning ? "default" : "secondary"} className="hebrew-text">
                {poll.category}
              </Badge>
            </div>
          )}
        </div>

        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onNavigateHome}
            className={`hebrew-text ${currentPage === 'home' ? 'text-primary font-medium' : 'hover:text-primary'}`}
          >
            <Home className="h-4 w-4 ml-1" />
            דף הבית
          </Button>
          
          {poll && (
            <>
              <ArrowRight className="h-4 w-4" />
              <span className="hebrew-text font-medium text-foreground max-w-xs truncate">
                {poll.title}
              </span>
              
              {currentPage !== 'home' && (
                <>
                  <ArrowRight className="h-4 w-4" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={currentPage === 'voting' ? undefined : onNavigateToVoting}
                    className={`hebrew-text ${currentPage === 'voting' ? 'text-primary font-medium' : 'hover:text-primary'}`}
                    disabled={currentPage === 'voting'}
                  >
                    הצבעה
                  </Button>
                  
                  {currentPage === 'results' && (
                    <>
                      <ArrowRight className="h-4 w-4" />
                      <span className="hebrew-text font-medium text-primary">תוצאות</span>
                    </>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* Poll Context Bar */}
        {poll && currentPage !== 'home' && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium hebrew-text">
                    {poll.current_consensus_points}/{poll.min_consensus_points_to_win} נקודות חיבור
                  </span>
                  {isWinning && (
                    <Badge variant="default" className="text-xs">
                      ניצחון!
                    </Badge>
                  )}
                </div>
                <Progress 
                  value={consensusProgress} 
                  className="h-2 consensus-gradient" 
                />
              </div>
              
              <div className="flex gap-2">
                {currentPage === 'voting' && onNavigateToResults && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onNavigateToResults}
                    className="hebrew-text"
                  >
                    צפה בתוצאות
                  </Button>
                )}
                {currentPage === 'results' && onNavigateToVoting && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onNavigateToVoting}
                    className="hebrew-text"
                  >
                    המשך הצבעה
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
