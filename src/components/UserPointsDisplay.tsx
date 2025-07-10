
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';
import { useUserPoints } from '@/hooks/useUserPoints';

interface UserPointsDisplayProps {
  className?: string;
  showIcon?: boolean;
}

export const UserPointsDisplay: React.FC<UserPointsDisplayProps> = ({ 
  className = '',
  showIcon = true
}) => {
  const { points, loading } = useUserPoints();

  if (loading || !points) {
    return null;
  }

  return (
    <Badge variant="secondary" className={`hebrew-text flex items-center gap-1 ${className}`}>
      {showIcon && <Trophy className="h-3 w-3 text-yellow-600" />}
      <span>{points.total_points} נקודות</span>
    </Badge>
  );
};
