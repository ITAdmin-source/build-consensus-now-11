
import React from 'react';
import { Poll } from '@/types/poll';
import { CountdownTimer } from './CountdownTimer';
import { VotingProgressBadge } from './VotingProgressBadge';
import { useVotingProgress } from '@/hooks/useVotingProgress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Users, Target, Star, Gamepad2, Trophy, Zap, Eye, Clock } from 'lucide-react';

interface PollCardProps {
  poll: Poll;
  onJoinPoll: (pollSlug: string) => void;
  variant?: 'active' | 'completed' | 'pending';
  statements?: any[];
  userVotes?: Record<string, string>;
}

export const PollCard: React.FC<PollCardProps> = ({ 
  poll, 
  onJoinPoll, 
  variant = 'active',
  statements = [],
  userVotes = {}
}) => {
  const progressPercentage = (poll.current_consensus_points / poll.min_consensus_points_to_win) * 100;
  const isWinning = poll.current_consensus_points >= poll.min_consensus_points_to_win;
  
  // Calculate voting progress
  const votingProgress = useVotingProgress(poll, statements, userVotes);
  
  const handleAction = () => {
    onJoinPoll(poll.slug || poll.poll_id);
  };

  // Use round end_time for countdown
  const endTime = poll.round?.end_time || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const startTime = poll.round?.start_time || new Date().toISOString();

  const getVariantStyles = () => {
    switch (variant) {
      case 'active':
        return {
          borderColor: 'border-[#ec0081]/30',
          accentColor: 'bg-[#ec0081]',
          buttonColor: 'bg-[#ec0081] hover:bg-[#ec0081]/90',
          buttonText: getButtonText(),
          buttonIcon: <Gamepad2 className="h-5 w-5 ml-2" />,
          disabled: false
        };
      case 'completed':
        return {
          borderColor: 'border-[#66c8ca]/30',
          accentColor: 'bg-[#66c8ca]',
          buttonColor: 'bg-[#66c8ca] hover:bg-[#66c8ca]/90',
          buttonText: 'צפה בתוצאות',
          buttonIcon: <Eye className="h-5 w-5 ml-2" />,
          disabled: false
        };
      case 'pending':
        return {
          borderColor: 'border-[#1a305b]/30',
          accentColor: 'bg-[#1a305b]',
          buttonColor: 'bg-gray-400 cursor-not-allowed',
          buttonText: 'בקרוב...',
          buttonIcon: <Clock className="h-5 w-5 ml-2" />,
          disabled: true
        };
    }
  };

  // Smart button text based on voting progress
  const getButtonText = () => {
    if (votingProgress.isComplete) {
      return 'צפה בתוצאות';
    }
    if (votingProgress.isStarted) {
      return 'המשך לשחק';
    }
    return 'שחק עכשיו!';
  };

  const styles = getVariantStyles();

  return (
    <Card className={`poll-card hebrew-text relative overflow-hidden group hover:shadow-2xl transition-all duration-500 border-2 border-gray-100 hover:${styles.borderColor} ${variant === 'active' ? 'transform hover:scale-105' : ''}`}>
      {/* Variant accent line */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${styles.accentColor}`}></div>
      
      {/* Voting Progress Badge - positioned in top-right */}
      {variant === 'active' && (
        <div className="absolute top-4 right-4 z-20">
          <VotingProgressBadge
            votedCount={votingProgress.votedCount}
            totalCount={votingProgress.totalCount}
            completionPercentage={votingProgress.completionPercentage}
            isComplete={votingProgress.isComplete}
            isStarted={votingProgress.isStarted}
            size="md"
          />
        </div>
      )}
      
      {/* Status indicators */}
      <div className="absolute top-4 left-4 z-10">
        {variant === 'completed' && isWinning && (
          <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse-slow">
            <Trophy className="h-3 w-3" />
            ניצחון!
          </div>
        )}
        {variant === 'pending' && (
          <div className={`${styles.accentColor} text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1`}>
            <Clock className="h-3 w-3" />
            בקרוב
          </div>
        )}
      </div>

      <CardHeader className="pb-4">
        <div className="flex justify-between items-start mb-3">
          <Badge 
            variant="secondary" 
            className={`text-xs bg-[#66c8ca]/20 text-[#66c8ca] border border-[#66c8ca]/30`}
          >
            🎮 {poll.category || 'אתגר כללי'}
          </Badge>
          <div className="flex items-center gap-2">
            <Zap className={`h-4 w-4 ${variant === 'active' ? 'text-[#ec0081] animate-pulse' : 'text-gray-400'}`} />
            {variant === 'pending' ? (
              <CountdownTimer endTime={startTime} className="text-sm font-semibold" />
            ) : (
              <CountdownTimer endTime={endTime} className="text-sm font-semibold" />
            )}
          </div>
        </div>
        <CardTitle className={`text-xl font-bold text-right leading-relaxed group-hover:${variant === 'active' ? 'text-[#ec0081]' : variant === 'completed' ? 'text-[#66c8ca]' : 'text-[#1a305b]'} transition-colors`}>
          {poll.title}
        </CardTitle>
        <p className="text-gray-600 text-right text-sm leading-relaxed">
          {poll.description}
        </p>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-5">
          {/* Progress Section */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-[#66c8ca]" />
                <span className="font-semibold">
                  {poll.current_consensus_points}/{poll.min_consensus_points_to_win}
                </span>
              </div>
              <span className="text-gray-600 flex items-center gap-1">
                <Trophy className="h-4 w-4" />
                נקודות חיבור
              </span>
            </div>
            <div className="relative">
              <Progress 
                value={progressPercentage} 
                className="h-4 rounded-full bg-gray-100"
              />
              <div 
                className={`absolute top-0 left-0 h-4 ${styles.accentColor} rounded-full transition-all duration-300`}
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
            
            {variant === 'completed' && isWinning && (
              <div className="flex items-center gap-2 text-orange-600 text-sm font-bold">
                <Star className="h-4 w-4 fill-current" />
                <span>🏆 הקהילה זכתה במשחק!</span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Users className="h-4 w-4 text-[#1a305b]" />
              <span className="font-medium">{poll.total_votes} הצבעות</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Gamepad2 className="h-4 w-4 text-[#ec0081]" />
              <span className="font-medium">{poll.total_statements} היגדים</span>
            </div>
          </div>

          {/* Action Button */}
          <Button 
            onClick={handleAction}
            className={`w-full py-4 text-lg font-bold ${styles.buttonColor} hover:shadow-xl transform transition-all duration-300 ${!styles.disabled ? 'hover:scale-105 active:scale-95' : ''} rounded-full text-white`}
            disabled={styles.disabled}
          >
            {styles.buttonIcon}
            {styles.buttonText}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
