import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getOrCreateSessionId } from '@/utils/sessionUtils';
import { toast } from 'sonner';

export interface MigrationPreview {
  points: number;
  votes: number;
  polls: number;
  groups: number;
  hasData: boolean;
}

export interface MigrationResult {
  success: boolean;
  audit_id?: string;
  points_migrated: number;
  votes_migrated: number;
  groups_migrated: number;
  total_points: number;
  error?: string;
}

export const useMigrationManager = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [migrationPreview, setMigrationPreview] = useState<MigrationPreview | null>(null);
  const [lastMigrationResult, setLastMigrationResult] = useState<MigrationResult | null>(null);

  const getMigrationPreview = useCallback(async (): Promise<MigrationPreview | null> => {
    try {
      const sessionId = getOrCreateSessionId();
      
      const { data, error } = await supabase.rpc('get_migration_preview', {
        p_session_id: sessionId
      });

      if (error) {
        console.error('Error getting migration preview:', error);
        return null;
      }

      const preview = data as unknown as MigrationPreview;
      setMigrationPreview(preview);
      return preview;
    } catch (error) {
      console.error('Error in getMigrationPreview:', error);
      return null;
    }
  }, []);

  const migrateGuestData = useCallback(async (userId: string): Promise<MigrationResult> => {
    setIsLoading(true);
    
    try {
      const sessionId = getOrCreateSessionId();
      
      const { data, error } = await supabase.functions.invoke('migrate-guest-data', {
        body: {
          session_id: sessionId,
          user_id: userId
        }
      });

      if (error) {
        throw error;
      }

      const result = data as MigrationResult;
      setLastMigrationResult(result);

      if (result.success) {
        toast.success(`נתונים הועברו בהצלחה! ${result.points_migrated} נקודות ו-${result.votes_migrated} קולות נשמרו`, {
          duration: 5000
        });
      } else {
        toast.error('שגיאה בהעברת הנתונים: ' + result.error);
      }

      return result;
    } catch (error) {
      console.error('Migration failed:', error);
      const errorResult: MigrationResult = {
        success: false,
        points_migrated: 0,
        votes_migrated: 0,
        groups_migrated: 0,
        total_points: 0,
        error: error.message || 'Unknown error occurred'
      };
      
      setLastMigrationResult(errorResult);
      toast.error('שגיאה בהעברת הנתונים');
      return errorResult;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearMigrationData = useCallback(() => {
    setMigrationPreview(null);
    setLastMigrationResult(null);
  }, []);

  return {
    isLoading,
    migrationPreview,
    lastMigrationResult,
    getMigrationPreview,
    migrateGuestData,
    clearMigrationData
  };
};