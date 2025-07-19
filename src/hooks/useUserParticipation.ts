import { useState, useEffect } from 'react';
import { getUserPollParticipation, UserPollParticipation } from '@/integrations/supabase/userParticipation';
import { useAuth } from '@/contexts/AuthContext';

export const useUserParticipation = () => {
  const [participation, setParticipation] = useState<UserPollParticipation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchParticipation = async () => {
      if (!user) {
        setParticipation([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getUserPollParticipation();
        setParticipation(data);
      } catch (err) {
        console.error('Error fetching user participation:', err);
        setError('שגיאה בטעינת נתוני ההשתתפות');
        setParticipation([]);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipation();
  }, [user]);

  return { participation, loading, error };
};