import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('polis_user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create one
          const newProfile = {
            user_id: user.id,
            display_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'משתמש',
          };

          const { data: createdProfile, error: createError } = await supabase
            .from('polis_user_profiles')
            .insert(newProfile)
            .select()
            .single();

          if (createError) {
            console.error('Error creating profile:', createError);
            return;
          }

          setProfile(createdProfile);
        } else {
          console.error('Error fetching profile:', error);
        }
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateProfile = async (updates: Partial<Pick<UserProfile, 'display_name' | 'bio'>>) => {
    if (!user || !profile) return { error: 'No user or profile found' };

    try {
      const { data, error } = await supabase
        .from('polis_user_profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        return { error: error.message };
      }

      setProfile(data);
      toast({
        title: 'פרופיל עודכן',
        description: 'הפרטים שלך נשמרו בהצלחה',
      });

      return { data };
    } catch (error) {
      console.error('Error in updateProfile:', error);
      return { error: 'שגיאה בעדכון הפרופיל' };
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return { error: 'No user found' };

    try {
      setUploading(true);

      // Create file path with user ID
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Delete existing avatar if exists
      if (profile?.avatar_url) {
        const oldPath = profile.avatar_url.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('user-avatars')
            .remove([`${user.id}/${oldPath}`]);
        }
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('user-avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        console.error('Error uploading avatar:', uploadError);
        return { error: uploadError.message };
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user-avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('polis_user_profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating avatar URL:', updateError);
        return { error: updateError.message };
      }

      // Update local state
      if (profile) {
        setProfile({ ...profile, avatar_url: publicUrl });
      }

      toast({
        title: 'תמונת פרופיל עודכנה',
        description: 'התמונה שלך נשמרה בהצלחה',
      });

      return { data: publicUrl };
    } catch (error) {
      console.error('Error in uploadAvatar:', error);
      return { error: 'שגיאה בהעלאת התמונה' };
    } finally {
      setUploading(false);
    }
  };

  const removeAvatar = async () => {
    if (!user || !profile?.avatar_url) return { error: 'No avatar to remove' };

    try {
      setUploading(true);

      // Remove from storage
      const fileName = profile.avatar_url.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('user-avatars')
          .remove([`${user.id}/${fileName}`]);
      }

      // Update profile
      const { error } = await supabase
        .from('polis_user_profiles')
        .update({ avatar_url: null })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error removing avatar:', error);
        return { error: error.message };
      }

      setProfile({ ...profile, avatar_url: null });

      toast({
        title: 'תמונת פרופיל הוסרה',
        description: 'התמונה נמחקה בהצלחה',
      });

      return { success: true };
    } catch (error) {
      console.error('Error in removeAvatar:', error);
      return { error: 'שגיאה בהסרת התמונה' };
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    uploading,
    updateProfile,
    uploadAvatar,
    removeAvatar,
    refetch: fetchProfile,
  };
};
