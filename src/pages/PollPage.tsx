
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { VotingPage } from '@/components/VotingPage';
import { SimplifiedResultsPage } from '@/components/SimplifiedResultsPage';
import { PersonalInsightsPage } from '@/components/PersonalInsightsPage';
import { MotivationPage } from '@/components/MotivationPage';
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
  const [currentView, setCurrentView] = useState<'voting' | 'insights' | 'motivation' | 'results'>('voting');
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
    userPoints,
    loading,
    error,
    isLive
  } = useRealtimePollData({ slug: slug || '' });

  // Check if poll is completed using new utility
  const pollCompleted = useMemo(() => {
    if (!poll) return false;
    return isPollCompleted(poll);
  }, [poll]);

  // Use simple participant count from poll data (updated in real-time)
  const participantCount = useMemo(() => {
    // Primary: Use poll's total_participants (updated in real-time when users vote)
    if (poll?.total_participants) {
      return poll.total_participants;
    }
    
    // Fallback 1: Calculate from groups data if available (after clustering)
    if (groups && groups.length > 0) {
      return groups.reduce((sum, group) => sum + (group.member_count || 0), 0);
    }
    
    // Fallback 2: Minimum of 1 if poll exists but no data yet
    return poll ? 1 : 0;
  }, [poll?.total_participants, groups]);

  // Force results view for completed polls
  useEffect(() => {
    if (pollCompleted && (currentView === 'voting' || currentView === 'insights' || currentView === 'motivation')) {
      setCurrentView('results');
    }
  }, [pollCompleted, currentView]);

  // Automatic completion trigger - navigate to insights when voting is complete
  useEffect(() => {
    if (!pollCompleted && currentView === 'voting' && statements.length > 0) {
      const userVoteCount = Object.keys(userVotes).length;
      const totalStatements = statements.length;
      
      if (userVoteCount >= totalStatements) {
        setCurrentView('insights');
      }
    }
  }, [userVotes, statements, currentView, pollCompleted]);

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

  const handleNavigateToInsights = () => {
    setCurrentView('insights');
  };

  const handleNavigateToMotivation = () => {
    setCurrentView('motivation');
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

  // Handle different views based on current state
  if (currentView === 'insights') {
    const totalStatementsCount = statements.length;
    const userVoteCount = Object.keys(userVotes).length;
    const isFullCompletion = userVoteCount >= totalStatementsCount;
    
    return (
      <PersonalInsightsPage
        poll={poll}
        isFullCompletion={isFullCompletion}
        onNavigateToMotivation={handleNavigateToMotivation}
        onNavigateToHome={handleBackToHome}
      />
    );
  }

  if (currentView === 'motivation') {
    return (
      <MotivationPage
        poll={poll}
        onNavigateToResults={handleViewResults}
        onNavigateToHome={handleBackToHome}
      />
    );
  }

  if (pollCompleted || currentView === 'results') {
    return (
      <SimplifiedResultsPage
        poll={poll}
        statements={statements}
        consensusPoints={consensusPoints}
        groups={groups}
        groupStats={groupStats}
        userPoints={userPoints}
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
      userPoints={userPoints}
      onVote={handleVote}
      onViewResults={handleNavigateToInsights} // Change to go to insights instead of results
      onBackToHome={handleBackToHome}
      onSubmitStatement={handleSubmitStatement}
      isVoting={isVoting}
      participantCount={participantCount}
      consensusPointsCount={consensusPoints.length}
      totalVotes={poll.total_votes || 0}
      groups={groups}
      isLive={isLive}
      isDataLoading={loading}
    />
  );
};

export default PollPage;
