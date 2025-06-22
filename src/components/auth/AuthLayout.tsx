
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, LogIn, UserPlus } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  isLogin: boolean;
  onToggleMode: () => void;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, isLogin, onToggleMode }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4 hebrew-text">
      <div className="w-full max-w-md space-y-6">
        {/* Back to Home Button */}
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="hebrew-text text-muted-foreground hover:text-primary"
          >
            <Home className="h-4 w-4 ml-1" />
            חזרה לדף הבית
          </Button>
        </div>

        {/* Auth Card */}
        <Card className="shadow-lg">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              {isLogin ? (
                <LogIn className="h-6 w-6 text-primary" />
              ) : (
                <UserPlus className="h-6 w-6 text-primary" />
              )}
            </div>
            <CardTitle className="text-2xl hebrew-text">
              {isLogin ? 'התחברות' : 'הרשמה'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {children}

            {/* Toggle between login and signup */}
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground hebrew-text">
                {isLogin ? 'אין לך חשבון?' : 'יש לך כבר חשבון?'}
              </p>
              <Button
                variant="link"
                onClick={onToggleMode}
                className="hebrew-text p-0 h-auto font-normal"
              >
                {isLogin ? 'הירשם כאן' : 'התחבר כאן'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthLayout;
