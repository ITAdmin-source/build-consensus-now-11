
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Vote, Target, Edit, Trash2 } from 'lucide-react';
import type { Poll } from '@/types/poll';

interface PollCardProps {
  poll: Poll;
  onEdit: (pollId: string) => void;
  onDelete: (pollId: string, pollTitle: string) => void;
}

export const PollCard: React.FC<PollCardProps> = ({ poll, onEdit, onDelete }) => {
  const formatEndTime = (endTime: string) => {
    const date = new Date(endTime);
    return date.toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Use round end_time for display
  const endTime = poll.round?.end_time || new Date().toISOString();

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">{poll.title}</h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                {poll.current_consensus_points}/{poll.min_consensus_points_to_win} נק' חיבור
              </div>
              <div className="flex items-center gap-1">
                <Vote className="h-4 w-4" />
                {poll.total_votes} הצבעות
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {poll.total_statements} הצהרות
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <span>תאריך סיום: {formatEndTime(endTime)}</span>
              {poll.round && (
                <span className="block">סיבוב: {poll.round.title}</span>
              )}
            </div>
          </div>
          <Badge variant={poll.status === 'active' ? 'default' : 'secondary'}>
            {poll.status === 'active' ? 'פעיל' : poll.status === 'closed' ? 'סגור' : 'טיוטה'}
          </Badge>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEdit(poll.poll_id)}
          >
            <Edit className="h-4 w-4 ml-1" />
            עריכה
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onDelete(poll.poll_id, poll.title)}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 ml-1" />
            מחק
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
