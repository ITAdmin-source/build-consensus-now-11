import { useState, useEffect } from 'react';
import { getUserVotesWithStatements, UserVoteWithStatement } from '@/integrations/supabase/votes';

export const useUserVotesWithStatements = (pollId: string | null) => {
  const [votes, setVotes] = useState<UserVoteWithStatement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pollId) {
      setVotes([]);
      return;
    }

    const fetchVotes = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getUserVotesWithStatements(pollId);
        setVotes(data);
      } catch (err) {
        console.error('Error fetching user votes with statements:', err);
        setError('שגיאה בטעינת ההצבעות');
      } finally {
        setLoading(false);
      }
    };

    fetchVotes();
  }, [pollId]);

  return { votes, loading, error };
};