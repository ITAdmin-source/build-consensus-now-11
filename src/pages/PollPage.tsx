import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { VotingPage } from '@/components/VotingPage';
import { ResultsPage } from '@/components/ResultsPage';
import { submitVote } from '@/integrations/supabase/votes';
import { submitUserStatement } from '@/integrations/supabase/statements';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { StatementManager } from '@/utils/optimizedStatementUtils';
import { useRealtimePollData } from '@/hooks/useRealtimePollData';

const PollPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<'voting' | 'results'>('voting');
  const [isVoting, setIsVoting] = useState(false);
  
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

  // Memoized statement manager for optimized performance
  const statementManager = useMemo(() => {
    if (statements.length === 0) return null;
    return new StatementManager(statements, userVotes);
  }, [statements, userVotes]);

  const currentTransition = statementManager?.getCurrentTransition() || {
    current: null,
    next: null,
    hasMore: false
  };

  const handleVote = async (statementId: string, vote: string) => {
    setIsVoting(true);
    
    try {
      await submitVote(statementId, vote as 'support' | 'oppose' | 'unsure');
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

  if (currentView === 'voting') {
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
  }

  if (currentView === 'results') {
    return (
      <ResultsPage
        poll={poll}
        statements={statements}
        consensusPoints={consensusPoints}
        groups={groups}
        groupStats={groupStats}
        onBackToHome={handleBackToHome}
        onNavigateToVoting={statements.length > 0 ? handleNavigateToVoting : undefined}
        isLive={isLive}
      />
    );
  }

  // Default fallback
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
