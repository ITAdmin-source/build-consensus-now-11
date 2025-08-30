import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Vote, Eye, CheckCircle } from 'lucide-react';
import { UserPollParticipation } from '@/integrations/supabase/userParticipation';
import { UserInsight } from '@/integrations/supabase/userInsights';
import { extractTextExcerpt } from '@/utils/textExcerpt';
import { PollDetailsModal } from './PollDetailsModal';

interface PollCardProps {
  poll: UserPollParticipation;
  insight?: UserInsight;
}

export const PollCard: React.FC<PollCardProps> = ({ poll, insight }) => {
  const [showModal, setShowModal] = useState(false);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'פעיל';
      case 'closed':
        return 'הסתיים';
      case 'draft':
        return 'טיוטה';
      default:
        return status;
    }
  };

  const insightExcerpt = insight ? extractTextExcerpt(insight.insight_content) : null;

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open modal if clicking on action buttons
    const target = e.target as Element;
    if (target.closest('button') || target.closest('a')) {
      return;
    }
    setShowModal(true);
  };

  return (
    <>
      <Card 
        className="h-full hover:shadow-md transition-shadow cursor-pointer" 
        onClick={handleCardClick}
      >
        <CardContent className="p-4">
        <div className="space-y-3">
          {/* Poll Title and Status */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm leading-tight hebrew-text line-clamp-2">
              {poll.poll_title}
            </h3>
            <Badge className={`text-xs ${getStatusColor(poll.poll_status)} shrink-0`}>
              {getStatusLabel(poll.poll_status)}
            </Badge>
          </div>

          {/* Vote Count and Completion Status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Vote className="h-4 w-4 text-[#66c8ca]" />
              <span className="text-sm font-medium">{poll.vote_count}</span>
              <span className="text-xs text-muted-foreground hebrew-text">הצבעות</span>
            </div>
            {poll.is_completed && (
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-xs text-green-600 hebrew-text">הושלם</span>
              </div>
            )}
          </div>

          {/* Personal Insight Excerpt */}
          {insightExcerpt && (
            <div className="bg-muted/30 rounded-md p-3">
              <p className="text-xs text-muted-foreground hebrew-text mb-1">התובנה האישית שלך:</p>
              <p className="text-sm hebrew-text leading-relaxed">
                {insightExcerpt.excerpt}
                {insightExcerpt.hasMore && '...'}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {poll.poll_status === 'active' && !poll.is_completed ? (
              <Link to={`/poll/${poll.poll_slug}`} className="flex-1">
                <Button variant="default" size="sm" className="w-full hebrew-text text-xs">
                  <Vote className="h-3 w-3 ml-1" />
                  המשך הצבעה
                </Button>
              </Link>
            ) : (
              <Link to={`/poll/${poll.poll_slug}`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full hebrew-text text-xs">
                  <Eye className="h-3 w-3 ml-1" />
                  צפה בתוצאות
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>

    <PollDetailsModal
      poll={poll}
      insight={insight}
      open={showModal}
      onClose={() => setShowModal(false)}
    />
    </>
  );
};