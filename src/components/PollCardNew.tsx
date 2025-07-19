
import React from 'react';
import { Poll } from '@/types/poll';
import { CountdownTimer } from './CountdownTimer';
import { VotingProgressBadge } from './VotingProgressBadge';
import { useVotingProgress } from '@/hooks/useVotingProgress';
import { UserVotingProgress } from '@/integrations/supabase/userVotingProgress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Users, FileText, Target, Trophy, Eye, Clock, Play } from 'lucide-react';

interface PollCardNewProps {
  poll: Poll;
  onJoinPoll: (pollSlug: string) => void;
  variant: 'active' | 'completed' | 'pending';
  statements?: any[];
  userVotes?: Record<string, string>;
  summaryProgress?: UserVotingProgress | null;
  progressLoading?: boolean;
}

export const PollCardNew: React.FC<PollCardNewProps> = ({ 
  poll, 
  onJoinPoll, 
  variant,
  statements = [],
  userVotes = {},
  summaryProgress = null,
  progressLoading = false
}) => {
  const votingProgress = useVotingProgress(poll, statements, userVotes, summaryProgress);
  const consensusProgress = (poll.current_consensus_points / poll.min_consensus_points_to_win) * 100;
  const consensusAchieved = poll.current_consensus_points >= poll.min_consensus_points_to_win;

  const handleAction = () => {
    onJoinPoll(poll.slug || poll.poll_id);
  };

  const endTime = poll.round?.end_time || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const startTime = poll.round?.start_time || new Date().toISOString();

  const getCategoryEmoji = (category: string) => {
    const emojiMap: Record<string, string> = {
      'פוליטיקה': '🏛️',
      'חברה': '👥',
      'כלכלה': '💰',
      'טכנולוגיה': '💻',
      'בריאות': '🏥',
      'חינוך': '📚',
      'סביבה': '🌱'
    };
    return emojiMap[category] || '🎯';
  };

  const getButtonText = () => {
    if (variant === 'completed') return 'צפה בתוצאות';
    if (variant === 'pending') return 'בקרוב...';
    
    if (votingProgress.isComplete) return 'צפה בתוצאות';
    if (votingProgress.isStarted) return 'המשך הצבעה';
    return 'התחל להצביע';
  };

  if (variant === 'pending') {
    return (
      <Card className="w-full max-w-[320px] h-[180px] hebrew-text opacity-75 hover:opacity-90 transition-opacity">
        <CardContent className="p-3 h-full flex flex-col justify-between">
          <h3 className="text-lg font-bold text-right mb-1 leading-tight text-gray-700 line-clamp-2">
            {poll.title}
          </h3>
          
          <Badge 
            variant="secondary" 
            className="self-end mb-2 bg-[#66c8ca]/20 text-[#66c8ca] border border-[#66c8ca]/30 opacity-60 text-sm"
          >
            {getCategoryEmoji(poll.category)} {poll.category || 'אתגר כללי'}
          </Badge>
          
          <div className="text-center mb-2">
            <p className="text-sm text-gray-500 mb-1">מתחיל בעוד</p>
            <CountdownTimer 
              endTime={startTime} 
              className="text-sm font-bold text-[#1a305b]" 
              showIcon={false}
            />
          </div>
          
          <Button 
            disabled
            className="w-full bg-gray-400 cursor-not-allowed rounded-full py-2"
          >
            <Clock className="h-4 w-4 ml-2" />
            בקרוב...
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'completed') {
    return (
      <Card className="w-full max-w-[320px] h-[280px] hebrew-text hover:shadow-lg transition-shadow border-[#66c8ca]/30">
        <CardContent className="p-3 h-full flex flex-col justify-between">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-bold text-right leading-tight flex-1 line-clamp-2">
              {poll.title}
            </h3>
            {consensusAchieved && (
              <Trophy className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0" />
            )}
          </div>
          
          <Badge 
            variant="secondary" 
            className="self-end mb-2 bg-[#66c8ca]/20 text-[#66c8ca] border border-[#66c8ca]/30 text-sm"
          >
            {getCategoryEmoji(poll.category)} {poll.category || 'אתגר כללי'}
          </Badge>
          
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="bg-gray-50 p-2 rounded-lg text-center">
              <Users className="h-4 w-4 mx-auto mb-1 text-[#1a305b]" />
              <div className="text-sm font-bold">{poll.total_votes}</div>
              <div className="text-xs text-gray-600">הצבעות</div>
            </div>
            <div className="bg-gray-50 p-2 rounded-lg text-center">
              <FileText className="h-4 w-4 mx-auto mb-1 text-[#ec0081]" />
              <div className="text-sm font-bold">{poll.total_statements}</div>
              <div className="text-xs text-gray-600">היגדים</div>
            </div>
          </div>
          
          <div className="mb-2">
            <div className="flex justify-between items-center text-sm mb-1">
              <span className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                {poll.current_consensus_points}/{poll.min_consensus_points_to_win}
              </span>
              <span className="text-gray-600">נקודות הסכמה</span>
            </div>
            <Progress 
              value={Math.min(consensusProgress, 100)} 
              className="h-2 bg-gray-200"
            />
            {consensusAchieved && (
              <div className="text-xs text-orange-600 font-bold mt-1 flex items-center gap-1">
                <Trophy className="h-3 w-3" />
                הקהילה זכתה במשחק!
              </div>
            )}
          </div>
          
          <Button 
            onClick={handleAction}
            className="w-full bg-[#66c8ca] hover:bg-[#66c8ca]/90 text-white rounded-full py-2"
          >
            <Eye className="h-4 w-4 ml-2" />
            צפה בתוצאות
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Active Poll
  return (
    <Card className="w-full max-w-[320px] h-[260px] hebrew-text hover:shadow-xl transition-all duration-300 hover:scale-105 border-[#ec0081]/30">
      <CardContent className="p-3 h-full flex flex-col justify-between relative">
        {/* Voting Progress Badge - Top Right */}
        <div className="absolute top-3 right-3 z-10">
          {progressLoading ? (
            <div className="w-14 h-14 rounded-full bg-gray-100 animate-pulse flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-[#ec0081] rounded-full animate-spin"></div>
            </div>
          ) : (
            <VotingProgressBadge
              votedCount={votingProgress.votedCount}
              totalCount={votingProgress.totalCount}
              completionPercentage={votingProgress.completionPercentage}
              isComplete={votingProgress.isComplete}
              isStarted={votingProgress.isStarted}
              size="lg"
            />
          )}
        </div>
        
        <h3 className="text-lg font-bold text-right mb-2 leading-tight pr-16 hover:text-[#ec0081] transition-colors line-clamp-2">
          {poll.title}
        </h3>
        
        <Badge 
          variant="secondary" 
          className="self-end mb-2 bg-[#66c8ca]/20 text-[#66c8ca] border border-[#66c8ca]/30 text-sm"
        >
          {getCategoryEmoji(poll.category)} {poll.category || 'אתגר כללי'}
        </Badge>
        
        <div className="flex items-center justify-end gap-2 mb-2">
          <CountdownTimer 
            endTime={endTime} 
            className="text-sm font-semibold text-[#1a305b]" 
            compact
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-2 rounded-lg text-center">
            <Users className="h-4 w-4 mx-auto mb-1 text-[#1a305b]" />
            <div className="text-sm font-bold">{poll.total_votes}</div>
            <div className="text-xs text-gray-600">הצבעות</div>
          </div>
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-2 rounded-lg text-center">
            <FileText className="h-4 w-4 mx-auto mb-1 text-[#ec0081]" />
            <div className="text-sm font-bold">{poll.total_statements}</div>
            <div className="text-xs text-gray-600">היגדים</div>
          </div>
        </div>
        
        <Button 
          onClick={handleAction}
          className="w-full py-2 text-base font-bold bg-[#ec0081] hover:bg-[#ec0081]/90 text-white rounded-full hover:shadow-lg transform transition-all duration-300 hover:scale-105"
        >
          <Play className="h-5 w-5 ml-2" />
          {getButtonText()}
        </Button>
      </CardContent>
    </Card>
  );
};
