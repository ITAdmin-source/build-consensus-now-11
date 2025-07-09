import React, { useState, useMemo, useRef, useCallback } from 'react';
import { Poll, Statement } from '@/types/poll';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserStatementForm } from '@/components/UserStatementForm';
import { StatementInfo } from '@/components/StatementInfo';
import { VotingProgress } from '@/components/VotingProgress';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, HelpCircle, LogIn } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { getVotingButtonLabels } from '@/utils/votingButtonUtils';

interface OptimizedVotingInterfaceProps {
  poll: Poll;
  statement: Statement | null;
  userVoteCount: number;
  totalStatements: number;
  remainingStatements: number;
  onVote: (statementId: string, vote: string) => void;
  onViewResults: () => void;
  onSubmitStatement?: (content: string, contentType: string) => void;
  isVoting?: boolean;
}

export const OptimizedVotingInterface: React.FC<OptimizedVotingInterfaceProps> = React.memo(({
  poll,
  statement,
  userVoteCount,
  totalStatements,
  remainingStatements,
  onVote,
  onViewResults,
  onSubmitStatement,
  isVoting = false
}) => {
  const { user } = useAuth();
  const [pendingVote, setPendingVote] = useState<string | null>(null);
  const [cardTransform, setCardTransform] = useState({ x: 0, y: 0, rotate: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  
  const cardRef = useRef<HTMLDivElement>(null);
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const animationRef = useRef<number>();
  const buttonLabels = getVotingButtonLabels(poll);

  // Enhanced physics for card movement
  const updateCardPosition = useCallback((deltaX: number, deltaY: number) => {
    const maxRotation = 15;
    const maxTranslation = 300;
    
    // Constrain translation
    const constrainedX = Math.max(-maxTranslation, Math.min(maxTranslation, deltaX));
    const constrainedY = Math.max(-maxTranslation, Math.min(maxTranslation, deltaY));
    
    // Calculate rotation based on horizontal movement
    const rotation = (constrainedX / maxTranslation) * maxRotation;
    
    setCardTransform({
      x: constrainedX,
      y: constrainedY * 0.3, // Reduce vertical movement
      rotate: rotation
    });
    
    // Determine swipe direction based on movement
    let direction = null;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > 50) {
        direction = deltaX > 0 ? 'right' : 'left';
      }
    } else {
      if (Math.abs(deltaY) > 50) {
        direction = deltaY > 0 ? 'down' : 'up';
      }
    }
    
    setSwipeDirection(direction);
  }, []);

  const handleOptimisticVote = useCallback((vote: string) => {
    if (!statement || isExiting) return;
    
    setPendingVote(vote);
    setIsExiting(true);
    
    // Animate card exit
    const exitDirection = vote === 'support' ? 'right' : vote === 'oppose' ? 'left' : 'down';
    const exitTransform = {
      x: exitDirection === 'right' ? 400 : exitDirection === 'left' ? -400 : 0,
      y: exitDirection === 'down' ? 400 : -100,
      rotate: exitDirection === 'right' ? 30 : exitDirection === 'left' ? -30 : 0
    };
    
    setCardTransform(exitTransform);
    
    // Submit vote after animation starts
    setTimeout(() => {
      onVote(statement.statement_id, vote);
      
      // Reset states for next card
      setTimeout(() => {
        setPendingVote(null);
        setIsExiting(false);
        setCardTransform({ x: 0, y: 0, rotate: 0 });
      }, 100);
    }, 200);
  }, [statement, onVote, isExiting]);

  const handleInteractionStart = useCallback((clientX: number, clientY: number) => {
    if (isExiting) return;
    
    startPos.current = { x: clientX, y: clientY };
    setIsDragging(true);
    setCardTransform({ x: 0, y: 0, rotate: 0 });
    
    // Cancel any ongoing animations
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, [isExiting]);

  const handleInteractionMove = useCallback((clientX: number, clientY: number) => {
    if (!startPos.current || !isDragging || isExiting) return;
    
    const deltaX = clientX - startPos.current.x;
    const deltaY = clientY - startPos.current.y;
    
    updateCardPosition(deltaX, deltaY);
  }, [isDragging, isExiting, updateCardPosition]);

  const handleInteractionEnd = useCallback(() => {
    if (!isDragging || isExiting) return;
    
    setIsDragging(false);
    
    const { x, y } = cardTransform;
    const threshold = 80;
    
    // Check if swipe was strong enough to trigger vote
    if (Math.abs(x) > threshold || Math.abs(y) > threshold) {
      let vote = null;
      
      if (Math.abs(x) > Math.abs(y)) {
        vote = x > 0 ? 'support' : 'oppose';
      } else if (y > 0) {
        vote = 'unsure';
      }
      
      if (vote) {
        handleOptimisticVote(vote);
        return;
      }
    }
    
    // Spring back to center if swipe wasn't strong enough
    const springBack = () => {
      setCardTransform(prev => ({
        x: prev.x * 0.8,
        y: prev.y * 0.8,
        rotate: prev.rotate * 0.8
      }));
      
      if (Math.abs(cardTransform.x) > 1 || Math.abs(cardTransform.y) > 1) {
        animationRef.current = requestAnimationFrame(springBack);
      } else {
        setCardTransform({ x: 0, y: 0, rotate: 0 });
        setSwipeDirection(null);
      }
    };
    
    springBack();
    startPos.current = null;
  }, [isDragging, isExiting, cardTransform, handleOptimisticVote]);

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleInteractionStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleInteractionMove(touch.clientX, touch.clientY);
  };

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    handleInteractionStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleInteractionMove(e.clientX, e.clientY);
  };

  // Cleanup animation on unmount
  React.useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Memoize user statement section to prevent unnecessary re-renders
  const userStatementSection = useMemo(() => {
    if (!poll.allow_user_statements) return null;
    
    if (user && onSubmitStatement) {
      return <UserStatementForm poll={poll} onSubmitStatement={onSubmitStatement} />;
    } else {
      return (
        <div className="text-center p-4 rounded-lg border border-blue-200 bg-white">
          <LogIn className="h-8 w-8 mx-auto mb-2 text-blue-600" />
          <p className="text-blue-800 mb-3 hebrew-text">
            להוספת הצהרות חדשות נדרשת התחברות
          </p>
          <Link to="/auth">
            <Button variant="outline" size="sm">
              <LogIn className="h-4 w-4 ml-2" />
              התחבר למערכת
            </Button>
          </Link>
        </div>
      );
    }
  }, [poll.allow_user_statements, user, onSubmitStatement, poll]);

  // Show completion message when no statement is available
  if (!statement) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
          <h3 className="text-xl font-bold text-green-800 mb-2 hebrew-text">
            🎉 סיימת להצביע על כל ההצהרות!
          </h3>
          <p className="text-green-700 mb-4 hebrew-text">
            תודה על השתתפותך. כעת תוכל לראות את התוצאות ולגלות אילו נקודות חיבור נמצאו.
          </p>
          <Button 
            onClick={onViewResults} 
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
          >
            צפה בתוצאות
          </Button>
        </div>
        
        <VotingProgress
          poll={poll}
          userVoteCount={userVoteCount}
          totalStatements={totalStatements}
          remainingStatements={remainingStatements}
        />
        
        {userStatementSection}
      </div>
    );
  }

  const getSwipeIndicatorStyle = () => {
    const opacity = Math.min(Math.abs(cardTransform.x) / 100, 1);
    switch (swipeDirection) {
      case 'right': 
        return { 
          backgroundColor: `rgba(34, 197, 94, ${opacity * 0.2})`,
          borderColor: `rgba(34, 197, 94, ${opacity})`,
          color: `rgba(34, 197, 94, ${opacity})`
        };
      case 'left': 
        return { 
          backgroundColor: `rgba(239, 68, 68, ${opacity * 0.2})`,
          borderColor: `rgba(239, 68, 68, ${opacity})`,
          color: `rgba(239, 68, 68, ${opacity})`
        };
      case 'down': 
        return { 
          backgroundColor: `rgba(245, 158, 11, ${opacity * 0.2})`,
          borderColor: `rgba(245, 158, 11, ${opacity})`,
          color: `rgba(245, 158, 11, ${opacity})`
        };
      default: 
        return {};
    }
  };

  const getSwipeIndicatorText = () => {
    switch (swipeDirection) {
      case 'right': return buttonLabels.support;
      case 'left': return buttonLabels.oppose;
      case 'down': return buttonLabels.unsure;
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Card Stack Container */}
      <div className="relative h-96 flex items-center justify-center">
        {/* Background cards for stack effect */}
        <div 
          className="absolute inset-4 bg-white rounded-2xl shadow-lg transform scale-95 opacity-60"
          style={{ zIndex: 1 }}
        />
        <div 
          className="absolute inset-2 bg-white rounded-2xl shadow-lg transform scale-98 opacity-80"
          style={{ zIndex: 2 }}
        />
        
        {/* Main interactive card */}
        <Card 
          ref={cardRef}
          className={`
            relative w-full max-w-md mx-auto
            bg-white rounded-2xl shadow-2xl
            cursor-grab active:cursor-grabbing select-none
            transition-all duration-200 ease-out
            ${isDragging ? 'shadow-3xl' : 'shadow-2xl'}
            ${isExiting ? 'opacity-60' : 'opacity-100'}
          `}
          style={{
            transform: `translate(${cardTransform.x}px, ${cardTransform.y}px) rotate(${cardTransform.rotate}deg)`,
            transition: isDragging || isExiting ? 'none' : 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            zIndex: 10,
            ...getSwipeIndicatorStyle()
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleInteractionEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={isDragging ? handleMouseMove : undefined}
          onMouseUp={handleInteractionEnd}
          onMouseLeave={handleInteractionEnd}
        >
          {/* Loading overlay */}
          {isVoting && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center z-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-gray-600 hebrew-text">מעבד הצבעה...</p>
              </div>
            </div>
          )}
          
          {/* Swipe indicator */}
          {isDragging && swipeDirection && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30">
              <div 
                className="px-4 py-2 rounded-full border-2 font-bold text-lg hebrew-text transition-all duration-150"
                style={getSwipeIndicatorStyle()}
              >
                {getSwipeIndicatorText()}
              </div>
            </div>
          )}
          
          <CardHeader className="text-center pb-4">
            <div className="flex items-start justify-between mb-4">
              <CardTitle className="text-2xl font-bold hebrew-text leading-relaxed flex-1 text-center">
                {statement.content}
              </CardTitle>
              {statement.more_info && (
                <div className="mr-2 flex-shrink-0">
                  <StatementInfo moreInfo={statement.more_info} />
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Swipe Instructions */}
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600 hebrew-text mb-2">
                גרור את הכרטיס כדי להצביע
              </p>
              <div className="flex justify-center space-x-4 text-xs text-gray-500">
                <span className="hebrew-text">← התנגדות</span>
                <span className="hebrew-text">↓ לא בטוח</span>
                <span className="hebrew-text">→ תמיכה</span>
              </div>
            </div>
            
            {/* Fallback buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button 
                onClick={() => handleOptimisticVote('support')} 
                disabled={!!pendingVote || isDragging}
                className="vote-button bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 transition-all duration-300"
                size="sm"
              >
                <ThumbsUp className="h-5 w-5 ml-2" />
                <span className="hebrew-text">{buttonLabels.support}</span>
              </Button>
              
              <Button 
                onClick={() => handleOptimisticVote('unsure')} 
                disabled={!!pendingVote || isDragging}
                className="vote-button bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-4 transition-all duration-300"
                size="sm"
              >
                <HelpCircle className="h-5 w-5 ml-2" />
                <span className="hebrew-text">{buttonLabels.unsure}</span>
              </Button>
              
              <Button 
                onClick={() => handleOptimisticVote('oppose')} 
                disabled={!!pendingVote || isDragging}
                className="vote-button bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-4 transition-all duration-300"
                size="sm"
              >
                <ThumbsDown className="h-5 w-5 ml-2" />
                <span className="hebrew-text">{buttonLabels.oppose}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <VotingProgress
        poll={poll}
        userVoteCount={userVoteCount}
        totalStatements={totalStatements}
        remainingStatements={remainingStatements}
      />

      {userStatementSection}
    </div>
  );
});

OptimizedVotingInterface.displayName = 'OptimizedVotingInterface';