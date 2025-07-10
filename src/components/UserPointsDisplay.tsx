
import React from 'react';
import { Badge } from '@/components/ui/badge';
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

  return (
    <Badge variant="secondary" className={`hebrew-text flex items-center gap-1 ${className}`}>
      {showIcon && <Trophy className="h-3 w-3 text-yellow-600" />}
      <span>{displayPoints} נקודות</span>
    </Badge>
  );
};
