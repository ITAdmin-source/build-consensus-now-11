
import React, { useState } from 'react';
import { NavigationHeader } from '@/components/NavigationHeader';
import { AccountHeader } from '@/components/account/AccountHeader';
import { AccountTabs } from '@/components/account/AccountTabs';
import { ProfileTab } from '@/components/account/ProfileTab';
import { ActivityTab } from '@/components/account/ActivityTab';
import { InsightsTab } from '@/components/account/InsightsTab';
import { SettingsTab } from '@/components/account/SettingsTab';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUserPoints } from '@/hooks/useUserPoints';
import { Card, CardContent } from '@/components/ui/card';

export const Account: React.FC = () => {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const { points } = useUserPoints();
  const [activeTab, setActiveTab] = useState('profile');

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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab user={user} profile={profile} points={points} />;
      case 'activity':
        return <ActivityTab />;
      case 'insights':
        return <InsightsTab />;
      case 'settings':
        return <SettingsTab user={user} profile={profile} />;
      default:
        return <ProfileTab user={user} profile={profile} points={points} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50" dir="rtl">
      <NavigationHeader currentPage="home" userPoints={points} />
      
      <div className="container mx-auto px-4 pt-8 max-w-6xl">
        {/* Header Section */}
        <AccountHeader 
          user={user} 
          profile={profile} 
          points={points} 
        />
        
        {/* Tab Navigation & Content */}
        <div className="mt-8">
          <AccountTabs 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />
          
          <div className="mt-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};
