import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, BarChart3, Users } from 'lucide-react';
import { UserPollParticipation as UserPollParticipationType } from '@/integrations/supabase/userParticipation';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

interface UserPollParticipationProps {
  participation: UserPollParticipationType[];
  loading: boolean;
  error: string | null;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'completed':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'draft':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'active':
      return 'פעיל';
    case 'completed':
      return 'הושלם';
    case 'draft':
      return 'טיוטה';
    default:
      return status;
  }
};

export const UserPollParticipation: React.FC<UserPollParticipationProps> = ({
  participation,
  loading,
  error
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            הסקרים שלי
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
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
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            הסקרים שלי
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (participation.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            הסקרים שלי
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">עדיין לא השתתפת בשום סקר</p>
            <p className="text-sm text-muted-foreground mt-2">
              מצא סקר פעיל והתחל להצביע כדי לראות את ההיסטוריה שלך כאן
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          הסקרים שלי ({participation.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {participation.map((poll) => (
            <div
              key={poll.poll_id}
              className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-lg">{poll.poll_title}</h3>
                <Badge variant="outline" className={getStatusColor(poll.poll_status)}>
                  {getStatusLabel(poll.poll_status)}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                <span className="flex items-center gap-1">
                  <BarChart3 className="h-4 w-4" />
                  {poll.vote_count} הצבעות
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(poll.last_vote_at), 'dd/MM/yyyy')}
                </span>
              </div>
              
              <div className="flex gap-2">
                {poll.poll_status === 'active' && (
                  <Button asChild size="sm" variant="default">
                    <Link to={`/poll/${poll.poll_slug}`}>
                      המשך הצבעה
                    </Link>
                  </Button>
                )}
                <Button asChild size="sm" variant="outline">
                  <Link to={`/poll/${poll.poll_slug}/results`}>
                    צפה בתוצאות
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};