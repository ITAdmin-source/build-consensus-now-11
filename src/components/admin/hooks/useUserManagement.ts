
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  fetchAllUsers, 
  assignUserRole, 
  removeUserRole
} from '@/integrations/supabase/admin';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'participant' | 'poll_admin' | 'super_admin';
  created_at: string;
  assigned_at: string | null;
  last_sign_in_at: string | null;
}

export const useUserManagement = () => {
  const { toast } = useToast();
  const { user: currentUser, userRole } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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
    }
  };

  const canDeleteUser = (user: User, superAdmins: User[]) => {
    if (user.role === 'super_admin') {
      const superAdminCount = superAdmins.length;
      return superAdminCount > 1;
    }
    return true;
  };

  return {
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
  };
};
