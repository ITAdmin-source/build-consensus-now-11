
import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUserPoints } from '@/hooks/useUserPoints';
import { UserAvatar } from './UserAvatar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Mail, 
  Camera, 
  Trash2, 
  Key, 
  Trophy,
  Save,
  Loader2,
  Award,
  Target
} from 'lucide-react';

interface UserProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UserProfileDialog: React.FC<UserProfileDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { user } = useAuth();
  const { profile, loading, uploading, updateProfile, uploadAvatar, removeAvatar } = useUserProfile();
  const { points } = useUserPoints();
  const { toast } = useToast();
  
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setBio(profile.bio || '');
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    const result = await updateProfile({
      display_name: displayName.trim() || null,
      bio: bio.trim() || null,
    });
    
    if (!result.error) {
      setIsEditing(false);
    }
    setSaving(false);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'קובץ גדול מדי',
        description: 'גודל התמונה חייב להיות פחות מ-2MB',
        variant: 'destructive',
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'סוג קובץ לא תקין',
        description: 'יש להעלות קובץ תמונה בלבד',
        variant: 'destructive',
      });
      return;
    }

    await uploadAvatar(file);
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) {
        toast({
          title: 'שגיאה',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'מייל נשלח',
          description: 'קישור לאיפוס סיסמה נשלח לכתובת המייל שלך',
        });
        setShowPasswordReset(false);
      }
    } catch (error) {
      console.error('Error sending password reset:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בשליחת מייל איפוס הסיסמה',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md hebrew-text" dir="rtl">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="mr-2">טוען פרופיל...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl hebrew-text max-h-[90vh]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            הפרופיל שלי
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center space-y-4">
              <UserAvatar
                avatarUrl={profile?.avatar_url}
                displayName={profile?.display_name}
                email={user?.email}
                size="lg"
                className="h-20 w-20"
              />
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Camera className="h-4 w-4 ml-1" />
                  {uploading ? 'מעלה...' : 'שנה תמונה'}
                </Button>
                
                {profile?.avatar_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={removeAvatar}
                    disabled={uploading}
                  >
                    <Trash2 className="h-4 w-4 ml-1" />
                    הסר תמונה
                  </Button>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <Separator />

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5" />
                פרטים אישיים
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">כתובת מייל</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{user?.email}</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="displayName">שם תצוגה</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    disabled={!isEditing}
                    placeholder="הכנס שם תצוגה"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="bio">אודות</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    disabled={!isEditing}
                    placeholder="ספר קצת על עצמך..."
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div className="flex gap-2">
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} variant="outline">
                      <User className="h-4 w-4 ml-1" />
                      ערוך פרטים
                    </Button>
                  ) : (
                    <>
                      <Button onClick={handleSave} disabled={saving}>
                        {saving ? (
                          <Loader2 className="h-4 w-4 ml-1 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 ml-1" />
                        )}
                        שמור
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          setDisplayName(profile?.display_name || '');
                          setBio(profile?.bio || '');
                        }}
                      >
                        ביטול
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* User Points */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                הנקודות שלי
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-[#1a305b]">
                    {points.total_points.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">סה"כ נקודות</div>
                </div>
                
                <div className="bg-muted/50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-[#1a305b]">
                    {points.votes_count.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">הצבעות</div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Future Badges Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Award className="h-5 w-5" />
                תגים והישגים
              </h3>
              
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>תגים והישגים יתווספו בקרוב!</p>
                <p className="text-sm">השתתף בסקרים כדי לזכות בתגים מיוחדים</p>
              </div>
            </div>

            <Separator />

            {/* Password Reset Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Key className="h-5 w-5" />
                אבטחה
              </h3>
              
              {!showPasswordReset ? (
                <Button
                  variant="outline"
                  onClick={() => setShowPasswordReset(true)}
                >
                  <Key className="h-4 w-4 ml-1" />
                  איפוס סיסמה
                </Button>
              ) : (
                <div className="space-y-3 p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    קישור לאיפוס סיסמה יישלח לכתובת המייל שלך
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={handlePasswordReset} size="sm">
                      שלח קישור
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPasswordReset(false)}
                    >
                      ביטול
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
