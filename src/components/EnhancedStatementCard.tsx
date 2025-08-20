import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Statement } from '@/types/poll';
import { StatementInfo } from '@/components/StatementInfo';
import { ThumbsUp, ThumbsDown, HelpCircle, ArrowRight, ArrowLeft, ArrowDown } from 'lucide-react';
interface EnhancedStatementCardProps {
  statement: Statement;
  onVote: (vote: string) => void;
  isVoting?: boolean;
  pendingVote?: string | null;
  currentIndex: number;
  totalStatements: number;
  supportLabel: string;
  opposeLabel: string;
  unsureLabel: string;
}
export const EnhancedStatementCard: React.FC<EnhancedStatementCardProps> = ({
  statement,
  onVote,
  isVoting = false,
  pendingVote = null,
  currentIndex,
  totalStatements,
  supportLabel,
  opposeLabel,
  unsureLabel
}) => {
  const [swipeState, setSwipeState] = useState<{
    isDragging: boolean;
    direction: string | null;
    distance: number;
  }>({
    isDragging: false,
    direction: null,
    distance: 0
  });
  const cardRef = useRef<HTMLDivElement>(null);
  const startPos = useRef<{
    x: number;
    y: number;
  } | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    startPos.current = {
      x: touch.clientX,
      y: touch.clientY
    };
    setSwipeState({
      isDragging: true,
      direction: null,
      distance: 0
    });
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!startPos.current || !swipeState.isDragging) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - startPos.current.x;
    const deltaY = touch.clientY - startPos.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
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
    setSwipeState({
      isDragging: true,
      direction,
      distance
    });
  };
  const handleTouchEnd = () => {
    if (!swipeState.isDragging) {
      setSwipeState({
        isDragging: false,
        direction: null,
        distance: 0
      });
      return;
    }
    if (swipeState.direction && swipeState.distance > 80) {
      switch (swipeState.direction) {
        case 'right':
          onVote('support');
          break;
        case 'left':
          onVote('oppose');
          break;
        case 'down':
          onVote('unsure');
          break;
      }
    }
    setSwipeState({
      isDragging: false,
      direction: null,
      distance: 0
    });
    startPos.current = null;
  };
  const getSwipeIndicatorColor = () => {
    switch (swipeState.direction) {
      case 'right':
        return 'border-voting-support bg-green-50';
      case 'left':
        return 'border-voting-oppose bg-red-50';
      case 'down':
        return 'border-voting-unsure bg-yellow-50';
      default:
        return '';
    }
  };
  const getSwipeIndicatorText = () => {
    switch (swipeState.direction) {
      case 'right':
        return supportLabel;
      case 'left':
        return opposeLabel;
      case 'down':
        return unsureLabel;
      default:
        return '';
    }
  };
  const getSwipeIndicatorIcon = () => {
    switch (swipeState.direction) {
      case 'right':
        return <ArrowRight className="h-4 w-4" />;
      case 'left':
        return <ArrowLeft className="h-4 w-4" />;
      case 'down':
        return <ArrowDown className="h-4 w-4" />;
      default:
        return null;
    }
  };
  return <div className="relative">
      {/* Loading overlay */}
      {isVoting && <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center z-10 animate-fade-in">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground hebrew-text">מעבד הצבעה...</p>
          </div>
        </div>}

      {/* Statement position indicator */}
      

      {/* Main card */}
      <Card ref={cardRef} className={`transition-all duration-300 cursor-grab active:cursor-grabbing select-none ${pendingVote ? 'scale-[0.98] opacity-80' : 'scale-100 opacity-100'} ${swipeState.isDragging ? `${getSwipeIndicatorColor()} border-2` : ''} animate-scale-in shadow-lg hover:shadow-xl`} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
        {/* Swipe indicator */}
        {swipeState.isDragging && swipeState.direction && <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
            <div className="bg-white px-3 py-1 rounded-full shadow-lg border-2 border-current text-sm font-medium hebrew-text flex items-center gap-2">
              {getSwipeIndicatorIcon()}
              {getSwipeIndicatorText()}
            </div>
          </div>}

        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl md:text-2xl font-bold leading-relaxed flex items-start justify-center gap-1">
            <span>{statement.content}</span>
            {statement.more_info && <StatementInfo statementContent={statement.content} moreInfo={statement.more_info} />}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Voting buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button onClick={() => onVote('support')} disabled={!!pendingVote} className={`h-14 bg-voting-support hover:bg-voting-support/90 text-white transition-all duration-300 ${pendingVote === 'support' ? 'ring-4 ring-green-300 scale-105' : ''}`} size="lg">
              <ThumbsUp className="h-5 w-5 ml-2" />
              <span className="hebrew-text text-base font-medium">{supportLabel}</span>
            </Button>
            
            <Button onClick={() => onVote('unsure')} disabled={!!pendingVote} className={`h-14 bg-voting-unsure hover:bg-voting-unsure/90 text-white transition-all duration-300 ${pendingVote === 'unsure' ? 'ring-4 ring-yellow-300 scale-105' : ''}`} size="lg">
              <HelpCircle className="h-5 w-5 ml-2" />
              <span className="hebrew-text text-base font-medium">{unsureLabel}</span>
            </Button>
            
            <Button onClick={() => onVote('oppose')} disabled={!!pendingVote} className={`h-14 bg-voting-oppose hover:bg-voting-oppose/90 text-white transition-all duration-300 ${pendingVote === 'oppose' ? 'ring-4 ring-red-300 scale-105' : ''}`} size="lg">
              <ThumbsDown className="h-5 w-5 ml-2" />
              <span className="hebrew-text text-base font-medium">{opposeLabel}</span>
            </Button>
          </div>

          {/* Swipe hints for mobile */}
          <div className="md:hidden text-center space-y-2">
            <div className="text-xs text-muted-foreground hebrew-text">
              או החליקו את הכרטיס:
            </div>
            <div className="flex justify-center gap-4 text-xs">
              <span className="flex items-center gap-1 text-voting-support">
                <ArrowRight className="h-3 w-3" />
                {supportLabel}
              </span>
              <span className="flex items-center gap-1 text-voting-unsure">
                <ArrowDown className="h-3 w-3" />
                {unsureLabel}
              </span>
              <span className="flex items-center gap-1 text-voting-oppose">
                <ArrowLeft className="h-3 w-3" />
                {opposeLabel}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>;
};