
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Shield, User, UserCheck, AlertTriangle, Loader2 } from 'lucide-react';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'participant' | 'poll_admin' | 'super_admin';
}

interface RoleChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  currentUserRole: string;
  onRoleChange: (userId: string, newRole: 'poll_admin' | 'super_admin' | 'participant') => Promise<void>;
  isLoading: boolean;
}

const roleOptions = [
  { value: 'participant', label: 'משתתף', icon: User, description: 'יכול להצביע בסקרים' },
  { value: 'poll_admin', label: 'מנהל סקרים', icon: UserCheck, description: 'יכול לנהל סקרים ולאשר הצהרות' },
  { value: 'super_admin', label: 'מנהל ראשי', icon: Shield, description: 'גישה מלאה לכל המערכת' }
];

export const RoleChangeDialog: React.FC<RoleChangeDialogProps> = ({
  open,
  onOpenChange,
  user,
  currentUserRole,
  onRoleChange,
  isLoading
}) => {
  const [selectedRole, setSelectedRole] = useState<'participant' | 'poll_admin' | 'super_admin'>('participant');

  React.useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
    }
  }, [user]);

  if (!user) return null;

  const handleConfirm = async () => {
    if (selectedRole !== user.role) {
      await onRoleChange(user.id, selectedRole);
    }
    onOpenChange(false);
  };

  const isCurrentRole = selectedRole === user.role;
  const isSelfDemotion = user.role === 'super_admin' && selectedRole !== 'super_admin' && currentUserRole === 'super_admin';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>שינוי תפקיד משתמש</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium">{user.full_name || user.email}</h4>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <Badge variant="outline" className="mt-1">
                תפקיד נוכחי: {roleOptions.find(r => r.value === user.role)?.label}
              </Badge>
            </div>
          </div>

          <div className="space-y-3">
            <Label>בחר תפקיד חדש:</Label>
            {roleOptions.map((role) => {
              const Icon = role.icon;
              return (
                <div
                  key={role.value}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedRole === role.value 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedRole(role.value as any)}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    <div>
                      <div className="font-medium">{role.label}</div>
                      <div className="text-sm text-muted-foreground">{role.description}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {isSelfDemotion && (
            <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-orange-700">אזהרה!</p>
                <p className="text-orange-600">
                  אתה עומד להסיר את הרשאות המנהל הראשי שלך. וודא שיש מנהל ראשי אחר במערכת.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            ביטול
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={isCurrentRole || isLoading}
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin ml-1" />}
            שמור שינויים
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
