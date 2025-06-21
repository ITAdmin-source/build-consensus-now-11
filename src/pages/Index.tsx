
import React, { useState } from 'react';
import { HomePage } from '@/components/HomePage';
import { VotingPage } from '@/components/VotingPage';
import { ResultsPage } from '@/components/ResultsPage';
import { mockPolls, mockStatements, mockConsensusPoints, mockGroups, mockGroupStatementStats } from '@/data/mockData';

const Index = () => {
  const [currentView, setCurrentView] = useState<'home' | 'voting' | 'results'>('home');
  const [selectedPollId, setSelectedPollId] = useState<string | null>(null);
  const [currentStatementIndex, setCurrentStatementIndex] = useState(0);
  const [userVotes, setUserVotes] = useState<Record<string, string>>({});

  const selectedPoll = selectedPollId ? mockPolls.find(p => p.poll_id === selectedPollId) : null;
  const pollStatements = selectedPollId ? mockStatements.filter(s => s.poll_id === selectedPollId) : [];
  const pollConsensusPoints = selectedPollId ? mockConsensusPoints.filter(cp => cp.poll_id === selectedPollId) : [];
  const pollGroups = selectedPollId ? mockGroups.filter(g => g.poll_id === selectedPollId) : [];
  const pollGroupStats = selectedPollId ? mockGroupStatementStats.filter(gs => gs.poll_id === selectedPollId) : [];

  const handleJoinPoll = (pollId: string) => {
    setSelectedPollId(pollId);
    setCurrentView('voting');
    setCurrentStatementIndex(0);
  };

  const handleVote = (statementId: string, vote: string) => {
    setUserVotes(prev => ({ ...prev, [statementId]: vote }));
    
    if (currentStatementIndex < pollStatements.length - 1) {
      setCurrentStatementIndex(prev => prev + 1);
    }
  };

  const handleSubmitStatement = (content: string, contentType: string) => {
    console.log('Submitting statement:', { content, contentType, pollId: selectedPollId });
    alert('ההצהרה נשלחה בהצלחה!');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedPollId(null);
    setCurrentStatementIndex(0);
  };

  const handleViewResults = () => {
    setCurrentView('results');
  };

  const handleNavigateToVoting = () => {
    setCurrentView('voting');
  };

  if (currentView === 'voting' && selectedPoll && pollStatements.length > 0) {
    return (
      <VotingPage
        poll={selectedPoll}
        statements={pollStatements}
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
        statements={pollStatements}
        consensusPoints={pollConsensusPoints}
        groups={pollGroups}
        groupStats={pollGroupStats}
        onBackToHome={handleBackToHome}
        onNavigateToVoting={pollStatements.length > 0 ? handleNavigateToVoting : undefined}
      />
    );
  }

  return (
    <HomePage
      polls={mockPolls}
      onJoinPoll={handleJoinPoll}
    />
  );
};

export default Index;
