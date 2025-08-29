
import React from 'react';
import { NavigationHeader } from '@/components/NavigationHeader';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { PollParticipationGrid } from '@/components/profile/PollParticipationGrid';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUserPoints } from '@/hooks/useUserPoints';
import { useUserParticipation } from '@/hooks/useUserParticipation';
import { useUserInsights } from '@/hooks/useUserInsights';
import { Card, CardContent } from '@/components/ui/card';

export const Account: React.FC = () => {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const { points } = useUserPoints();
  const { participation, loading: participationLoading, error: participationError } = useUserParticipation();
  const { insights, loading: insightsLoading } = useUserInsights();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <NavigationHeader currentPage="home" />
        <div className="container mx-auto px-4 pt-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="text-center py-8">
              <p>עליך להתחבר כדי לצפות בחשבון שלך</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const loading = participationLoading || insightsLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50" dir="rtl">
      <NavigationHeader currentPage="home" userPoints={points} />
      
      <div className="container mx-auto px-4 pt-8 max-w-6xl">
        {/* Profile Header */}
        <ProfileHeader 
          user={user} 
          profile={profile} 
          points={points} 
        />
        
        {/* Stats and Participation Grid */}
        <div className="mt-8 space-y-8">
          <ProfileStats 
            points={points} 
            participation={participation} 
          />
          
          <PollParticipationGrid 
            participation={participation}
            insights={insights}
            loading={loading}
            error={participationError}
          />
        </div>
      </div>
    </div>
  );
};
