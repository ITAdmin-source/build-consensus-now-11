
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
      
      // Call the advanced clustering engine
      const { data, error } = await supabase.functions.invoke('clustering-engine', {
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
        const message = data.cached 
          ? 'נעשה שימוש בתוצאות קיימות של הקבצה'
          : `הקבצה הושלמה בהצלחה! נוצרו ${data.groups_created} קבוצות ונמצאו ${data.consensus_points_found} נקודות הסכמה`;
        toast.success(message);
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
