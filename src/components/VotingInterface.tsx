
import React, { useState } from 'react';
import { Statement } from '@/types/poll';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CountdownTimer } from './CountdownTimer';
import { 
  ThumbsUp, 
  ThumbsDown, 
  HelpCircle,
  Target,
  Trophy,
  CheckCircle,
  BarChart3
} from 'lucide-react';

interface VotingInterfaceProps {
  poll: {
    poll_id: string;
    title: string;
    end_time: string;
    current_consensus_points: number;
    min_consensus_points_to_win: number;
  };
  statement: Statement;
  onVote: (statementId: string, vote: 'support' | 'oppose' | 'unsure') => void;
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
  const [isVoting, setIsVoting] = useState(false);
  const [selectedVote, setSelectedVote] = useState<'support' | 'oppose' | 'unsure' | null>(null);
  const [showThankYou, setShowThankYou] = useState(false);

  const handleVote = async (vote: 'support' | 'oppose' | 'unsure') => {
    setSelectedVote(vote);
    setIsVoting(true);
    
    // Simulate API delay for better UX
    setTimeout(() => {
      onVote(statement.statement_id, vote);
      setIsVoting(false);
      setSelectedVote(null);
      
      // Check if this was the last statement
      if (userVoteCount + 1 >= totalStatements) {
        setShowThankYou(true);
      }
    }, 800);
  };

  const progressPercentage = (poll.current_consensus_points / poll.min_consensus_points_to_win) * 100;
  const userProgress = (userVoteCount / totalStatements) * 100;

  // Show thank you screen when voting is completed
  if (showThankYou) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="max-w-2xl mx-auto space-y-6 pt-16">
          <Card className="text-center">
            <CardContent className="p-12">
              <CheckCircle className="h-20 w-20 mx-auto mb-6 text-green-500" />
              <h2 className="text-3xl font-bold text-green-800 mb-4 hebrew-text">
                תודה רבה!
              </h2>
              <p className="text-lg text-gray-600 mb-6 hebrew-text leading-relaxed">
                השלמת את ההצבעה בהצלחה על כל {totalStatements} ההצהרות.
                <br />
                התרומה שלך עוזרת לבנות קונצנזוס בחברה הישראלית.
              </p>
              
              <div className="space-y-4">
                <Button 
                  onClick={onViewResults}
                  className="w-full py-4 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
                >
                  <BarChart3 className="h-5 w-5 ml-2" />
                  צפה בתוצאות הסקר
                </Button>
                
                <div className="text-sm text-gray-500 hebrew-text">
                  הסקר ממשיך לרוץ עד: <CountdownTimer endTime={poll.end_time} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Win Condition */}
          {progressPercentage >= 100 && (
            <Card className="bg-gradient-to-r from-green-100 to-blue-100 border-green-300">
              <CardContent className="p-6 text-center">
                <Trophy className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <h3 className="text-2xl font-bold text-green-800 mb-2">
                  ניצחון קבוצתי!
                </h3>
                <p className="text-green-700">
                  הצלחתם למצוא מספיק נקודות חיבור. כולם זוכים יחד!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gradient hebrew-text">
            {poll.title}
          </h1>
          <div className="flex justify-center items-center gap-4">
            <CountdownTimer endTime={poll.end_time} />
            <Badge variant="outline" className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              {poll.current_consensus_points}/{poll.min_consensus_points_to_win}
            </Badge>
          </div>
        </div>

        {/* Progress Indicators */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>ההתקדמות שלך</span>
                  <span>{userVoteCount}/{totalStatements}</span>
                </div>
                <Progress value={userProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>נקודות חיבור</span>
                  <span>{poll.current_consensus_points}/{poll.min_consensus_points_to_win}</span>
                </div>
                <Progress value={progressPercentage} className="h-2 consensus-gradient" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statement Card */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center pb-4">
            <div className="text-2xl font-semibold hebrew-text leading-relaxed p-6">
              {statement.content}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Voting Buttons */}
            <div className="grid grid-cols-3 gap-4">
              <Button
                onClick={() => handleVote('support')}
                disabled={isVoting}
                className={`vote-button bg-voting-support hover:bg-green-600 text-white ${
                  selectedVote === 'support' ? 'scale-110' : ''
                }`}
              >
                <ThumbsUp className="h-5 w-5 mb-1" />
                תומך
              </Button>
              
              <Button
                onClick={() => handleVote('unsure')}
                disabled={isVoting}
                className={`vote-button bg-voting-unsure hover:bg-yellow-600 text-white ${
                  selectedVote === 'unsure' ? 'scale-110' : ''
                }`}
              >
                <HelpCircle className="h-5 w-5 mb-1" />
                לא בטוח
              </Button>
              
              <Button
                onClick={() => handleVote('oppose')}
                disabled={isVoting}
                className={`vote-button bg-voting-oppose hover:bg-red-600 text-white ${
                  selectedVote === 'oppose' ? 'scale-110' : ''
                }`}
              >
                <ThumbsDown className="h-5 w-5 mb-1" />
                מתנגד
              </Button>
            </div>

            {isVoting && (
              <div className="text-center py-4">
                <div className="animate-pulse text-lg font-semibold text-blue-600">
                  רושם את הצבעתך...
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Win Condition */}
        {progressPercentage >= 100 && (
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-green-100 to-blue-100 border-green-300">
            <CardContent className="p-6 text-center">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <h3 className="text-2xl font-bold text-green-800 mb-2">
                ניצחון קבוצתי!
              </h3>
              <p className="text-green-700">
                הצלחתם למצוא מספיק נקודות חיבור. כולם זוכים יחד!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
