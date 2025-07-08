import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { VotingPage } from '@/components/VotingPage';
import { ResultsPage } from '@/components/ResultsPage';
import { submitVote } from '@/integrations/supabase/votes';
import { submitUserStatement } from '@/integrations/supabase/statements';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { StatementManager, StatementTransition } from '@/utils/optimizedStatementUtils';
import { useRealtimePollData } from '@/hooks/useRealtimePollData';
import { getPollStatus, isPollCompleted } from '@/utils/pollStatusUtils';

const PollPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<'voting' | 'results'>('voting');
  const [isVoting, setIsVoting] = useState(false);
  const [currentTransition, setCurrentTransition] = useState<StatementTransition>({
    current: null,
    next: null,
    hasMore: false
  });
  
  // Use the real-time hook
  const {
    poll,
    statements,
    consensusPoints,
    groups,
    groupStats,
    userVotes,
    loading,
    error,
    isLive
  } = useRealtimePollData({ slug: slug || '' });

  // Check if poll is completed using new utility
  const pollCompleted = useMemo(() => {
    if (!poll) return false;
    return isPollCompleted(poll);
  }, [poll]);

  // Force results view for completed polls
  useEffect(() => {
    if (pollCompleted && currentView === 'voting') {
      setCurrentView('results');
    }
  }, [pollCompleted, currentView]);

  // Enhanced statement manager with routing capabilities
  const statementManager = useMemo(() => {
    if (statements.length === 0) return null;
    
    // Get participant ID (session ID or user ID)
    const participantId = user?.id || sessionStorage.getItem('session_id') || 'anonymous';
    
    const manager = new StatementManager(
      statements, 
      userVotes, 
      poll?.poll_id,
      participantId
    );
    
    // Enable routing based on system settings (could be configured per poll)
    // For now, we'll enable it by default for testing
    manager.setRoutingEnabled(true);
    
    return manager;
  }, [statements, userVotes, poll?.poll_id, user?.id]);

  // Update current transition when statement manager changes
  useEffect(() => {
    if (statementManager && !pollCompleted) {
      const updateTransition = async () => {
        try {
          const transition = await statementManager.getCurrentTransition();
          setCurrentTransition(transition);
        } catch (error) {
          console.error('Failed to get weighted statement, using fallback:', error);
          // Fallback to simple transition
          const fallbackTransition = statementManager.getCurrentTransition();
          if (fallbackTransition instanceof Promise) {
            fallbackTransition.then(setCurrentTransition);
          } else {
            setCurrentTransition(fallbackTransition);
          }
        }
      };
      
      updateTransition();
    }
  }, [statementManager, pollCompleted]);

  const handleVote = async (statementId: string, vote: string) => {
    if (pollCompleted) {
      toast.error('הסקר הסתיים - לא ניתן להצביע יותר');
      return;
    }

    setIsVoting(true);
    
    try {
      await submitVote(statementId, vote as 'support' | 'oppose' | 'unsure');
      
      // Update statement manager optimistically
      if (statementManager) {
        const nextTransition = statementManager.moveToNext(statementId, vote);
        
        // For weighted routing, we need to fetch the next statement
        if (nextTransition.current === null && nextTransition.hasMore) {
          const freshTransition = await statementManager.getCurrentTransition();
          setCurrentTransition(freshTransition);
        } else {
          setCurrentTransition(nextTransition);
        }
      }
      
      toast.success('ההצבעה נשמרה בהצלחה');
    } catch (error) {
      console.error('Error submitting vote:', error);
      toast.error('שגיאה בשמירת ההצבעה');
    } finally {
      // Add a small delay for smooth transition
      setTimeout(() => {
        setIsVoting(false);
      }, 300);
    }
  };

  const handleSubmitStatement = async (content: string, contentType: string) => {
    if (pollCompleted) {
      toast.error('הסקר הסתיים - לא ניתן להוסיף הצהרות חדשות');
      return;
    }

    if (!user) {
      toast.error('יש להתחבר כדי להוסיף הצהרה');
      return;
    }

    if (!poll) return;

    try {
      await submitUserStatement(poll.poll_id, content, contentType);
      toast.success('ההצהרה נשלחה לאישור מנהל');
    } catch (error) {
      console.error('Error submitting statement:', error);
      toast.error('שגיאה בשליחת ההצהרה');
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleViewResults = () => {
    setCurrentView('results');
  };

  const handleNavigateToVoting = () => {
    if (pollCompleted) {
      toast.info('הסקר הסתיים - ניתן לראות רק תוצאות');
      return;
    }
    setCurrentView('voting');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg hebrew-text">טוען סקר...</p>
        </div>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <h1 className="text-2xl font-bold text-red-600 mb-4 hebrew-text">
            {error || 'סקר לא נמצא'}
          </h1>
          <button 
            onClick={handleBackToHome}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors hebrew-text"
          >
            חזור לעמוד הבית
          </button>
        </div>
      </div>
    );
  }

  // Force results view for completed polls
  if (pollCompleted || currentView === 'results') {
    return (
      <ResultsPage
        poll={poll}
        statements={statements}
        consensusPoints={consensusPoints}
        groups={groups}
        groupStats={groupStats}
        onBackToHome={handleBackToHome}
        onNavigateToVoting={!pollCompleted && statements.length > 0 ? handleNavigateToVoting : undefined}
        isLive={!pollCompleted && isLive}
        isPollCompleted={pollCompleted}
      />
    );
  }

  return (
    <VotingPage
      poll={poll}
      currentStatement={currentTransition.current}
      unvotedStatements={statements.filter(s => !userVotes[s.statement_id])}
      totalStatements={statements.length}
      userVoteCount={Object.keys(userVotes).length}
      onVote={handleVote}
      onViewResults={handleViewResults}
      onBackToHome={handleBackToHome}
      onSubmitStatement={handleSubmitStatement}
      isVoting={isVoting}
    />
  );
};

export default PollPage;
