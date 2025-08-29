import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PollCard } from './PollCard';
import { UserPollParticipation } from '@/integrations/supabase/userParticipation';
import { UserInsight } from '@/integrations/supabase/userInsights';
import { Skeleton } from '@/components/ui/skeleton';

interface PollParticipationGridProps {
  participation: UserPollParticipation[];
  insights: UserInsight[];
  loading: boolean;
  error: string | null;
}

export const PollParticipationGrid: React.FC<PollParticipationGridProps> = ({
  participation,
  insights,
  loading,
  error
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="hebrew-text">הסקרים שלי</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="hebrew-text">הסקרים שלי</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-destructive hebrew-text">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (participation.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="hebrew-text">הסקרים שלי</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground hebrew-text">
              עדיין לא השתתפת בסקרים. התחל להצביע כדי לראות את ההשתתפות שלך כאן!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="hebrew-text">הסקרים שלי</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {participation.map((poll) => {
            const pollInsight = insights.find(i => i.poll_id === poll.poll_id);
            return (
              <PollCard
                key={poll.poll_id}
                poll={poll}
                insight={pollInsight}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};