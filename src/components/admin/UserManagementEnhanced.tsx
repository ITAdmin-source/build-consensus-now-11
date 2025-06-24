
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserCheck,
  Shield,
  Loader2
} from 'lucide-react';
import { useUserManagement } from './hooks/useUserManagement';
import { UserSearch } from './UserSearch';
import { UserSection } from './UserSection';
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
  const {
    users,
    loading,
    actionLoading,
    currentUser,
    userRole,
    loadUsers,
    handleRoleChange,
    handleResetPassword,
    handleDeleteUser,
    canDeleteUser,
    toast
  } = useUserManagement();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.full_name && user.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const superAdmins = filteredUsers.filter(user => user.role === 'super_admin');
  const pollAdmins = filteredUsers.filter(user => user.role === 'poll_admin');
  const participants = filteredUsers.filter(user => user.role === 'participant');

  const onDeleteUser = (user: User) => {
    if (canDeleteUser(user, superAdmins)) {
      setSelectedUser(user);
      setShowDeleteDialog(true);
    } else {
      toast({
        title: 'לא ניתן למחוק',
        description: 'חייב להישאר לפחות מנהל ראשי אחד במערכת',
        variant: 'destructive',
      });
    }
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

      <UserSearch 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <UserSection
        title="מנהלים ראשיים"
        icon={<Shield className="h-5 w-5 text-blue-500" />}
        users={superAdmins}
        currentUserRole={userRole || ''}
        currentUserId={currentUser?.id}
        onRoleChange={(user) => {
          setSelectedUser(user);
          setShowRoleDialog(true);
        }}
        onResetPassword={(user) => {
          setSelectedUser(user);
          setShowPasswordDialog(true);
        }}
        onDeleteUser={onDeleteUser}
        isLoading={actionLoading}
        showAll={true}
      />

      <UserSection
        title="מנהלי סקרים"
        icon={<UserCheck className="h-5 w-5 text-green-500" />}
        users={pollAdmins}
        currentUserRole={userRole || ''}
        currentUserId={currentUser?.id}
        onRoleChange={(user) => {
          setSelectedUser(user);
          setShowRoleDialog(true);
        }}
        onResetPassword={(user) => {
          setSelectedUser(user);
          setShowPasswordDialog(true);
        }}
        onDeleteUser={onDeleteUser}
        isLoading={actionLoading}
        showAll={true}
      />

      <UserSection
        title="משתתפים"
        icon={<Users className="h-5 w-5 text-gray-500" />}
        users={participants}
        currentUserRole={userRole || ''}
        currentUserId={currentUser?.id}
        onRoleChange={(user) => {
          setSelectedUser(user);
          setShowRoleDialog(true);
        }}
        onResetPassword={(user) => {
          setSelectedUser(user);
          setShowPasswordDialog(true);
        }}
        onDeleteUser={onDeleteUser}
        isLoading={actionLoading}
        maxDisplay={10}
      />

      <RoleChangeDialog
        open={showRoleDialog}
        onOpenChange={setShowRoleDialog}
        user={selectedUser}
        currentUserRole={userRole || ''}
        onRoleChange={handleRoleChange}
        isLoading={actionLoading === 'role-change'}
      />

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
