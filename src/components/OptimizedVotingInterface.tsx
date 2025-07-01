
import React, { useState, useMemo } from 'react';
import { Poll, Statement } from '@/types/poll';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserStatementForm } from '@/components/UserStatementForm';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, HelpCircle, LogIn } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

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
    
    // Set pending vote for immediate UI feedback
    setPendingVote(vote);
    
    // Submit the actual vote
    onVote(statement.statement_id, vote);
    
    // Clear pending vote after a short delay to allow for smooth transition
    setTimeout(() => {
      setPendingVote(null);
    }, 300);
  };

  // Memoize user statement section to prevent unnecessary re-renders
  const userStatementSection = useMemo(() => {
    if (!poll.allow_user_statements) return null;
    
    if (user && onSubmitStatement) {
      return <UserStatementForm poll={poll} onSubmitStatement={onSubmitStatement} />;
    } else {
      return (
        <div className="text-center p-4 rounded-lg border border-blue-200 bg-white">
          <LogIn className="h-8 w-8 mx-auto mb-2 text-blue-600" />
          <p className="text-blue-800 mb-3 hebrew-text">
            להוספת הצהרות חדשות נדרשת התחברות
          </p>
          <Link to="/auth">
            <Button variant="outline" size="sm">
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
        <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
          <h3 className="text-xl font-bold text-green-800 mb-2 hebrew-text">
            🎉 סיימת להצביע על כל ההצהרות!
          </h3>
          <p className="text-green-700 mb-4 hebrew-text">
            תודה על השתתפותך. כעת תוכל לראות את התוצאות ולגלות אילו נקודות חיבור נמצאו.
          </p>
          <Button 
            onClick={onViewResults} 
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
          >
            צפה בתוצאות
          </Button>
        </div>
        {userStatementSection}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statement Card with optimistic loading */}
      <div className="relative">
        {isVoting && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center z-10 animate-fade-in">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-gray-600 hebrew-text">מעבד הצבעה...</p>
            </div>
          </div>
        )}
        
        <Card className={`poll-card transition-all duration-300 ${pendingVote ? 'scale-[0.98] opacity-80' : 'scale-100 opacity-100'} animate-scale-in`}>
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold hebrew-text leading-relaxed mb-4">
              {statement.content}
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Button 
                onClick={() => handleOptimisticVote('support')} 
                disabled={!!pendingVote}
                className={`vote-button bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-6 transition-all duration-300 ${
                  pendingVote === 'support' ? 'ring-4 ring-green-300 scale-105' : ''
                }`}
                size="lg"
              >
                <ThumbsUp className="h-6 w-6 ml-2" />
                <span className="hebrew-text text-lg">תומך</span>
              </Button>
              
              <Button 
                onClick={() => handleOptimisticVote('unsure')} 
                disabled={!!pendingVote}
                className={`vote-button bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-6 transition-all duration-300 ${
                  pendingVote === 'unsure' ? 'ring-4 ring-yellow-300 scale-105' : ''
                }`}
                size="lg"
              >
                <HelpCircle className="h-6 w-6 ml-2" />
                <span className="hebrew-text text-lg">לא בטוח</span>
              </Button>
              
              <Button 
                onClick={() => handleOptimisticVote('oppose')} 
                disabled={!!pendingVote}
                className={`vote-button bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-6 transition-all duration-300 ${
                  pendingVote === 'oppose' ? 'ring-4 ring-red-300 scale-105' : ''
                }`}
                size="lg"
              >
                <ThumbsDown className="h-6 w-6 ml-2" />
                <span className="hebrew-text text-lg">מתנגד</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {userStatementSection}
    </div>
  );
});

OptimizedVotingInterface.displayName = 'OptimizedVotingInterface';
