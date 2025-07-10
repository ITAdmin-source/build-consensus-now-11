import React from 'react';
import { Crown } from 'lucide-react';
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

  return (
    <div 
      className={`hebrew-text ${className}`}
      style={{
        background: `linear-gradient(135deg, #1a305b 0%, #1a305b 50%, #ec0081 100%)`,
        padding: '2px',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(236, 0, 129, 0.3), 0 0 0 1px rgba(102, 200, 202, 0.3)',
      }}
    >
      <div 
        className="flex items-center gap-2 px-4 py-2 rounded-[10px]"
        style={{
          backgroundColor: '#1a305b',
          border: '1px solid rgba(102, 200, 202, 0.4)',
        }}
      >
        {showIcon && (
          <Crown 
            className="h-4 w-4 animate-pulse" 
            style={{ color: '#66c8ca' }}
          />
        )}
        <span 
          className="font-bold text-sm"
          style={{ color: '#66c8ca' }}
        >
          {displayPoints.toLocaleString()} נקודות
        </span>
      </div>
    </div>
  );
};