import React, { useState } from 'react';
import { NavigationHeader } from '@/components/NavigationHeader';
import { UserAvatar } from '@/components/UserAvatar';
import { UserPointsDisplay } from '@/components/UserPointsDisplay';
import { UserPollParticipation } from '@/components/UserPollParticipation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUserPoints } from '@/hooks/useUserPoints';
import { useUserParticipation } from '@/hooks/useUserParticipation';
import { supabase } from '@/integrations/supabase/client';
import { User, Settings, Mail } from 'lucide-react';

export const Account: React.FC = () => {
  const { user, signOut } = useAuth();
  const { profile, refetch: refetchProfile } = useUserProfile();
  const { points } = useUserPoints();
  const { participation, loading: participationLoading, error: participationError } = useUserParticipation();
  
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setBio(profile.bio || '');
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('polis_user_profiles')
        .upsert([
          {
            user_id: user.id,
            display_name: displayName,
            bio: bio,
          }
        ]);

      if (error) throw error;

      await refetchProfile();
      toast.success('הפרופיל עודכן בהצלחה');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('שגיאה בעדכון הפרופיל');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;

    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast.success('קישור לאיפוס סיסמה נשלח למייל');
    } catch (error) {
      console.error('Error sending password reset:', error);
      toast.error('שגיאה בשליחת קישור איפוס סיסמה');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('התנתקת בהצלחה');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('שגיאה בהתנתקות');
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50" dir="rtl">
      <NavigationHeader currentPage="home" userPoints={points} />
      
      <div className="container mx-auto px-4 pt-8 max-w-4xl">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                פרופיל אישי
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex justify-center">
                <UserAvatar 
                  avatarUrl={profile?.avatar_url}
                  displayName={profile?.display_name}
                  email={user.email}
                  size="lg" 
                />
              </div>

              {/* Points Display */}
              <div className="text-center">
                <UserPointsDisplay userPoints={points} />
              </div>

              {/* Personal Information */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">שם תצוגה</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="הכנס שם תצוגה"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">ביוגרפיה</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="ספר על עצמך..."
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={handleSave} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'שומר...' : 'שמור שינויים'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                הגדרות חשבון
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  כתובת מייל
                </Label>
                <Input value={user.email || ''} disabled />
              </div>

              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  onClick={handlePasswordReset}
                  disabled={isLoading}
                  className="w-full"
                >
                  איפוס סיסמה
                </Button>
                
                <Button 
                  variant="destructive" 
                  onClick={handleSignOut}
                  className="w-full"
                >
                  התנתק
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Poll Participation Section */}
        <div className="mt-6">
          <UserPollParticipation 
            participation={participation}
            loading={participationLoading}
            error={participationError}
          />
        </div>
      </div>
    </div>
  );
};