import React from 'react';
import { NavigationHeader } from '@/components/NavigationHeader';
import { useUserLeaderboard } from '@/hooks/useUserLeaderboard';
import { useUserPoints } from '@/hooks/useUserPoints';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/UserAvatar';
import { Trophy, Medal, Award } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export const Leaderboard: React.FC = () => {
  const { leaderboard, loading, error } = useUserLeaderboard();
  const { points } = useUserPoints();
  const { user } = useAuth();

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{position}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50" dir="rtl">
        <NavigationHeader currentPage="home" userPoints={points} />
        <div className="container mx-auto px-4 pt-8 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-center hebrew-text">לוח המובילים</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(10)].map((_, index) => (
                  <div key={index} className="flex items-center gap-4 p-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50" dir="rtl">
        <NavigationHeader currentPage="home" userPoints={points} />
        <div className="container mx-auto px-4 pt-8 max-w-4xl">
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-destructive hebrew-text">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50" dir="rtl">
      <NavigationHeader currentPage="home" userPoints={points} />
      
      <div className="container mx-auto px-4 pt-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-center hebrew-text flex items-center justify-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              לוח המובילים
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leaderboard.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground hebrew-text">אין עדיין משתתפים בלוח המובילים</p>
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((leader) => {
                  const isCurrentUser = user && leader.user_id === user.id;
                  return (
                    <div
                      key={leader.user_id}
                      className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                        isCurrentUser 
                          ? 'bg-[#66c8ca]/10 border-2 border-[#66c8ca]' 
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center justify-center w-8">
                        {getRankIcon(leader.rank_position)}
                      </div>
                      
                      <UserAvatar
                        avatarUrl={leader.avatar_url}
                        displayName={leader.display_name}
                        size="md"
                      />
                      
                      <div className="flex-1">
                        <h3 className="font-semibold hebrew-text">
                          {leader.display_name}
                          {isCurrentUser && (
                            <Badge variant="secondary" className="mr-2 text-xs">
                              את/ה
                            </Badge>
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground hebrew-text">
                          {leader.votes_count} הצבעות
                        </p>
                      </div>
                      
                      <Badge variant="outline" className="font-bold">
                        {leader.total_points} נקודות
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};