import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Target, Zap, Vote, BarChart3 } from 'lucide-react';
import { Group } from '@/types/poll';

interface ActivityItem {
  id: string;
  type: 'vote' | 'consensus' | 'participant';
  message: string;
  timestamp: Date;
}

interface LiveActivityFeedProps {
  participantCount: number;
  consensusPointsCount: number;
  totalVotes?: number;
  totalStatements?: number;
  groups?: Group[];
  isLive?: boolean;
}

export const LiveActivityFeed: React.FC<LiveActivityFeedProps> = ({
  participantCount,
  consensusPointsCount,
  totalVotes = 0,
  totalStatements = 0,
  groups = [],
  isLive = false
}) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [prevParticipantCount, setPrevParticipantCount] = useState(participantCount);
  const [prevConsensusCount, setPrevConsensusCount] = useState(consensusPointsCount);

  // Generate activity when participant count changes
  useEffect(() => {
    if (participantCount > prevParticipantCount) {
      const newActivity: ActivityItem = {
        id: `participant-${Date.now()}`,
        type: 'participant',
        message: `משתתף חדש הצטרף למשחק`,
        timestamp: new Date()
      };
      setActivities(prev => [newActivity, ...prev].slice(0, 5));
    }
    setPrevParticipantCount(participantCount);
  }, [participantCount, prevParticipantCount]);

  // Generate activity when consensus points change
  useEffect(() => {
    if (consensusPointsCount > prevConsensusCount) {
      const newActivity: ActivityItem = {
        id: `consensus-${Date.now()}`,
        type: 'consensus',
        message: `נקודת הסכמה חדשה התגלתה!`,
        timestamp: new Date()
      };
      setActivities(prev => [newActivity, ...prev].slice(0, 5));
    }
    setPrevConsensusCount(consensusPointsCount);
  }, [consensusPointsCount, prevConsensusCount]);

  // Generate random vote activities periodically
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      // Randomly generate vote activity
      if (Math.random() > 0.7) {
        const activities = [
          'משתתף הצביע על הצהרה',
          'הצבעה חדשה נרשמה',
          'קול נוסף נספר'
        ];
        
        const newActivity: ActivityItem = {
          id: `vote-${Date.now()}`,
          type: 'vote',
          message: activities[Math.floor(Math.random() * activities.length)],
          timestamp: new Date()
        };
        
        setActivities(prev => [newActivity, ...prev].slice(0, 5));
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isLive]);

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'participant':
        return <Users className="h-3 w-3 text-blue-500" />;
      case 'consensus':
        return <Target className="h-3 w-3 text-green-500" />;
      case 'vote':
        return <Zap className="h-3 w-3 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'participant':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'consensus':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'vote':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-4">
      {/* Poll Statistics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm hebrew-text">סטטיסטיקות</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Vote className="h-4 w-4 text-blue-500" />
              <span className="text-sm hebrew-text">הצבעות</span>
            </div>
            <span className="font-medium text-blue-600">{totalVotes}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-500" />
              <span className="text-sm hebrew-text">משתתפים</span>
            </div>
            <span className="font-medium text-purple-600">{participantCount}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-orange-500" />
              <span className="text-sm hebrew-text">הצהרות</span>
            </div>
            <span className="font-medium text-orange-600">{totalStatements}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-green-500" />
              <span className="text-sm hebrew-text">נקודות חיבור</span>
            </div>
            <span className="font-medium text-green-600">{consensusPointsCount}</span>
          </div>
          
          {groups.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-gray-500" />
                <span className="text-sm hebrew-text">קבוצות דעות</span>
              </div>
              <span className="font-medium text-gray-600">{groups.length}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live Activities */}
      {activities.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm hebrew-text">פעילות אחרונה</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activities.slice(0, 3).map((activity) => (
                <Badge
                  key={activity.id}
                  variant="outline"
                  className={`w-full justify-start text-xs py-2 px-3 hebrew-text animate-fade-in ${getActivityColor(activity.type)}`}
                >
                  <div className="flex items-center gap-2">
                    {getActivityIcon(activity.type)}
                    <span className="flex-1 text-right">{activity.message}</span>
                  </div>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};