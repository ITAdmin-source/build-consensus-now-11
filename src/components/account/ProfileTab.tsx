
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/useUserProfile';
import { UserPoints } from '@/integrations/supabase/userPoints';
import { 
  Edit3, 
  Save, 
  X, 
  Trophy, 
  Target, 
  Award,
  TrendingUp,
  Calendar
} from 'lucide-react';

interface ProfileTabProps {
  user: any;
  profile: any;
  points: UserPoints;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({ user, profile, points }) => {
  const { refetch } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);
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
        .upsert([{
          user_id: user.id,
          display_name: displayName,
          bio: bio,
        }]);

      if (error) throw error;

      await refetch();
      setIsEditing(false);
      toast.success('הפרופיל עודכן בהצלחה');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('שגיאה בעדכון הפרופיל');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setDisplayName(profile?.display_name || '');
    setBio(profile?.bio || '');
    setIsEditing(false);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Profile Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            פרטים אישיים
          </CardTitle>
          {!isEditing && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsEditing(true)}
            >
              ערוך
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">שם תצוגה</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={!isEditing}
              placeholder="הכנס שם תצוגה"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">ביוגרפיה</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={!isEditing}
              placeholder="ספר על עצמך..."
              rows={4}
            />
          </div>

          {isEditing && (
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={isLoading}>
                <Save className="h-4 w-4 ml-1" />
                {isLoading ? 'שומר...' : 'שמור'}
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 ml-1" />
                ביטול
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            סטטיסטיקות
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-[#1a305b] to-[#66c8ca] text-white p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-5 w-5" />
                <span className="text-sm font-medium">נקודות כולל</span>
              </div>
              <div className="text-2xl font-bold">{points.total_points}</div>
            </div>
            
            <div className="bg-gradient-to-r from-[#ec0081] to-[#66c8ca] text-white p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5" />
                <span className="text-sm font-medium">הצבעות</span>
              </div>
              <div className="text-2xl font-bold">{points.votes_count}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements - Placeholder for future implementation */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            הישגים ותגים
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">הישגים יגיעו בקרוב!</h3>
            <p className="text-sm">
              המשך להשתתף בסקרים כדי לזכות בתגים והישגים מיוחדים.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
