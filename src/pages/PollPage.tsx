
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { VotingPage } from '@/components/VotingPage';
import { ResultsPage } from '@/components/ResultsPage';
import { submitVote } from '@/integrations/supabase/votes';
import { submitUserStatement } from '@/integrations/supabase/statements';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { getUnvotedStatements, getNextStatementToVote } from '@/utils/statementUtils';
import { useRealtimePollData } from '@/hooks/useRealtimePollData';

const PollPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<'voting' | 'results'>('voting');
  
  // Use the real-time hook instead of manual data loading
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

  // Computed values for filtered statements
  const unvotedStatements = getUnvotedStatements(statements, userVotes);
  const currentStatement = getNextStatementToVote(statements, userVotes);

  const handleVote = async (statementId: string, vote: string) => {
    try {
      await submitVote(statementId, vote as 'support' | 'oppose' | 'unsure');
      // Note: userVotes will be updated automatically via real-time subscription
      toast.success('ההצבעה נשמרה בהצלחה');
    } catch (error) {
      console.error('Error submitting vote:', error);
      toast.error('שגיאה בשמירת ההצבעה');
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg hebrew-text">טוען סקר...</p>
        </div>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
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
        currentStatement={currentStatement}
        unvotedStatements={unvotedStatements}
        totalStatements={statements.length}
        userVoteCount={Object.keys(userVotes).length}
        onVote={handleVote}
        onViewResults={handleViewResults}
        onBackToHome={handleBackToHome}
        onSubmitStatement={handleSubmitStatement}
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

  // Default to voting page
  return (
    <VotingPage
      poll={poll}
      currentStatement={currentStatement}
      unvotedStatements={unvotedStatements}
      totalStatements={statements.length}
      userVoteCount={Object.keys(userVotes).length}
      onVote={handleVote}
      onViewResults={handleViewResults}
      onBackToHome={handleBackToHome}
      onSubmitStatement={handleSubmitStatement}
    />
  );
};

export default PollPage;
