
import React, { useState } from 'react';
import { PollCard } from '@/components/PollCard';
import { VotingInterface } from '@/components/VotingInterface';
import { ResultsDashboard } from '@/components/ResultsDashboard';
import { mockPolls, mockStatements, mockConsensusPoints } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Trophy, Users, Clock } from 'lucide-react';

const Index = () => {
  const [currentView, setCurrentView] = useState<'home' | 'voting' | 'results'>('home');
  const [selectedPollId, setSelectedPollId] = useState<string | null>(null);
  const [currentStatementIndex, setCurrentStatementIndex] = useState(0);
  const [userVotes, setUserVotes] = useState<Record<string, string>>({});

  const selectedPoll = selectedPollId ? mockPolls.find(p => p.poll_id === selectedPollId) : null;
  const pollStatements = selectedPollId ? mockStatements.filter(s => s.poll_id === selectedPollId) : [];
  const pollConsensusPoints = selectedPollId ? mockConsensusPoints.filter(cp => cp.poll_id === selectedPollId) : [];

  const handleJoinPoll = (pollId: string) => {
    setSelectedPollId(pollId);
    setCurrentView('voting');
    setCurrentStatementIndex(0);
  };

  const handleVote = (statementId: string, vote: string) => {
    setUserVotes(prev => ({ ...prev, [statementId]: vote }));
    
    // Move to next statement or show results
    if (currentStatementIndex < pollStatements.length - 1) {
      setCurrentStatementIndex(prev => prev + 1);
    } else {
      setCurrentView('results');
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

  if (currentView === 'voting' && selectedPoll && pollStatements.length > 0) {
    return (
      <div>
        <VotingInterface
          poll={selectedPoll}
          statement={pollStatements[currentStatementIndex]}
          onVote={handleVote}
          userVoteCount={Object.keys(userVotes).length}
          totalStatements={pollStatements.length}
        />
        <div className="fixed bottom-4 left-4 space-x-2">
          <Button onClick={handleBackToHome} variant="outline">
            חזרה לדף הבית
          </Button>
          <Button onClick={handleViewResults} variant="outline">
            צפה בתוצאות
          </Button>
        </div>
      </div>
    );
  }

  if (currentView === 'results' && selectedPoll) {
    return (
      <div>
        <ResultsDashboard
          poll={selectedPoll}
          statements={pollStatements}
          consensusPoints={pollConsensusPoints}
        />
        <div className="fixed bottom-4 left-4 space-x-2">
          <Button onClick={handleBackToHome} variant="outline">
            חזרה לדף הבית
          </Button>
          {pollStatements.length > 0 && (
            <Button onClick={() => setCurrentView('voting')} variant="outline">
              המשך הצבעה
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-5xl font-bold mb-4 hebrew-text">
            נקודות חיבור
          </h1>
          <p className="text-xl mb-6 hebrew-text leading-relaxed">
            שחקו ברצינות - בנו הסכמה אמיתית
          </p>
          <p className="text-lg opacity-90 max-w-2xl mx-auto hebrew-text leading-relaxed">
            אתם זוכים רק אם כולם זוכים. הזמן אוזל. עזרו לבנות קונצנזוס בחברה הישראלית לפני שהשעון מגיע לאפס.
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-blue-600">
                {mockPolls.filter(p => p.status === 'active').length}
              </div>
              <div className="text-sm text-muted-foreground">סקרים פעילים</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-green-600">
                {mockPolls.reduce((sum, p) => sum + p.current_consensus_points, 0)}
              </div>
              <div className="text-sm text-muted-foreground">נקודות חיבור</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-purple-600">
                {mockPolls.reduce((sum, p) => sum + p.total_votes, 0)}
              </div>
              <div className="text-sm text-muted-foreground">הצבעות</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-orange-600">
                {mockPolls.filter(p => p.current_consensus_points >= p.min_consensus_points_to_win).length}
              </div>
              <div className="text-sm text-muted-foreground">ניצחונות</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 hebrew-text">
            סקרים פעילים
          </h2>
          <p className="text-lg text-muted-foreground hebrew-text">
            בחרו בנושא שמעניין אתכם והתחילו לבנות קונצנזוס
          </p>
        </div>

        {/* Filters */}
        <div className="flex justify-center gap-4 mb-8">
          <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
            הכל
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
            חינוך
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
            חברה
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
            סביבה
          </Badge>
        </div>

        {/* Polls Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {mockPolls.map((poll) => (
            <PollCard
              key={poll.poll_id}
              poll={poll}
              onJoinPoll={handleJoinPoll}
            />
          ))}
        </div>

        {/* How it Works */}
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-center mb-8 hebrew-text">
              איך זה עובד?
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold hebrew-text">1. הצביעו על הצהרות</h4>
                <p className="text-sm text-muted-foreground hebrew-text leading-relaxed">
                  קראו הצהרות בנושא וציינו אם אתם תומכים, מתנגדים או לא בטוחים
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <Target className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="text-lg font-semibold hebrew-text">2. מצאו נקודות חיבור</h4>
                <p className="text-sm text-muted-foreground hebrew-text leading-relaxed">
                  המערכת מזהה הצהרות שזוכות לתמיכה רחבה מכל הקבוצות
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center">
                  <Trophy className="h-8 w-8 text-purple-600" />
                </div>
                <h4 className="text-lg font-semibold hebrew-text">3. זכו יחד</h4>
                <p className="text-sm text-muted-foreground hebrew-text leading-relaxed">
                  כשמוצאים מספיק נקודות חיבור לפני שהזמן נגמר - כולם זוכים!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
