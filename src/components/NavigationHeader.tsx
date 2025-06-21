
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CountdownTimer } from './CountdownTimer';
import { Poll } from '@/types/poll';
import { 
  ArrowRight, 
  Home
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
              <Badge variant="secondary" className="hebrew-text">
                {poll.category}
              </Badge>
            </div>
          )}
        </div>

        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
      </div>
    </div>
  );
};
