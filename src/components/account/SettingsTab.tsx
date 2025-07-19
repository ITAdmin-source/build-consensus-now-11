
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Mail, 
  Key, 
  LogOut, 
  Shield,
  Bell,
  Palette
} from 'lucide-react';

interface SettingsTabProps {
  user: any;
  profile: any;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ user, profile }) => {
  const { signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  const handlePasswordReset = async () => {
    if (!user?.email) return;

    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast.success('קישור לאיפוס סיסמה נשלח למייל');
      setShowPasswordReset(false);
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

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            הגדרות חשבון
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              כתובת מייל
            </Label>
            <Input value={user.email || ''} disabled className="bg-muted" />
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Key className="h-4 w-4" />
              אבטחה
            </h4>
            
            {!showPasswordReset ? (
              <Button
                variant="outline"
                onClick={() => setShowPasswordReset(true)}
                className="w-full"
              >
                איפוס סיסמה
              </Button>
            ) : (
              <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  קישור לאיפוס סיסמה יישלח לכתובת המייל שלך
                </p>
                <div className="flex gap-2">
                  <Button onClick={handlePasswordReset} disabled={isLoading} size="sm">
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

          <Separator />

          <Button 
            variant="destructive" 
            onClick={handleSignOut}
            className="w-full"
          >
            <LogOut className="h-4 w-4 ml-1" />
            התנתק
          </Button>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            העדפות
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="font-medium mb-2">העדפות יתווספו בקרוב</h3>
            <p className="text-sm">
              הגדרות התראות, עיצוב ושפה יהיו זמינות בקרוב.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
