
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useReturnUrl } from '@/hooks/useReturnUrl';
import { useUserProfile } from '@/hooks/useUserProfile';
import { UserPointsDisplay } from '@/components/UserPointsDisplay';
import { UserAvatar } from '@/components/UserAvatar';
import { UserProfileDialog } from '@/components/UserProfileDialog';
import { UserPoints } from '@/integrations/supabase/userPoints';
import { LogIn, LogOut } from 'lucide-react';

interface NavigationHeaderProps {
  currentPage: 'home' | 'voting' | 'results' | 'admin';
  userPoints?: UserPoints;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({ currentPage, userPoints }) => {
  const { user, signOut } = useAuth();
  const { createAuthUrl } = useReturnUrl();
  const { profile } = useUserProfile();
  const [showProfileDialog, setShowProfileDialog] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-xl font-bold text-primary hebrew-text">
              נקודות חיבור
            </Link>
            
            <nav className="flex items-center space-x-4">
              <UserPointsDisplay userPoints={userPoints} />
              
              {user ? (
                <div className="flex items-center space-x-4">
                  <UserAvatar
                    avatarUrl={profile?.avatar_url}
                    displayName={profile?.display_name}
                    email={user.email}
                    onClick={() => setShowProfileDialog(true)}
                    className="cursor-pointer hover:ring-2 hover:ring-[#66c8ca] transition-all"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                    className="hebrew-text"
                  >
                    <LogOut className="h-4 w-4 ml-1" />
                    התנתק
                  </Button>
                </div>
              ) : (
                <Link to={createAuthUrl()}>
                  <Button variant="outline" size="sm" className="hebrew-text">
                    <LogIn className="h-4 w-4 ml-1" />
                    התחבר
                  </Button>
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {user && (
        <UserProfileDialog
          open={showProfileDialog}
          onOpenChange={setShowProfileDialog}
        />
      )}
    </>
  );
};
