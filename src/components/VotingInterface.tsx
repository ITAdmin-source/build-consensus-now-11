
import React from 'react';
import { Poll, Statement } from '@/types/poll';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserStatementForm } from '@/components/UserStatementForm';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { 
  ThumbsUp, 
  ThumbsDown, 
  HelpCircle,
  Users,
  LogIn
} from 'lucide-react';

interface VotingInterfaceProps {
  poll: Poll;
  statement: Statement;
  onVote: (statementId: string, vote: string) => void;
  userVoteCount: number;
  totalStatements: number;
  onViewResults: () => void;
  onSubmitStatement?: (content: string, contentType: string) => void;
}

export const VotingInterface: React.FC<VotingInterfaceProps> = ({
  poll,
  statement,
  onVote,
  userVoteCount,
  totalStatements,
  onViewResults,
  onSubmitStatement
}) => {
  const { user } = useAuth();

  const handleVote = (vote: string) => {
    if (!user) {
      return; // Will be handled by parent component
    }
    onVote(statement.statement_id, vote);
  };

  const handleSubmitStatement = (content: string, contentType: string) => {
    if (onSubmitStatement) {
      onSubmitStatement(content, contentType);
    }
  };

  const isLastStatement = userVoteCount === totalStatements - 1;
  const allStatementsVoted = userVoteCount === totalStatements;

  // Show authentication prompt if user is not logged in
  if (!user) {
    return (
      <Card className="poll-card">
        <CardContent className="text-center py-12">
          <LogIn className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-bold mb-2 hebrew-text">
            נדרשת התחברות
          </h3>
          <p className="text-muted-foreground mb-6 hebrew-text">
            כדי להשתתף בסקר ולהצביע על הצהרות, יש להתחבר למערכת
          </p>
          <Link to="/auth">
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              <LogIn className="h-4 w-4 ml-2" />
              התחבר למערכת
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statement Card */}
      <Card className="poll-card">
        <CardHeader className="text-center pb-4">
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
        </CardHeader>
        
        <CardContent>
          {/* Voting Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Button
              onClick={() => handleVote('support')}
              className="vote-button bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-6"
              size="lg"
            >
              <ThumbsUp className="h-6 w-6 ml-2" />
              <span className="hebrew-text text-lg">תומך</span>
            </Button>
            
            <Button
              onClick={() => handleVote('unsure')}
              className="vote-button bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-6"
              size="lg"
            >
              <HelpCircle className="h-6 w-6 ml-2" />
              <span className="hebrew-text text-lg">לא בטוח</span>
            </Button>
            
            <Button
              onClick={() => handleVote('oppose')}
              className="vote-button bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-6"
              size="lg"
            >
              <ThumbsDown className="h-6 w-6 ml-2" />
              <span className="hebrew-text text-lg">מתנגד</span>
            </Button>
          </div>

          {/* Completion Message */}
          {allStatementsVoted && (
            <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
              <h3 className="text-xl font-bold text-green-800 mb-2 hebrew-text">
                🎉 סיימת להצביע על כל ההצהרות!
              </h3>
              <p className="text-green-700 mb-4 hebrew-text">
                תודה על השתתפותך. כעת תוכל לראות את התוצאות ולגלות אילו נקודות חיבור נמצאו.
              </p>
              <Button 
                onClick={onViewResults}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                צפה בתוצאות
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Statement Form - Only show if user statements are allowed */}
      {poll.allow_user_statements && onSubmitStatement && (
        <UserStatementForm 
          poll={poll}
          onSubmitStatement={handleSubmitStatement}
        />
      )}
    </div>
  );
};
