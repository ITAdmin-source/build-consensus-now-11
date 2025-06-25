import React from 'react';
import { Poll, Statement } from '@/types/poll';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserStatementForm } from '@/components/UserStatementForm';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, HelpCircle, Users, LogIn } from 'lucide-react';
interface VotingInterfaceProps {
  poll: Poll;
  statement: Statement | null;
  userVoteCount: number;
  totalStatements: number;
  remainingStatements: number;
  onVote: (statementId: string, vote: string) => void;
  onViewResults: () => void;
  onSubmitStatement?: (content: string, contentType: string) => void;
}
export const VotingInterface: React.FC<VotingInterfaceProps> = ({
  poll,
  statement,
  userVoteCount,
  totalStatements,
  remainingStatements,
  onVote,
  onViewResults,
  onSubmitStatement
}) => {
  const {
    user
  } = useAuth();
  const handleVote = (vote: string) => {
    if (statement) {
      onVote(statement.statement_id, vote);
    }
  };
  const handleSubmitStatement = (content: string, contentType: string) => {
    if (onSubmitStatement) {
      onSubmitStatement(content, contentType);
    }
  };

  // Render user statement form if allowed by poll
  const renderUserStatementSection = () => {
    if (!poll.allow_user_statements) return null;
    if (user && onSubmitStatement) {
      // User is authenticated - show the form
      return <UserStatementForm poll={poll} onSubmitStatement={handleSubmitStatement} />;
    } else {
      // User is not authenticated - show login prompt
      return <div className="text-center p-4 rounded-lg border border-blue-200 bg-white">
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
        </div>;
    }
  };

  // Show completion message when no statement is available (all voted)
  if (!statement) {
    return <div className="space-y-6">
        {/* Completion Message */}
        <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
          <h3 className="text-xl font-bold text-green-800 mb-2 hebrew-text">
            🎉 סיימת להצביע על כל ההצהרות!
          </h3>
          <p className="text-green-700 mb-4 hebrew-text">
            תודה על השתתפותך. כעת תוכל לראות את התוצאות ולגלות אילו נקודות חיבור נמצאו.
          </p>
          <Button onClick={onViewResults} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
            צפה בתוצאות
          </Button>
        </div>

        {/* User Statement Form - Show consistently based on poll settings */}
        {renderUserStatementSection()}
      </div>;
  }
  return <div className="space-y-6">
      {/* Statement Card */}
      <Card className="poll-card">
        {/*<CardHeader className="text-center pb-4">
          <div className="flex justify-center items-center gap-4 mb-4">
            <Badge variant="outline" className="hebrew-text">
              {poll.category}
            </Badge>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{poll.total_votes} הצבעות</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold hebrew-text leading-relaxed mb-4">
            {statement.content}
          </CardTitle>
        </CardHeader>*/}
        
        <CardContent>
          {/* Voting Buttons - Available to all users */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Button onClick={() => handleVote('support')} className="vote-button bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-6" size="lg">
              <ThumbsUp className="h-6 w-6 ml-2" />
              <span className="hebrew-text text-lg">תומך</span>
            </Button>
            
            <Button onClick={() => handleVote('unsure')} className="vote-button bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-6" size="lg">
              <HelpCircle className="h-6 w-6 ml-2" />
              <span className="hebrew-text text-lg">לא בטוח</span>
            </Button>
            
            <Button onClick={() => handleVote('oppose')} className="vote-button bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-6" size="lg">
              <ThumbsDown className="h-6 w-6 ml-2" />
              <span className="hebrew-text text-lg">מתנגד</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User Statement Form - Show consistently based on poll settings */}
      {renderUserStatementSection()}
    </div>;
};