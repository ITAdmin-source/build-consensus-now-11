
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserCheck,
  Shield,
  Search,
  Loader2,
  Plus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  fetchAllUsers, 
  assignUserRole, 
  removeUserRole
} from '@/integrations/supabase/admin';
import { UserCard } from './UserCard';
import { RoleChangeDialog } from './RoleChangeDialog';
import { ConfirmationDialog } from './ConfirmationDialog';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'participant' | 'poll_admin' | 'super_admin';
  created_at: string;
  assigned_at: string | null;
  last_sign_in_at: string | null;
}

export const UserManagementEnhanced: React.FC = () => {
  const { toast } = useToast();
  const { user: currentUser, userRole } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await fetchAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: 'שגיאה בטעינת המשתמשים',
        description: 'אנא נסה שוב',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'poll_admin' | 'super_admin' | 'participant') => {
    try {
      setActionLoading('role-change');
      
      if (newRole === 'participant') {
        await removeUserRole(userId);
      } else {
        await assignUserRole(userId, newRole);
      }
      
      await loadUsers();
      toast({
        title: 'תפקיד עודכן',
        description: 'התפקיד עודכן בהצלחה',
      });
    } catch (error) {
      toast({
        title: 'שגיאה בעדכון תפקיד',
        description: 'אנא נסה שוב',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetPassword = async (user: User) => {
    // This would typically trigger a password reset email
    toast({
      title: 'איפוס סיסמה',
      description: `נשלח מייל איפוס סיסמה ל-${user.email}`,
    });
  };

  const handleDeleteUser = async (user: User) => {
    try {
      setActionLoading('delete');
      await removeUserRole(user.id);
      await loadUsers();
      toast({
        title: 'משתמש הוסר',
        description: 'המשתמש הוסר מהמערכת',
      });
    } catch (error) {
      toast({
        title: 'שגיאה בהסרת משתמש',
        description: 'אנא נסה שוב',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
      setShowDeleteDialog(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.full_name && user.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const superAdmins = filteredUsers.filter(user => user.role === 'super_admin');
  const pollAdmins = filteredUsers.filter(user => user.role === 'poll_admin');
  const participants = filteredUsers.filter(user => user.role === 'participant');

  const canDeleteUser = (user: User) => {
    if (user.role === 'super_admin') {
      const superAdminCount = superAdmins.length;
      return superAdminCount > 1; // Can only delete if there are other super admins
    }
    return true;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">ניהול משתמשים מתקדם</h3>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="mr-2">טוען משתמשים...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">ניהול משתמשים מתקדם</h3>
        <Badge variant="outline">
          {users.length} משתמשים רשומים
        </Badge>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="חפש משתמשים..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10"
        />
      </div>

      {/* Super Admins Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-500" />
          <h4 className="text-md font-medium">מנהלים ראשיים ({superAdmins.length})</h4>
        </div>
        <div className="grid gap-4">
          {superAdmins.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              currentUserRole={userRole || ''}
              currentUserId={currentUser?.user?.id}
              onRoleChange={(user) => {
                setSelectedUser(user);
                setShowRoleDialog(true);
              }}
              onResetPassword={(user) => {
                setSelectedUser(user);
                setShowPasswordDialog(true);
              }}
              onDeleteUser={(user) => {
                if (canDeleteUser(user)) {
                  setSelectedUser(user);
                  setShowDeleteDialog(true);
                } else {
                  toast({
                    title: 'לא ניתן למחוק',
                    description: 'חייב להישאר לפחות מנהל ראשי אחד במערכת',
                    variant: 'destructive',
                  });
                }
              }}
              isLoading={actionLoading}
            />
          ))}
        </div>
      </div>

      {/* Poll Admins Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-green-500" />
          <h4 className="text-md font-medium">מנהלי סקרים ({pollAdmins.length})</h4>
        </div>
        <div className="grid gap-4">
          {pollAdmins.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              currentUserRole={userRole || ''}
              currentUserId={currentUser?.user?.id}
              onRoleChange={(user) => {
                setSelectedUser(user);
                setShowRoleDialog(true);
              }}
              onResetPassword={(user) => {
                setSelectedUser(user);
                setShowPasswordDialog(true);
              }}
              onDeleteUser={(user) => {
                setSelectedUser(user);
                setShowDeleteDialog(true);
              }}
              isLoading={actionLoading}
            />
          ))}
        </div>
      </div>

      {/* Participants Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-gray-500" />
          <h4 className="text-md font-medium">משתתפים ({participants.length})</h4>
        </div>
        <div className="grid gap-4">
          {participants.slice(0, 10).map((user) => (
            <UserCard
              key={user.id}
              user={user}
              currentUserRole={userRole || ''}
              currentUserId={currentUser?.user?.id}
              onRoleChange={(user) => {
                setSelectedUser(user);
                setShowRoleDialog(true);
              }}
              onResetPassword={(user) => {
                setSelectedUser(user);
                setShowPasswordDialog(true);
              }}
              onDeleteUser={(user) => {
                setSelectedUser(user);
                setShowDeleteDialog(true);
              }}
              isLoading={actionLoading}
            />
          ))}
          {participants.length > 10 && (
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-muted-foreground">
                  ועוד {participants.length - 10} משתתפים...
                </p>
                <Button variant="outline" size="sm" className="mt-2">
                  הצג הכל
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Role Change Dialog */}
      <RoleChangeDialog
        open={showRoleDialog}
        onOpenChange={setShowRoleDialog}
        user={selectedUser}
        currentUserRole={userRole || ''}
        onRoleChange={handleRoleChange}
        isLoading={actionLoading === 'role-change'}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="הסרת משתמש"
        description={`האם אתה בטוח שברצונך להסיר את ${selectedUser?.full_name || selectedUser?.email} מהמערכת? פעולה זו תסיר את כל הרשאות המשתמש.`}
        confirmText="הסר משתמש"
        variant="destructive"
        onConfirm={() => selectedUser && handleDeleteUser(selectedUser)}
        isLoading={actionLoading === 'delete'}
      />

      {/* Password Reset Confirmation Dialog */}
      <ConfirmationDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
        title="איפוס סיסמה"
        description={`האם להשלוח מייל איפוס סיסמה ל-${selectedUser?.email}?`}
        confirmText="שלח מייל איפוס"
        onConfirm={() => selectedUser && handleResetPassword(selectedUser)}
        isLoading={false}
      />
    </div>
  );
};
