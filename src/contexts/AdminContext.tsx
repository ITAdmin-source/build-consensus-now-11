
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useAdminRole, AdminRole } from '@/hooks/useAdminRole';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}

interface AdminContextType {
  admin: AdminUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  adminRole: AdminRole;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isPollAdmin: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, signIn, signOut, loading: authLoading } = useAuth();
  const { adminRole, isLoading: roleLoading, isAdmin, isSuperAdmin, isPollAdmin } = useAdminRole();
  const [admin, setAdmin] = useState<AdminUser | null>(null);

  useEffect(() => {
    if (user && adminRole) {
      setAdmin({
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.full_name || user.email || 'מנהל',
        role: adminRole
      });
    } else {
      setAdmin(null);
    }
  }, [user, adminRole]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        console.error('Admin login error:', error);
        return false;
      }

      // Wait a bit for the auth state to update and role check to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // The useAdminRole hook will automatically check the user's role
      return true;
    } catch (error) {
      console.error('Admin login error:', error);
      return false;
    }
  };

  const logout = async () => {
    await signOut();
    setAdmin(null);
  };

  const isLoading = authLoading || roleLoading;

  return (
    <AdminContext.Provider value={{
      admin,
      login,
      logout,
      isLoading,
      adminRole,
      isAdmin,
      isSuperAdmin,
      isPollAdmin
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
