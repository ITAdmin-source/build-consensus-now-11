
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StatementInfo } from './StatementInfo';
import { Separator } from '@/components/ui/separator';
import { UserStatementForm } from './UserStatementForm';
import type { Statement, Poll } from '@/types/poll';

interface VotingInterfaceProps {
  poll: Poll;
  statement: Statement;
  userVoteCount: number;
  totalStatements: number;
  remainingStatements: number;
  onVote: (statementId: string, vote: string) => void;
  onViewResults: () => void;
  onSubmitStatement: (content: string, contentType: string) => void;
  isVoting: boolean;
}

export const VotingInterface: React.FC<VotingInterfaceProps> = ({
  poll,
  statement,
  userVoteCount,
  totalStatements,
  remainingStatements,
  onVote,
  onViewResults,
  onSubmitStatement,
  isVoting,
}) => {
  const [showUserStatementForm, setShowUserStatementForm] = useState(false);

  if (!statement) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-4 hebrew-text">
          השלמת את כל ההצהרות!
        </h2>
        <p className="text-muted-foreground mb-6 hebrew-text">
          תודה על השתתפותך. תוכל כעת לראות את התוצאות.
        </p>
        <Button 
          onClick={onViewResults}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 text-lg hebrew-text"
        >
          צפה בתוצאות
        </Button>
      </div>
    );
  }

  const handleVote = (vote: string) => {
    onVote(statement.statement_id, vote);
  };

  const progressPercentage = Math.round((userVoteCount / totalStatements) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress indicator */}
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium hebrew-text">התקדמות</span>
          <span className="text-sm text-muted-foreground hebrew-text">
            {userVoteCount} מתוך {totalStatements}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1 hebrew-text">
          נותרו {remainingStatements} הצהרות
        </p>
      </div>

      {/* Statement card */}
      <Card className="bg-white shadow-lg border-0">
        <CardContent className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <p className="text-lg leading-relaxed hebrew-text text-right font-medium">
                {statement.content}
              </p>
            </div>
            {statement.more_info && (
              <StatementInfo 
                statementContent={statement.content}
                moreInfo={statement.more_info} 
                className="mr-3 mt-1 flex-shrink-0" 
              />
            )}
          </div>

          {/* Voting buttons */}
          <div className="grid grid-cols-3 gap-4">
            <Button
              onClick={() => handleVote('support')}
              disabled={isVoting}
              className="bg-green-500 hover:bg-green-600 text-white py-4 text-lg font-medium hebrew-text transition-all duration-200 hover:scale-105"
            >
              {poll.support_button_label || 'תומך'}
            </Button>
            
            <Button
              onClick={() => handleVote('unsure')}
              disabled={isVoting}
              variant="outline"
              className="border-2 border-gray-300 hover:border-gray-400 py-4 text-lg font-medium hebrew-text transition-all duration-200 hover:scale-105"
            >
              {poll.unsure_button_label || 'לא בטוח'}
            </Button>
            
            <Button
              onClick={() => handleVote('oppose')}
              disabled={isVoting}
              className="bg-red-500 hover:bg-red-600 text-white py-4 text-lg font-medium hebrew-text transition-all duration-200 hover:scale-105"
            >
              {poll.oppose_button_label || 'מתנגד'}
            </Button>
          </div>

          {isVoting && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 ml-2"></div>
                <span className="hebrew-text">שומר הצבעה...</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={onViewResults}
          variant="outline"
          className="px-6 py-3 hebrew-text"
        >
          צפה בתוצאות ביניים
        </Button>

        {poll.allow_user_statements && (
          <Button
            onClick={() => setShowUserStatementForm(true)}
            variant="outline"
            className="px-6 py-3 hebrew-text"
          >
            הוסף הצהרה
          </Button>
        )}
      </div>

      {/* User statement form */}
      {showUserStatementForm && (
        <>
          <Separator className="my-8" />
          <UserStatementForm
            poll={poll}
            onSubmitStatement={onSubmitStatement}
            onClose={() => setShowUserStatementForm(false)}
          />
        </>
      )}
    </div>
  );
};
