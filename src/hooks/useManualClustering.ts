
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useManualClustering = () => {
  const [isRunning, setIsRunning] = useState(false);

  const triggerClustering = async (pollId: string, forceRecalculate = false) => {
    if (isRunning) {
      toast.error('קיבוץ כבר רץ, אנא המתן');
      return;
    }

    setIsRunning(true);
    
    try {
      console.log(`Triggering clustering for poll ${pollId} (force: ${forceRecalculate})`);
      
      // Call the Edge Function directly
      const { data, error } = await supabase.functions.invoke('clustering-processor', {
        body: {
          poll_id: pollId,
          force_recalculate: forceRecalculate
        }
      });

      if (error) {
        console.error('Error triggering clustering:', error);
        toast.error('שגיאה בהפעלת הקיבוץ');
        return;
      }

      console.log('Clustering response:', data);
      
      if (data?.success) {
        toast.success(`הקיבוץ הופעל בהצלחה! נוצרו ${data.groups_created} קבוצות ונמצאו ${data.consensus_points_found} נקודות הסכמה`);
      } else {
        toast.error('שגיאה בעיבוד הקיבוץ');
      }
      
    } catch (error) {
      console.error('Error in manual clustering:', error);
      toast.error('שגיאה בהפעלת הקיבוץ');
    } finally {
      // Keep the loading state for a bit to give user feedback
      setTimeout(() => {
        setIsRunning(false);
      }, 2000);
    }
  };

  return {
    triggerClustering,
    isRunning
  };
};
