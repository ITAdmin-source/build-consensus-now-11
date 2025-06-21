
import React, { useState } from 'react';
import { PollCard } from '@/components/PollCard';
import { VotingInterface } from '@/components/VotingInterface';
import { ResultsDashboard } from '@/components/ResultsDashboard';
import { NavigationHeader } from '@/components/NavigationHeader';
import { HowItWorks } from '@/components/HowItWorks';
import { VotingProgress } from '@/components/VotingProgress';
import { mockPolls, mockStatements, mockConsensusPoints, mockGroups, mockGroupStatementStats } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';

const Index = () => {
  const [currentView, setCurrentView] = useState<'home' | 'voting' | 'results'>('home');
  const [selectedPollId, setSelectedPollId] = useState<string | null>(null);
  const [currentStatementIndex, setCurrentStatementIndex] = useState(0);
  const [userVotes, setUserVotes] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('הכל');

  const selectedPoll = selectedPollId ? mockPolls.find(p => p.poll_id === selectedPollId) : null;
  const pollStatements = selectedPollId ? mockStatements.filter(s => s.poll_id === selectedPollId) : [];
  const pollConsensusPoints = selectedPollId ? mockConsensusPoints.filter(cp => cp.poll_id === selectedPollId) : [];
  const pollGroups = selectedPollId ? mockGroups.filter(g => g.poll_id === selectedPollId) : [];
  const pollGroupStats = selectedPollId ? mockGroupStatementStats.filter(gs => gs.poll_id === selectedPollId) : [];

  const categories = ['הכל', 'חינוך', 'חברה', 'סביבה'];
  
  const filteredPolls = mockPolls.filter(poll => {
    const matchesSearch = searchQuery === '' || 
      poll.title.includes(searchQuery) || 
      poll.description.includes(searchQuery);
    const matchesCategory = selectedCategory === 'הכל' || poll.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <NavigationHeader
          poll={selectedPoll}
          currentPage="voting"
          onNavigateHome={handleBackToHome}
          onNavigateToResults={handleViewResults}
        />
        
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <VotingProgress
            poll={selectedPoll}
            userVoteCount={Object.keys(userVotes).length}
            totalStatements={pollStatements.length}
            currentStatementIndex={currentStatementIndex}
          />
          
          <VotingInterface
            poll={selectedPoll}
            statement={pollStatements[currentStatementIndex]}
            onVote={handleVote}
            userVoteCount={Object.keys(userVotes).length}
            totalStatements={pollStatements.length}
            onViewResults={handleViewResults}
          />
        </div>
      </div>
    );
  }

  if (currentView === 'results' && selectedPoll) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <NavigationHeader
          poll={selectedPoll}
          currentPage="results"
          onNavigateHome={handleBackToHome}
          onNavigateToVoting={pollStatements.length > 0 ? handleNavigateToVoting : undefined}
        />
        
        <div className="py-6">
          <ResultsDashboard
            poll={selectedPoll}
            statements={pollStatements}
            consensusPoints={pollConsensusPoints}
            groups={pollGroups}
            groupStats={pollGroupStats}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <NavigationHeader currentPage="home" />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 hebrew-text">
            נקודות חיבור
          </h1>
          <p className="text-lg md:text-xl mb-4 hebrew-text leading-relaxed">
            שחקו ברצינות - בנו הסכמה אמיתית
          </p>
          <p className="text-base md:text-lg opacity-90 max-w-2xl mx-auto hebrew-text leading-relaxed">
            אתם זוכים רק אם כולם זוכים. הזמן אוזל. עזרו לבנות קונצנזוס בחברה הישראלית.
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-xl md:text-2xl font-bold text-blue-600">
                {mockPolls.filter(p => p.status === 'active').length}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">סקרים פעילים</div>
            </div>
            <div className="space-y-1">
              <div className="text-xl md:text-2xl font-bold text-green-600">
                {mockPolls.reduce((sum, p) => sum + p.current_consensus_points, 0)}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">נקודות חיבור</div>
            </div>
            <div className="space-y-1">
              <div className="text-xl md:text-2xl font-bold text-purple-600">
                {mockPolls.reduce((sum, p) => sum + p.total_votes, 0)}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">הצבעות</div>
            </div>
            <div className="space-y-1">
              <div className="text-xl md:text-2xl font-bold text-orange-600">
                {mockPolls.filter(p => p.current_consensus_points >= p.min_consensus_points_to_win).length}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">ניצחונות</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Header & Search */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 hebrew-text">
            סקרים פעילים
          </h2>
          
          {/* Search and Filter */}
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="חיפוש סקרים..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 hebrew-text"
              />
            </div>
            
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Polls Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredPolls.map((poll) => (
            <PollCard
              key={poll.poll_id}
              poll={poll}
              onJoinPoll={handleJoinPoll}
            />
          ))}
        </div>

        {/* How it Works */}
        <HowItWorks />
      </div>
    </div>
  );
};

export default Index;
