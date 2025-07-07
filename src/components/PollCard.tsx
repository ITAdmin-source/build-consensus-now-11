
import React from 'react';
import { Poll } from '@/types/poll';
import { CountdownTimer } from './CountdownTimer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Users, Target, Star, Gamepad2, Trophy, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface PollCardProps {
  poll: Poll;
  onJoinPoll: (pollSlug: string) => void;
}

export const PollCard: React.FC<PollCardProps> = ({ poll, onJoinPoll }) => {
  const progressPercentage = (poll.current_consensus_points / poll.min_consensus_points_to_win) * 100;
  const isWinning = poll.current_consensus_points >= poll.min_consensus_points_to_win;
  const pollUrl = `${window.location.origin}/poll/${poll.slug}`;

  const handleJoinPoll = () => {
    onJoinPoll(poll.slug || poll.poll_id);
  };

  // Use round end_time for countdown
  const endTime = poll.round?.end_time || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  return (
    <Card className="poll-card hebrew-text relative overflow-hidden group hover:shadow-2xl transition-all duration-500 border-2 border-gray-100 hover:border-[#ec0081]/30">
      {/* Gaming accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#ec0081]"></div>
      
      {/* Victory indicator */}
      {isWinning && (
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse-slow">
            <Trophy className="h-3 w-3" />
            ניצחון!
          </div>
        </div>
      )}

      <CardHeader className="pb-4">
        <div className="flex justify-between items-start mb-3">
          <Badge 
            variant="secondary" 
            className="text-xs bg-[#66c8ca]/20 text-[#66c8ca] border border-[#66c8ca]/30"
          >
            🎮 {poll.category || 'אתגר כללי'}
          </Badge>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-[#ec0081] animate-pulse" />
            <CountdownTimer endTime={endTime} className="text-sm font-semibold" />
          </div>
        </div>
        <CardTitle className="text-xl font-bold text-right leading-relaxed group-hover:text-[#ec0081] transition-colors">
          {poll.title}
        </CardTitle>
        <p className="text-gray-600 text-right text-sm leading-relaxed">
          {poll.description}
        </p>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-5">
          {/* Victory Progress Section */}
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
                נקודות זכייה
              </span>
            </div>
            <div className="relative">
              <Progress 
                value={progressPercentage} 
                className="h-4 rounded-full bg-gray-100"
              />
              <div 
                className="absolute top-0 left-0 h-4 bg-[#ec0081] rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
            
            {isWinning && (
              <div className="flex items-center gap-2 text-orange-600 text-sm font-bold animate-bounce-gentle">
                <Star className="h-4 w-4 fill-current" />
                <span>🏆 ניצחון קבוצתי מושג!</span>
              </div>
            )}
          </div>

          {/* Gaming Stats */}
          <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Users className="h-4 w-4 text-[#1a305b]" />
              <span className="font-medium">{poll.total_votes} מהלכים</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Gamepad2 className="h-4 w-4 text-[#ec0081]" />
              <span className="font-medium">{poll.total_statements} הצהרות</span>
            </div>
          </div>

          {/* Play Button */}
          <Button 
            onClick={handleJoinPoll}
            className="w-full py-4 text-lg font-bold bg-[#ec0081] hover:bg-[#ec0081]/90 hover:shadow-xl transform transition-all duration-300 hover:scale-105 active:scale-95 rounded-full text-white"
            disabled={poll.status === 'closed'}
          >
            {poll.status === 'closed' ? (
              <>
                <Trophy className="h-5 w-5 ml-2" />
                המשחק הסתיים
              </>
            ) : (
              <>
                <Gamepad2 className="h-5 w-5 ml-2" />
                🎯 שחק עכשיו!
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
