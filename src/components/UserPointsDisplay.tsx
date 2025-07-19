
import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Lock, Star } from 'lucide-react';
import { useUserPoints } from '@/hooks/useUserPoints';
import { useAuth } from '@/contexts/AuthContext';
import { UserPoints } from '@/integrations/supabase/userPoints';
import { RegistrationCTA } from './RegistrationCTA';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface UserPointsDisplayProps {
  className?: string;
  showIcon?: boolean;
  userPoints?: UserPoints;
}

export const UserPointsDisplay: React.FC<UserPointsDisplayProps> = ({ 
  className = '',
  showIcon = true,
  userPoints
}) => {
  const { points, loading } = useUserPoints();
  const { user } = useAuth();
  
  // Use provided userPoints if available, otherwise fall back to hook
  const currentPoints = userPoints || points;
  const displayPoints = userPoints ? userPoints.total_points : (loading ? 0 : points.total_points);
  
  // Animation states
  const [isAnimating, setIsAnimating] = useState(false);
  const [iconBouncing, setIconBouncing] = useState(false);
  const [showRegistrationNudge, setShowRegistrationNudge] = useState(false);
  const prevPointsRef = useRef(displayPoints);
  
  // Show registration nudge for guests with significant points
  useEffect(() => {
    if (!user && displayPoints >= 50) {
      setShowRegistrationNudge(true);
    } else {
      setShowRegistrationNudge(false);
    }
  }, [user, displayPoints]);
  
  // Trigger animation when points change
  useEffect(() => {
    if (prevPointsRef.current !== displayPoints && prevPointsRef.current !== 0) {
      // Trigger both animations
      setIsAnimating(true);
      setIconBouncing(true);
      
      // Reset animations after duration
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setIconBouncing(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
    prevPointsRef.current = displayPoints;
  }, [displayPoints]);

  const getNextMilestone = () => {
    if (displayPoints < 100) return { target: 100, name: 'מדליית ארד' };
    if (displayPoints < 250) return { target: 250, name: 'מדליית כסף' };
    if (displayPoints < 500) return { target: 500, name: 'מדליית זהב' };
    return { target: 1000, name: 'מדליית יהלום' };
  };

  const milestone = getNextMilestone();
  const pointsToNext = milestone.target - displayPoints;

  const pointsContent = (
    <div 
      className={`hebrew-text flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm cursor-pointer transition-all duration-300 hover:scale-105 ${className}`}
      style={{
        backgroundColor: '#66c8ca',
        color: '#1a305b',
        boxShadow: showRegistrationNudge ? '0 0 20px rgba(102, 200, 202, 0.8)' : '0 4px 12px rgba(102, 200, 202, 0.4)',
        transform: isAnimating ? 'scale(1.08)' : 'scale(1)',
        transition: 'all 0.3s ease, transform 0.2s ease',
        position: 'relative' as const,
      }}
      onMouseEnter={(e) => {
        if (!isAnimating) {
          e.currentTarget.style.boxShadow = showRegistrationNudge ? '0 0 25px rgba(102, 200, 202, 1)' : '0 6px 20px rgba(102, 200, 202, 0.6)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = showRegistrationNudge ? '0 0 20px rgba(102, 200, 202, 0.8)' : '0 4px 12px rgba(102, 200, 202, 0.4)';
      }}
    >
      {!user && showRegistrationNudge && (
        <div className="absolute -top-1 -right-1 animate-pulse">
          <Lock className="h-3 w-3 text-yellow-500" />
        </div>
      )}
      
      {showIcon && (
        <Trophy 
          className={`h-4 w-4 transition-transform duration-200 ${iconBouncing ? 'animate-bounce' : ''}`}
          style={{ 
            color: '#1a305b',
            transform: iconBouncing ? 'scale(1.2)' : 'scale(1)',
          }}
        />
      )}
      <span>
        {displayPoints.toLocaleString()} נקודות
      </span>
      
      {!user && showRegistrationNudge && (
        <div className="text-xs opacity-75 flex items-center gap-1">
          <Star className="h-3 w-3" />
          זמני
        </div>
      )}
    </div>
  );

  if (!user && showRegistrationNudge) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          {pointsContent}
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <RegistrationCTA 
            context="points" 
            userPoints={displayPoints}
            compact={false}
          />
          {pointsToNext > 0 && (
            <div className="p-3 border-t bg-muted/20">
              <div className="text-xs text-center hebrew-text text-muted-foreground">
                עוד {pointsToNext} נקודות ל{milestone.name}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                <div 
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${((displayPoints % milestone.target) / milestone.target) * 100}%` }}
                />
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    );
  }

  return pointsContent;
};
