import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { VotingProgress } from '@/components/VotingProgress';
import { UserStatementForm } from '@/components/UserStatementForm';
import { StatementInfo } from '@/components/StatementInfo';
import { useAuth } from '@/contexts/AuthContext';
import { useReturnUrl } from '@/hooks/useReturnUrl';
import { Link } from 'react-router-dom';
import { Poll, Statement } from '@/types/poll';
import { 
  CheckCircle2, 
  BarChart3, 
  MessageSquarePlus, 
  AlertCircle,
  LogIn,
  Lightbulb,
  Users
} from 'lucide-react';

interface OptimizedVotingInterfaceProps {
  poll: Poll;
  statement: Statement | null;
  userVoteCount: number;
  totalStatements: number;
  remainingStatements: number;
  onVote: (statementId: string, vote: string) => void;
  onViewResults: () => void;
  onSubmitStatement: (content: string, contentType: string) => void;
  isVoting?: boolean;
}

export const OptimizedVotingInterface: React.FC<OptimizedVotingInterfaceProps> = ({
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
  const { createAuthUrl } = useReturnUrl();
  const [showStatementForm, setShowStatementForm] = useState(false);

  const progress = totalStatements > 0 ? (userVoteCount / totalStatements) * 100 : 0;

  const handleVote = (vote: string) => {
    if (statement) {
      onVote(statement.statement_id, vote);
    }
  };

  const isCompleted = remainingStatements === 0 && totalStatements > 0;

  if (isCompleted) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Card className="bg-gradient-to-r from-[#66c8ca]/10 via-white to-[#ec0081]/10 border-[#66c8ca]/20">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-[#66c8ca]/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-[#1a305b]" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-[#1a305b] hebrew-text">
                  כל הכבוד! סיימת להצביע
                </h3>
                <p className="text-muted-foreground hebrew-text">
                  הצבעת על כל {totalStatements} ההצהרות בסקר
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                <Button
                  onClick={onViewResults}
                  className="flex-1 bg-gradient-to-r from-[#1a305b] to-[#ec0081] hover:from-[#1a305b]/90 hover:to-[#ec0081]/90 text-white hebrew-text"
                >
                  <BarChart3 className="h-4 w-4 ml-2" />
                  צפה בתוצאות
                </Button>

                {poll.allow_user_statements && (
                  <Button
                    onClick={() => setShowStatementForm(true)}
                    variant="outline"
                    className="flex-1 border-[#66c8ca] text-[#1a305b] hover:bg-[#66c8ca]/10 hebrew-text"
                  >
                    <MessageSquarePlus className="h-4 w-4 ml-2" />
                    הוסף הצהרה
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Statement Form */}
        {showStatementForm && (
          <UserStatementForm
            onSubmit={onSubmitStatement}
            onCancel={() => setShowStatementForm(false)}
          />
        )}
      </div>
    );
  }

  if (!statement) {
    return (
      <div className="space-y-6">
        <Card className="border-[#ec0081]/20">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-[#ec0081]/20 rounded-full flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-[#ec0081]" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-[#1a305b] hebrew-text">
                  אין עוד הצהרות זמינות כרגע
                </h3>
                <p className="text-muted-foreground hebrew-text">
                  הצבעת על כל ההצהרות הזמינות. יתכן שיתווספו הצהרות נוספות מאוחר יותר.
                </p>
              </div>

              <Button
                onClick={onViewResults}
                className="bg-gradient-to-r from-[#1a305b] to-[#ec0081] hover:from-[#1a305b]/90 hover:to-[#ec0081]/90 text-white hebrew-text"
              >
                <BarChart3 className="h-4 w-4 ml-2" />
                צפה בתוצאות
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Section */}
      <VotingProgress
        currentVote={userVoteCount + 1}
        totalVotes={totalStatements}
        progress={progress}
      />

      {/* Main Voting Card */}
      <Card className="bg-gradient-to-br from-white to-[#66c8ca]/5 border-[#66c8ca]/20 shadow-lg">
        <CardContent className="p-8">
          <div className="space-y-6">
            {/* Statement Display */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="border-[#ec0081] text-[#ec0081] hebrew-text">
                  הצהרה {userVoteCount + 1} מתוך {totalStatements}
                </Badge>
                <StatementInfo statement={statement} />
              </div>

              <div className="p-6 bg-gradient-to-r from-[#66c8ca]/5 to-[#ec0081]/5 rounded-lg border border-[#66c8ca]/20">
                <p className="text-lg text-[#1a305b] leading-relaxed hebrew-text font-medium">
                  {statement.content}
                </p>
              </div>
            </div>

            {/* Voting Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Button
                onClick={() => handleVote('support')}
                disabled={isVoting}
                className="h-16 bg-green-500 hover:bg-green-600 text-white font-semibold text-lg hebrew-text"
              >
                {poll.support_button_label || 'תומך'}
              </Button>
              
              <Button
                onClick={() => handleVote('unsure')}
                disabled={isVoting}
                className="h-16 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold text-lg hebrew-text"
              >
                {poll.unsure_button_label || 'לא בטוח'}
              </Button>
              
              <Button
                onClick={() => handleVote('oppose')}
                disabled={isVoting}
                className="h-16 bg-red-500 hover:bg-red-600 text-white font-semibold text-lg hebrew-text"
              >
                {poll.oppose_button_label || 'מתנגד'}
              </Button>
            </div>

            {/* Loading State */}
            {isVoting && (
              <div className="text-center">
                <div className="inline-flex items-center space-x-2 text-[#1a305b]">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#ec0081]"></div>
                  <span className="hebrew-text">שומר הצבעה...</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={onViewResults}
          variant="outline"
          className="flex-1 border-[#66c8ca] text-[#1a305b] hover:bg-[#66c8ca]/10 hebrew-text"
        >
          <BarChart3 className="h-4 w-4 ml-2" />
          צפה בתוצאות ביניים
        </Button>

        {poll.allow_user_statements && (
          user ? (
            <Button
              onClick={() => setShowStatementForm(true)}
              variant="outline"
              className="flex-1 border-[#ec0081] text-[#1a305b] hover:bg-[#ec0081]/10 hebrew-text"
            >
              <MessageSquarePlus className="h-4 w-4 ml-2" />
              הוסף הצהרה משלך
            </Button>
          ) : (
            <Link to={createAuthUrl()} className="flex-1">
              <Button
                variant="outline"
                className="w-full border-[#ec0081] text-[#1a305b] hover:bg-[#ec0081]/10 hebrew-text"
              >
                <LogIn className="h-4 w-4 ml-2" />
                התחבר כדי להוסיף הצהרה
              </Button>
            </Link>
          )
        )}
      </div>

      {/* User Statement Form */}
      {showStatementForm && (
        <UserStatementForm
          onSubmit={onSubmitStatement}
          onCancel={() => setShowStatementForm(false)}
        />
      )}
    </div>
  );
};
