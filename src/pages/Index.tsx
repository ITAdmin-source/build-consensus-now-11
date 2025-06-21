
import React, { useState, useEffect } from 'react';
import { HomePage } from '@/components/HomePage';
import { VotingPage } from '@/components/VotingPage';
import { ResultsPage } from '@/components/ResultsPage';
import { Poll, Statement, ConsensusPoint, Group, GroupStatementStats } from '@/types/poll';
import { fetchActivePolls, fetchPollById } from '@/integrations/supabase/polls';
import { fetchStatementsByPollId, submitUserStatement } from '@/integrations/supabase/statements';
import { submitVote, fetchUserVotes } from '@/integrations/supabase/votes';
import { fetchGroupsByPollId, fetchGroupStatsByPollId, fetchConsensusPointsByPollId } from '@/integrations/supabase/groups';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const Index = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<'home' | 'voting' | 'results'>('home');
  const [selectedPollId, setSelectedPollId] = useState<string | null>(null);
  const [currentStatementIndex, setCurrentStatementIndex] = useState(0);
  const [userVotes, setUserVotes] = useState<Record<string, string>>({});
  
  // Data states
  const [polls, setPolls] = useState<Poll[]>([]);
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
  const [statements, setStatements] = useState<Statement[]>([]);
  const [consensusPoints, setConsensusPoints] = useState<ConsensusPoint[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupStats, setGroupStats] = useState<GroupStatementStats[]>([]);
  const [loading, setLoading] = useState(true);

  // Load initial polls
  useEffect(() => {
    loadActivePolls();
  }, []);

  // Load poll data when poll is selected
  useEffect(() => {
    if (selectedPollId) {
      loadPollData(selectedPollId);
    }
  }, [selectedPollId, user]);

  const loadActivePolls = async () => {
    try {
      setLoading(true);
      const pollsData = await fetchActivePolls();
      setPolls(pollsData);
    } catch (error) {
      console.error('Error loading polls:', error);
      toast.error('שגיאה בטעינת הסקרים');
    } finally {
      setLoading(false);
    }
  };

  const loadPollData = async (pollId: string) => {
    try {
      setLoading(true);
      const [pollData, statementsData, consensusPointsData, groupsData, groupStatsData, votesData] = await Promise.all([
        fetchPollById(pollId),
        fetchStatementsByPollId(pollId),
        fetchConsensusPointsByPollId(pollId),
        fetchGroupsByPollId(pollId),
        fetchGroupStatsByPollId(pollId),
        fetchUserVotes(pollId)
      ]);

      setSelectedPoll(pollData);
      setStatements(statementsData);
      setConsensusPoints(consensusPointsData);
      setGroups(groupsData);
      setGroupStats(groupStatsData);
      setUserVotes(votesData);
    } catch (error) {
      console.error('Error loading poll data:', error);
      toast.error('שגיאה בטעינת נתוני הסקר');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinPoll = (pollId: string) => {
    if (!user) {
      toast.error('יש להתחבר כדי להשתתף בסקר');
      return;
    }
    
    setSelectedPollId(pollId);
    setCurrentView('voting');
    setCurrentStatementIndex(0);
  };

  const handleVote = async (statementId: string, vote: string) => {
    if (!user) {
      toast.error('יש להתחבר כדי להצביע');
      return;
    }

    try {
      await submitVote(statementId, vote as 'support' | 'oppose' | 'unsure');
      setUserVotes(prev => ({ ...prev, [statementId]: vote }));
      
      if (currentStatementIndex < statements.length - 1) {
        setCurrentStatementIndex(prev => prev + 1);
      }
      
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

    if (!selectedPollId) return;

    try {
      await submitUserStatement(selectedPollId, content, contentType);
      toast.success('ההצהרה נשלחה לאישור מנהל');
    } catch (error) {
      console.error('Error submitting statement:', error);
      toast.error('שגיאה בשליחת ההצהרה');
    }
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedPollId(null);
    setCurrentStatementIndex(0);
    setSelectedPoll(null);
    setStatements([]);
    setConsensusPoints([]);
    setGroups([]);
    setGroupStats([]);
    setUserVotes({});
  };

  const handleViewResults = () => {
    setCurrentView('results');
  };

  const handleNavigateToVoting = () => {
    setCurrentView('voting');
  };

  if (loading && currentView === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg hebrew-text">טוען סקרים...</p>
        </div>
      </div>
    );
  }

  if (currentView === 'voting' && selectedPoll && statements.length > 0) {
    return (
      <VotingPage
        poll={selectedPoll}
        statements={statements}
        currentStatementIndex={currentStatementIndex}
        userVotes={userVotes}
        onVote={handleVote}
        onViewResults={handleViewResults}
        onBackToHome={handleBackToHome}
        onSubmitStatement={handleSubmitStatement}
      />
    );
  }

  if (currentView === 'results' && selectedPoll) {
    return (
      <ResultsPage
        poll={selectedPoll}
        statements={statements}
        consensusPoints={consensusPoints}
        groups={groups}
        groupStats={groupStats}
        onBackToHome={handleBackToHome}
        onNavigateToVoting={statements.length > 0 ? handleNavigateToVoting : undefined}
      />
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
