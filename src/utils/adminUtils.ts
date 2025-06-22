
import { supabase } from '@/integrations/supabase/client';

export const assignAdminRole = async (userEmail: string) => {
  try {
    const { data, error } = await supabase.rpc('add_initial_super_admin', {
      admin_email: userEmail
    });

    if (error) {
      console.error('Error assigning admin role:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Error calling admin function:', err);
    return { success: false, error: 'Failed to assign admin role' };
  }
};

export const checkAdminRole = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('polis_admin_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (error) {
      return null;
    }

    return data?.role || null;
  } catch (err) {
    console.error('Error checking admin role:', err);
    return null;
  }
};
