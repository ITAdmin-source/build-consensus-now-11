
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useMigrationManager, MigrationResult } from '@/hooks/useMigrationManager';

type UserRole = 'participant' | 'poll_admin' | 'super_admin';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: UserRole | null;
  isAuthenticated: boolean;
  isAdmin: boolean; // poll_admin or super_admin
  isSuperAdmin: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any; migrationResult?: MigrationResult }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshUserRole: () => Promise<void>;
  getMigrationPreview: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  userRole: null,
  isAuthenticated: false,
  isAdmin: false,
  isSuperAdmin: false,
  signUp: async () => ({ error: null }),
  signIn: async () => ({ error: null }),
  signOut: async () => {},
  refreshUserRole: async () => {},
  getMigrationPreview: async () => null
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const { getMigrationPreview: getPreview, migrateGuestData } = useMigrationManager();

  const fetchUserRole = async (userId: string): Promise<UserRole> => {
    try {
      console.log('Fetching role for user:', userId);
      
      // Query the polis_user_roles table directly
      const { data, error } = await supabase
        .from('polis_user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user role:', error);
        // If no role found, default to participant
        if (error.code === 'PGRST116') {
          console.log('No role found, defaulting to participant');
          return 'participant';
        }
        return 'participant';
      }
      
      console.log('Fetched role:', data?.role);
      return data?.role || 'participant';
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
      return 'participant';
    }
  };

  const refreshUserRole = async () => {
    if (user) {
      try {
        const role = await fetchUserRole(user.id);
        setUserRole(role);
      } catch (error) {
        console.error('Error refreshing user role:', error);
        setUserRole('participant');
      }
    } else {
      setUserRole(null);
    }
  };

  useEffect(() => {
    console.log('Setting up auth state listener');
    
    // Set up auth state listener - NEVER use async function here
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Use setTimeout to defer async operations and prevent infinite loops
        if (session?.user) {
          setTimeout(async () => {
            try {
              const role = await fetchUserRole(session.user.id);
              setUserRole(role);
            } catch (error) {
              console.error('Error fetching role in auth state change:', error);
              setUserRole('participant');
            } finally {
              setLoading(false);
            }
          }, 0);
        } else {
          setUserRole(null);
          setLoading(false);
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('Initial session:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        try {
          const role = await fetchUserRole(session.user.id);
          setUserRole(role);
        } catch (error) {
          console.error('Error fetching role in initial session:', error);
          setUserRole('participant');
        }
      }
      
      setLoading(false);
    }).catch((error) => {
      console.error('Error getting initial session:', error);
      setLoading(false);
    });

    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const getMigrationPreview = async () => {
    return await getPreview();
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    console.log('Attempting signup for:', email, 'with name:', fullName);
    
    // Use the current origin for redirect URL
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName
        }
      }
    });
    
    console.log('Signup response:', { data, error });
    
    // If signup successful and user created, migrate guest data
    let migrationResult;
    if (!error && data.user) {
      try {
        migrationResult = await migrateGuestData(data.user.id);
        console.log('Migration completed:', migrationResult);
      } catch (migrationError) {
        console.error('Migration failed during signup:', migrationError);
      }
    }
    
    return { error, migrationResult };
  };

  const signIn = async (email: string, password: string) => {
    console.log('Attempting signin for:', email);
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      console.log('Signin response:', { data, error });
      
      // Loading will be set to false by the auth state change handler
      return { error };
    } catch (error) {
      console.error('Error in signIn:', error);
      setLoading(false);
      return { error };
    }
  };

  const signOut = async () => {
    console.log('Signing out user');
    setLoading(true);
    
    try {
      await supabase.auth.signOut();
      setUserRole(null);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = userRole === 'poll_admin' || userRole === 'super_admin';
  const isSuperAdmin = userRole === 'super_admin';

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      userRole,
      isAuthenticated,
      isAdmin,
      isSuperAdmin,
      signUp,
      signIn,
      signOut,
      refreshUserRole,
      getMigrationPreview
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context;
};
