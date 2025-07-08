
import React, { useState, useMemo } from 'react';
import { Poll, Statement } from '@/types/poll';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserStatementForm } from '@/components/UserStatementForm';
import { StatementInfo } from '@/components/StatementInfo';
import { GameXPBar } from '@/components/GameXPBar';
import { PowerButton } from '@/components/PowerButton';
import { GameParticles } from '@/components/GameParticles';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, HelpCircle, LogIn, Trophy, Star } from 'lucide-react';

interface OptimizedVotingInterfaceProps {
  poll: Poll;
  statement: Statement | null;
  userVoteCount: number;
  totalStatements: number;
  remainingStatements: number;
  onVote: (statementId: string, vote: string) => void;
  onViewResults: () => void;
  onSubmitStatement?: (content: string, contentType: string) => void;
  isVoting?: boolean;
}

export const OptimizedVotingInterface: React.FC<OptimizedVotingInterfaceProps> = React.memo(({
  poll,
  statement,
  userVoteCount,
  totalStatements,
  remainingStatements,
  onVote,
  onViewResults,
  onSubmitStatement,
  isVoting = false
}) => {
  const { user } = useAuth();
  const [pendingVote, setPendingVote] = useState<string | null>(null);

  const handleOptimisticVote = (vote: string) => {
    if (!statement) return;
    
    setPendingVote(vote);
    onVote(statement.statement_id, vote);
    
    setTimeout(() => {
      setPendingVote(null);
    }, 300);
  };

  // Calculate gaming stats
  const currentLevel = Math.floor(userVoteCount / 5) + 1;
  const xpInCurrentLevel = userVoteCount % 5;
  const xpForNextLevel = 5;
  const achievements = [];
  
  if (userVoteCount >= 1) achievements.push('First Vote');
  if (userVoteCount >= 5) achievements.push('Voter');
  if (userVoteCount >= 10) achievements.push('Expert Voter');

  // Memoize user statement section to prevent unnecessary re-renders
  const userStatementSection = useMemo(() => {
    if (!poll.allow_user_statements) return null;
    
    if (user && onSubmitStatement) {
      return (
        <div className="quest-submission bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200/50 game-card-glow">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-purple-600" />
            <h3 className="font-bold text-purple-800 hebrew-text">הוסף אתגר חדש</h3>
          </div>
          <UserStatementForm poll={poll} onSubmitStatement={onSubmitStatement} />
        </div>
      );
    } else {
      return (
        <div className="text-center p-6 rounded-xl border-2 border-blue-200/50 bg-gradient-to-r from-blue-50 to-cyan-50 game-card-glow">
          <LogIn className="h-8 w-8 mx-auto mb-3 text-blue-600" />
          <p className="text-blue-800 mb-4 hebrew-text font-medium">
            להוספת אתגרים חדשים נדרשת התחברות
          </p>
          <Link to="/auth">
            <Button variant="outline" size="sm" className="power-button">
              <LogIn className="h-4 w-4 ml-2" />
              התחבר למערכת
            </Button>
          </Link>
        </div>
      );
    }
  }, [poll.allow_user_statements, user, onSubmitStatement, poll]);

  // Show completion message when no statement is available
  if (!statement) {
    return (
      <div className="space-y-6 animate-fade-in">
        <GameParticles count={8} />
        
        {/* Victory celebration */}
        <div className="text-center p-8 bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 rounded-xl border-2 border-green-200/50 game-card-glow relative overflow-hidden">
          <div className="animate-level-up mb-4">
            <Trophy className="h-16 w-16 mx-auto text-yellow-500 game-text-glow" />
          </div>
          <h3 className="text-2xl font-bold text-green-800 mb-3 hebrew-text game-text-glow">
            🎉 משימה הושלמה בהצלחה!
          </h3>
          <p className="text-green-700 mb-6 hebrew-text text-lg">
            תודה על השתתפותך הפעילה. גלה עכשיו אילו נקודות חיבור נמצאו!
          </p>
          <Button 
            onClick={onViewResults} 
            className="power-button bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white h-14 px-8 text-lg game-button-glow"
          >
            <Trophy className="h-6 w-6 ml-2" />
            צפה בתוצאות
          </Button>
        </div>
        
        {/* Gaming Progress */}
        <GameXPBar
          currentXP={xpInCurrentLevel}
          maxXP={xpForNextLevel}
          level={currentLevel}
          achievements={achievements}
        />
        
        {userStatementSection}
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      <GameParticles count={6} />
      
      {/* Battle Arena - Statement Card */}
      <div className="relative">
        {isVoting && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center z-10 animate-fade-in">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#66c8ca] mx-auto mb-2"></div>
              <p className="text-sm text-gray-600 hebrew-text">מעבד הצבעה...</p>
            </div>
          </div>
        )}
        
        <Card className={`battle-card transition-all duration-300 ${pendingVote ? 'scale-[0.98] opacity-80 animate-shake' : 'scale-100 opacity-100'} animate-scale-in relative overflow-hidden`}>
          <GameParticles count={4} className="opacity-20" />
          
          <CardHeader className="text-center pb-4 relative">
            <div className="absolute top-2 right-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#1a305b] to-[#66c8ca] flex items-center justify-center animate-pulse-glow">
                <span className="text-white font-bold text-xs">{remainingStatements}</span>
              </div>
            </div>
            
            <div className="flex items-start justify-between mb-6">
              <CardTitle className="text-2xl font-bold hebrew-text leading-relaxed flex-1 text-right game-text-glow">
                {statement.content}
              </CardTitle>
              {statement.more_info && (
                <div className="mr-2 flex-shrink-0">
                  <StatementInfo moreInfo={statement.more_info} />
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <PowerButton
                onClick={() => handleOptimisticVote('support')}
                icon={ThumbsUp}
                label="תומך"
                variant="support"
                disabled={!!pendingVote}
                isActive={pendingVote === 'support'}
              />
              
              <PowerButton
                onClick={() => handleOptimisticVote('unsure')}
                icon={HelpCircle}
                label="לא בטוח"
                variant="unsure"
                disabled={!!pendingVote}
                isActive={pendingVote === 'unsure'}
              />
              
              <PowerButton
                onClick={() => handleOptimisticVote('oppose')}
                icon={ThumbsDown}
                label="מתנגד"
                variant="oppose"
                disabled={!!pendingVote}
                isActive={pendingVote === 'oppose'}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gaming Progress System */}
      <GameXPBar
        currentXP={xpInCurrentLevel}
        maxXP={xpForNextLevel}
        level={currentLevel}
        achievements={achievements}
        className="animate-fade-in"
      />

      {userStatementSection}
    </div>
  );
});

OptimizedVotingInterface.displayName = 'OptimizedVotingInterface';
