
import { supabase } from "./client";

export interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type: string;
  description?: string;
}

export const getSystemSetting = async (key: string): Promise<string | null> => {
  const { data, error } = await supabase
    .from('polis_system_settings')
    .select('setting_value')
    .eq('setting_key', key)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No rows found
      return null;
    }
    throw new Error(`Failed to get system setting: ${error.message}`);
  }

  return data?.setting_value || null;
};

export const updateSystemSetting = async (key: string, value: string): Promise<void> => {
  const { error } = await supabase
    .from('polis_system_settings')
    .update({ setting_value: value })
    .eq('setting_key', key);
  
  if (error) {
    throw new Error(`Failed to update system setting: ${error.message}`);
  }
};

export const getAllSystemSettings = async (): Promise<SystemSetting[]> => {
  const { data, error } = await supabase
    .from('polis_system_settings')
    .select('*')
    .order('setting_key');
  
  if (error) {
    throw new Error(`Failed to get system settings: ${error.message}`);
  }

  return data || [];
};
