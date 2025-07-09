
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff } from 'lucide-react';

interface LiveIndicatorProps {
  isLive: boolean;
  className?: string;
}

export const LiveIndicator: React.FC<LiveIndicatorProps> = ({ isLive, className = '' }) => {
  return (
    <Badge 
      variant={isLive ? "default" : "outline"} 
      className={`animate-pulse ${isLive ? 'bg-[#ec0081] text-white' : 'bg-[#66c8ca]/20 text-[#1a305b] border-[#66c8ca]'} ${className}`}
    >
      {isLive ? (
        <>
          <Wifi className="h-3 w-3 ml-1" />
          <span className="hebrew-text">עדכון חי</span>
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3 ml-1" />
          <span className="hebrew-text">מחובר</span>
        </>
      )}
    </Badge>
  );
};
