
import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';

import { fetchPollById } from '@/integrations/supabase/polls';
import { submitVote } from '@/integrations/supabase/votes';
import { fetchStatementsByPollId } from '@/integrations/supabase/statements';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { StatementInfo } from '@/components/StatementInfo';
import type { Poll, Statement } from '@/types/poll';

interface OptimizedVotingInterfaceProps {
  pollId: string;
  totalStatements?: number;
  onVoteComplete?: () => void;
  className?: string;
}

export const OptimizedVotingInterface: React.FC<OptimizedVotingInterfaceProps> = ({
  pollId,
  totalStatements = 0,
  onVoteComplete,
  className = ''
}) => {
  const [currentStatementIndex, setCurrentStatementIndex] = useState(0);
  const [currentStatement, setCurrentStatement] = useState<Statement | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch poll details
  const { data: currentPoll, isLoading: pollLoading } = useQuery({
    queryKey: ['poll', pollId],
    queryFn: () => fetchPollById(pollId),
    enabled: !!pollId,
  });

  // Fetch statements for the poll
  const { data: statements, isLoading: statementsLoading } = useQuery({
    queryKey: ['statements', pollId],
    queryFn: () => fetchStatementsByPollId(pollId),
    enabled: !!pollId,
  });

  // Update current statement when statements are loaded
  useEffect(() => {
    if (statements && statements.length > 0) {
      setCurrentStatement(statements[0]);
      if (totalStatements === 0) {
        totalStatements = statements.length;
      }
    }
  }, [statements, totalStatements]);

  // Submit vote mutation
  const voteMutation = useMutation({
    mutationFn: (voteValue: 'support' | 'oppose' | 'unsure') => 
      submitVote(currentStatement!.statement_id, voteValue),
    onSuccess: () => {
      setDragOffset({ x: 0, y: 0 });
      setRotation(0);
      setSwipeDirection(null);
      
      if (statements && currentStatementIndex < statements.length - 1) {
        setCurrentStatementIndex(currentStatementIndex + 1);
        setCurrentStatement(statements[currentStatementIndex + 1]);
      } else {
        // All statements voted
        toast({
          title: 'הצלחה',
          description: 'הצבעת על כל ההצהרות!',
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'שגיאה',
        description: error.message || 'הייתה שגיאה בהצבעה. אנא נסה שוב.',
        variant: 'destructive',
      });
    },
  });

  const isLoading = pollLoading || statementsLoading;

  const handleVote = (voteValue: 'support' | 'oppose' | 'unsure') => {
    if (!currentStatement) return;
    voteMutation.mutate(voteValue);
  };

  // Drag functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - (e.currentTarget as HTMLElement).offsetLeft,
      y: e.clientY - (e.currentTarget as HTMLElement).offsetTop,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();

    const x = e.clientX - dragOffset.x;
    const y = e.clientY - dragOffset.y;
    setDragOffset({ x, y });

    // Rotate card based on horizontal drag
    const maxRotation = 15; // degrees
    const rotationStrength = Math.min(x / 50, maxRotation);
    setRotation(rotationStrength);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    releaseCard();
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      releaseCard();
    }
  };

  // Touch functionality
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.touches[0].clientX - (e.currentTarget as HTMLElement).offsetLeft,
      y: e.touches[0].clientY - (e.currentTarget as HTMLElement).offsetTop,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const x = e.touches[0].clientX - dragOffset.x;
    const y = e.touches[0].clientY - dragOffset.y;
    setDragOffset({ x, y });

    // Rotate card based on horizontal drag
    const maxRotation = 15; // degrees
    const rotationStrength = Math.min(x / 50, maxRotation);
    setRotation(rotationStrength);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    releaseCard();
  };

  // Swipe functionality using react-swipeable
  const swipeHandlers = useSwipeable({
    onSwipedRight: () => {
      setSwipeDirection('right');
      handleVote('support');
    },
    onSwipedLeft: () => {
      setSwipeDirection('left');
      handleVote('oppose');
    },
    onSwipedDown: () => {
      setSwipeDirection('down');
      handleVote('unsure');
    },
    trackMouse: false,
  });

  // Card release logic
  const releaseCard = () => {
    const threshold = 100; // Distance threshold for a swipe

    if (dragOffset.x > threshold) {
      setSwipeDirection('right');
      handleVote('support');
    } else if (dragOffset.x < -threshold) {
      setSwipeDirection('left');
      handleVote('oppose');
    } else if (dragOffset.y > threshold) {
      setSwipeDirection('down');
      handleVote('unsure');
    } else {
      // Return card to original position
      setDragOffset({ x: 0, y: 0 });
      setRotation(0);
      setTimeout(() => setSwipeDirection(null), 200);
    }
  };

  return (
    <div className={`max-w-2xl mx-auto p-6 ${className}`}>
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : currentStatement ? (
        <div className="space-y-6">
          {/* Progress indicator */}
          <div className="text-center">
            <p className="text-sm text-gray-600 hebrew-text">
              הצהרה {currentStatementIndex + 1} מתוך {totalStatements}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-[#1a305b] h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStatementIndex + 1) / totalStatements) * 100}%` }}
              />
            </div>
          </div>

          {/* Statement Card */}
          <div 
            ref={cardRef}
            className={`
              relative bg-white rounded-xl shadow-lg border border-gray-200 p-8 min-h-[300px]
              cursor-grab active:cursor-grabbing select-none touch-none
              transition-transform duration-200 ease-out
              ${isDragging ? 'scale-105 shadow-2xl' : ''}
              ${swipeDirection === 'right' ? 'border-green-400 bg-green-50' : ''}
              ${swipeDirection === 'left' ? 'border-red-400 bg-red-50' : ''}
              ${swipeDirection === 'down' ? 'border-yellow-400 bg-yellow-50' : ''}
            `}
            style={{
              transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg)`
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            {...swipeHandlers}
          >
            {/* Swipe indicators */}
            {swipeDirection && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className={`
                  text-6xl font-bold opacity-60
                  ${swipeDirection === 'right' ? 'text-green-600' : ''}
                  ${swipeDirection === 'left' ? 'text-red-600' : ''}
                  ${swipeDirection === 'down' ? 'text-yellow-600' : ''}
                `}>
                  {swipeDirection === 'right' && '✓'}
                  {swipeDirection === 'left' && '✗'}
                  {swipeDirection === 'down' && '?'}
                </div>
              </div>
            )}

            {/* Statement content */}
            <div className="flex flex-col items-center justify-center h-full text-center relative">
              {/* More info button */}
              {currentStatement.more_info && (
                <div className="absolute top-0 right-0">
                  <StatementInfo 
                    moreInfo={currentStatement.more_info}
                    statementContent={currentStatement.content}
                  />
                </div>
              )}

              <h2 className="text-xl font-medium text-gray-900 hebrew-text leading-relaxed">
                {currentStatement.content}
              </h2>
            </div>
          </div>

          {/* Voting buttons */}
          <div className="flex justify-center gap-4">
            <Button
              onClick={() => handleVote('oppose')}
              disabled={voteMutation.isPending}
              variant="outline"
              className="flex-1 max-w-[120px] h-12 bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300"
            >
              {currentPoll?.oppose_button_label || 'מתנגד'}
            </Button>
            
            <Button
              onClick={() => handleVote('unsure')}
              disabled={voteMutation.isPending}
              variant="outline"
              className="flex-1 max-w-[120px] h-12 bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100 hover:border-yellow-300"
            >
              {currentPoll?.unsure_button_label || 'לא בטוח'}
            </Button>
            
            <Button
              onClick={() => handleVote('support')}
              disabled={voteMutation.isPending}
              variant="outline"
              className="flex-1 max-w-[120px] h-12 bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300"
            >
              {currentPoll?.support_button_label || 'תומך'}
            </Button>
          </div>

          {/* Instructions */}
          <div className="text-center">
            <p className="text-sm text-gray-500 hebrew-text">
              החלק ימינה לתמיכה • החלק שמאלה להתנגדות • החלק למטה אם לא בטוח
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 hebrew-text">
            סיימת להצביע על כל ההצהרות!
          </h2>
          <p className="text-gray-600 hebrew-text">
            תודה על השתתפותך בסקר
          </p>
          {onVoteComplete && (
            <Button onClick={onVoteComplete} className="mt-4">
              עבור לתוצאות
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
