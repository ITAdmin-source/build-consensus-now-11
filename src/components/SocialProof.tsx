
import React, { useEffect, useState } from 'react';
import { Users, MessageCircle, TrendingUp, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SocialProofProps {
  variant?: 'compact' | 'detailed';
  className?: string;
  showLive?: boolean;
}

export const SocialProof: React.FC<SocialProofProps> = ({
  variant = 'compact',
  className = '',
  showLive = false
}) => {
  const [stats, setStats] = useState({
    totalUsers: 2847,
    activeNow: 23,
    totalVotes: 45600,
    consensusPoints: 156
  });

  // Simulate live updates for engagement
  useEffect(() => {
    if (!showLive) return;

    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        activeNow: Math.max(15, prev.activeNow + (Math.random() > 0.5 ? 1 : -1)),
        totalVotes: prev.totalVotes + Math.floor(Math.random() * 3)
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [showLive]);

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 text-sm text-muted-foreground hebrew-text ${className}`}>
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          <span>{stats.totalUsers.toLocaleString()} משתתפים</span>
        </div>
        {showLive && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>{stats.activeNow} פעילים עכשיו</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-3 p-4 bg-muted/30 rounded-lg ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <Activity className="h-5 w-5 text-primary" />
        <span className="font-medium hebrew-text">הקהילה שלנו</span>
        {showLive && (
          <Badge variant="secondary" className="text-xs">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse mr-1" />
            LIVE
          </Badge>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="text-center p-2 rounded bg-background/50">
          <div className="font-bold text-lg">{stats.totalUsers.toLocaleString()}</div>
          <div className="text-muted-foreground hebrew-text">משתתפים רשומים</div>
        </div>
        
        <div className="text-center p-2 rounded bg-background/50">
          <div className="font-bold text-lg">{stats.totalVotes.toLocaleString()}</div>
          <div className="text-muted-foreground hebrew-text">הצבעות סה"כ</div>
        </div>
        
        <div className="text-center p-2 rounded bg-background/50">
          <div className="font-bold text-lg text-green-600">{stats.consensusPoints}</div>
          <div className="text-muted-foreground hebrew-text">נקודות קונצנזוס</div>
        </div>
        
        <div className="text-center p-2 rounded bg-background/50">
          <div className="font-bold text-lg text-blue-600">{stats.activeNow}</div>
          <div className="text-muted-foreground hebrew-text">פעילים עכשיו</div>
        </div>
      </div>
    </div>
  );
};
