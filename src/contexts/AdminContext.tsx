
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useAdminRole, AdminRole } from '@/hooks/useAdminRole';
import { supabase } from '@/integrations/supabase/client';

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
    const createAdminProfileIfNeeded = async () => {
      if (user && adminRole) {
        // Ensure admin profile exists
        try {
          const { data: profile, error } = await supabase
            .from('polis_admin_profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error && error.code === 'PGRST116') {
            // Profile doesn't exist, create it
            const { error: insertError } = await supabase
              .from('polis_admin_profiles')
              .insert({
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || user.email || 'מנהל'
              });

            if (insertError) {
              console.error('Error creating admin profile:', insertError);
            }
          }
        } catch (err) {
          console.error('Error checking/creating admin profile:', err);
        }

        setAdmin({
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.full_name || user.email || 'מנהל',
          role: adminRole
        });
      } else {
        setAdmin(null);
      }
    };

    createAdminProfileIfNeeded();
  }, [user, adminRole]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        console.error('Admin login error:', error);
        return false;
      }

      // Wait a bit for the auth state to update and role check to complete
      await new Promise(resolve => setTimeout(resolve, 1500));
      
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
