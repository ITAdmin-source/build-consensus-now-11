
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type AdminRole = 'super_admin' | 'poll_admin' | null;

export const useAdminRole = () => {
  const { user, session } = useAuth();
  const [adminRole, setAdminRole] = useState<AdminRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user || !session) {
        setAdminRole(null);
        setIsLoading(false);
        return;
      }

      try {
        // Use the new security definer function approach
        const { data, error } = await supabase
          .from('polis_admin_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // No rows returned - user has no admin role
            console.log('No admin role found for user');
            setAdminRole(null);
          } else {
            console.error('Error checking admin role:', error);
            setAdminRole(null);
          }
        } else {
          setAdminRole(data?.role as AdminRole);
          console.log('Admin role found:', data?.role);
        }
      } catch (err) {
        console.error('Error checking admin role:', err);
        setAdminRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminRole();
  }, [user, session]);

  const hasRole = (role: AdminRole) => {
    if (!adminRole) return false;
    if (role === 'super_admin') return adminRole === 'super_admin';
    if (role === 'poll_admin') return adminRole === 'super_admin' || adminRole === 'poll_admin';
    return false;
  };

  const isAdmin = adminRole !== null;
  const isSuperAdmin = adminRole === 'super_admin';
  const isPollAdmin = adminRole === 'poll_admin' || adminRole === 'super_admin';

  return {
    adminRole,
    isLoading,
    isAdmin,
    isSuperAdmin,
    isPollAdmin,
    hasRole
  };
};
