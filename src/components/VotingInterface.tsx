
import React from 'react';
import { Poll, Statement } from '@/types/poll';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ThumbsUp, 
  ThumbsDown, 
  HelpCircle,
  Clock,
  Users
} from 'lucide-react';

interface VotingInterfaceProps {
  poll: Poll;
  statement: Statement;
  onVote: (statementId: string, vote: string) => void;
  userVoteCount: number;
  totalStatements: number;
  onViewResults: () => void;
}

export const VotingInterface: React.FC<VotingInterfaceProps> = ({
  poll,
  statement,
  onVote,
  userVoteCount,
  totalStatements,
  onViewResults
}) => {
  const handleVote = (vote: string) => {
    onVote(statement.statement_id, vote);
  };

  const isLastStatement = userVoteCount === totalStatements - 1;
  const allStatementsVoted = userVoteCount === totalStatements;

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
    </div>
  );
};
