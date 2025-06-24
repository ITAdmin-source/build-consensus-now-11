
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdminHeaderProps {
  userName: string;
  userRole: string;
  onSignOut: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ userName, userRole, onSignOut }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    onSignOut();
    toast({
      title: 'התנתקת בהצלחה',
      description: 'להתראות!',
    });
    navigate('/');
  };

  return (
    <div className="bg-slate-800 text-white border-b shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-white hover:bg-slate-700"
            >
              <Home className="h-4 w-4 ml-1" />
              נקודות חיבור
            </Button>
            <Badge variant="secondary" className="bg-slate-600 text-white">
              מערכת ניהול
            </Badge>
            <Badge variant="outline" className="text-white border-white">
              {userRole === 'super_admin' ? 'מנהל ראשי' : 'מנהל סקרים'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm">שלום, {userName}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-white hover:bg-slate-700"
            >
              <LogOut className="h-4 w-4 ml-1" />
              התנתק
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
