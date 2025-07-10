
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useReturnUrl } from '@/hooks/useReturnUrl';
import { UserPointsDisplay } from '@/components/UserPointsDisplay';
import { LogIn, LogOut, User } from 'lucide-react';

interface NavigationHeaderProps {
  currentPage: 'home' | 'voting' | 'results' | 'admin';
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({ currentPage }) => {
  const { user, signOut } = useAuth();
  const { createAuthUrl } = useReturnUrl();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-primary hebrew-text">
            נקודות חיבור
          </Link>
          
          <nav className="flex items-center space-x-4">
            <UserPointsDisplay />
            
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span className="hebrew-text">שלום, {user.email}</span>
                </div>
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
  );
};
