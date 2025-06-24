
import React from 'react';
import { Poll } from '@/types/poll';
import { CountdownTimer } from './CountdownTimer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Users, Target, Star, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface PollCardProps {
  poll: Poll;
  onJoinPoll: (pollSlug: string) => void;
}

export const PollCard: React.FC<PollCardProps> = ({ poll, onJoinPoll }) => {
  const progressPercentage = (poll.current_consensus_points / poll.min_consensus_points_to_win) * 100;
  const isWinning = poll.current_consensus_points >= poll.min_consensus_points_to_win;
  const pollUrl = `${window.location.origin}/poll/${poll.slug}`;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(pollUrl);
      toast.success('קישור הסקר הועתק ללוח');
    } catch (error) {
      console.error('Failed to copy URL:', error);
      toast.error('שגיאה בהעתקת הקישור');
    }
  };

  const handleJoinPoll = () => {
    onJoinPoll(poll.slug || poll.poll_id);
  };

  return (
    <Card className="poll-card hebrew-text">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="secondary" className="text-xs">
            {poll.category}
          </Badge>
          <CountdownTimer endTime={poll.end_time} className="text-sm" />
        </div>
        <CardTitle className="text-xl font-bold text-right leading-relaxed">
          {poll.title}
        </CardTitle>
        <p className="text-muted-foreground text-right text-sm leading-relaxed">
          {poll.description}
        </p>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Progress Section */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                {poll.current_consensus_points}/{poll.min_consensus_points_to_win}
              </span>
              <span className="text-muted-foreground">נקודות חיבור</span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-3 consensus-gradient"
            />
            {isWinning && (
              <div className="flex items-center gap-2 text-consensus-600 text-sm font-semibold">
                <Star className="h-4 w-4 fill-current" />
                <span>ניצחון קבוצתי!</span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{poll.total_votes} הצבעות</span>
            </div>
            <div>
              <span>{poll.total_statements} הצהרות</span>
            </div>
          </div>

          {/* Poll URL */}
          {poll.slug && (
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground truncate flex-1">
                /poll/{poll.slug}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleCopyUrl}
                className="h-6 w-6 p-0"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          )}

          {/* Action Button */}
          <Button 
            onClick={handleJoinPoll}
            className="w-full vote-button bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            disabled={poll.status === 'closed'}
          >
            {poll.status === 'closed' ? 'הסקר נסגר' : 'הצטרף לסקר'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
