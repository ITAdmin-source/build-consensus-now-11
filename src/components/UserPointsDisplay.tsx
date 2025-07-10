import React, { useState, useEffect, useRef } from 'react';
import { Trophy } from 'lucide-react';
import { useUserPoints } from '@/hooks/useUserPoints';
import { UserPoints } from '@/integrations/supabase/userPoints';

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
  
  // Use provided userPoints if available, otherwise fall back to hook
  const currentPoints = userPoints || points;
  const displayPoints = userPoints ? userPoints.total_points : (loading ? 0 : points.total_points);
  
  // Animation states
  const [isAnimating, setIsAnimating] = useState(false);
  const [iconBouncing, setIconBouncing] = useState(false);
  const prevPointsRef = useRef(displayPoints);
  
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

  return (
    <div 
      className={`hebrew-text flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm cursor-pointer transition-all duration-300 hover:scale-105 ${className}`}
      style={{
        backgroundColor: '#66c8ca',
        color: '#1a305b',
        boxShadow: '0 4px 12px rgba(102, 200, 202, 0.4)',
        transform: isAnimating ? 'scale(1.08)' : 'scale(1)',
        transition: 'all 0.3s ease, transform 0.2s ease',
      }}
      onMouseEnter={(e) => {
        if (!isAnimating) {
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 200, 202, 0.6)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 200, 202, 0.4)';
      }}
    >
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
    </div>
  );
};