
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, LogOut, User } from 'lucide-react';

interface NavigationHeaderProps {
  currentPage: 'home' | 'voting' | 'results' | 'admin';
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({ currentPage }) => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-white shadow-sm border-b border-[#66c8ca]/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-[#1a305b] hebrew-text hover:text-[#ec0081] transition-colors">
            נקודות חיבור
          </Link>
          
          <nav className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-[#1a305b]/70">
                  <User className="h-4 w-4" />
                  <span className="hebrew-text">שלום, {user.email}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="hebrew-text border-[#ec0081] text-[#ec0081] hover:bg-[#ec0081] hover:text-white"
                >
                  <LogOut className="h-4 w-4 ml-1" />
                  התנתק
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm" className="hebrew-text border-[#ec0081] text-[#ec0081] hover:bg-[#ec0081] hover:text-white">
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
