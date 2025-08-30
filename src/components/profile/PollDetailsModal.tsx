import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { ExternalLink, Vote, Heart, X, HelpCircle } from 'lucide-react';
import { UserPollParticipation } from '@/integrations/supabase/userParticipation';
import { UserInsight } from '@/integrations/supabase/userInsights';
import { useUserVotesWithStatements } from '@/hooks/useUserVotesWithStatements';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PollDetailsModalProps {
  poll: UserPollParticipation | null;
  insight?: UserInsight;
  open: boolean;
  onClose: () => void;
}

export const PollDetailsModal: React.FC<PollDetailsModalProps> = ({
  poll,
  insight,
  open,
  onClose,
}) => {
  const { votes, loading, error } = useUserVotesWithStatements(poll?.poll_id || null);

  const getVoteIcon = (voteValue: string) => {
    switch (voteValue) {
      case 'support':
        return <Heart className="h-3 w-3 text-green-600" />;
      case 'oppose':
        return <X className="h-3 w-3 text-red-600" />;
      case 'unsure':
        return <HelpCircle className="h-3 w-3 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getVoteText = (voteValue: string) => {
    switch (voteValue) {
      case 'support':
        return 'תמיכה';
      case 'oppose':
        return 'התנגדות';
      case 'unsure':
        return 'לא בטוח';
      default:
        return voteValue;
    }
  };

  const getVoteColor = (voteValue: string) => {
    switch (voteValue) {
      case 'support':
        return 'bg-green-100 text-green-800';
      case 'oppose':
        return 'bg-red-100 text-red-800';
      case 'unsure':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!poll) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="hebrew-text text-lg font-semibold leading-tight">
            {poll.poll_title}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 px-6">
          <div className="space-y-6 pb-6">
            {/* Votes Section */}
            <div>
              <h3 className="hebrew-text font-semibold mb-3 flex items-center gap-2">
                <Vote className="h-4 w-4" />
                ההצבעות שלך ({poll.vote_count})
              </h3>
              
              {loading && (
                <div className="space-y-1">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-2 py-1">
                      <Skeleton className="h-3 w-3" />
                      <Skeleton className="h-3 flex-1" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  ))}
                </div>
              )}
              
              {error && (
                <div className="text-center py-4">
                  <p className="text-destructive hebrew-text text-sm">{error}</p>
                </div>
              )}
              
              {!loading && !error && votes.length > 0 && (
                <div className="space-y-1">
                  {votes.map((vote) => (
                    <div key={vote.statement_id} className="flex items-center gap-2 py-1">
                      {getVoteIcon(vote.vote_value)}
                      <p className="hebrew-text text-xs flex-1 leading-tight truncate">
                        {vote.statement_text}
                      </p>
                      <Badge className={`${getVoteColor(vote.vote_value)} text-xs shrink-0 px-1.5 py-0`}>
                        {getVoteText(vote.vote_value)}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
              
              {!loading && !error && votes.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-muted-foreground hebrew-text text-sm">
                    לא נמצאו הצבעות עבור סקר זה
                  </p>
                </div>
              )}
            </div>

            {/* Personal Insight Section */}
            {insight && (
              <div>
                <h3 className="hebrew-text font-semibold mb-3">התובנה האישית שלך</h3>
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="hebrew-text text-sm leading-relaxed whitespace-pre-wrap">
                    {insight.insight_content}
                  </p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Action Button */}
        <div className="p-6 pt-0">
          <Link to={`/poll/${poll.poll_slug}`} className="w-full block">
            <Button variant="default" className="w-full hebrew-text">
              <ExternalLink className="h-4 w-4 ml-2" />
              עבור לסקר
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
};