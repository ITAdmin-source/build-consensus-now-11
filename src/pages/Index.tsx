
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HomePage } from '@/components/HomePage';
import { Poll } from '@/types/poll';
import { fetchAllPolls } from '@/integrations/supabase/polls';
import { toast } from 'sonner';

const Index = () => {
  const navigate = useNavigate();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);

  // Load all polls (not just active ones)
  useEffect(() => {
    loadAllPolls();
  }, []);

  const loadAllPolls = async () => {
    try {
      setLoading(true);
      const pollsData = await fetchAllPolls();
      setPolls(pollsData);
    } catch (error) {
      console.error('Error loading polls:', error);
      toast.error('שגיאה בטעינת הסקרים');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinPoll = (pollSlugOrId: string) => {
    // Navigate using slug if available, otherwise use poll ID
    navigate(`/poll/${pollSlugOrId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg hebrew-text">טוען סקרים...</p>
        </div>
      </div>
    );
  }

  return (
    <HomePage
      polls={polls}
      onJoinPoll={handleJoinPoll}
    />
  );
};

export default Index;
