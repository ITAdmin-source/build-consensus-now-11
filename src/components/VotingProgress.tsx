
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Poll } from '@/types/poll';
import { CheckCircle, Trophy } from 'lucide-react';
import { UserPoints } from '@/integrations/supabase/userPoints';

interface VotingProgressProps {
  poll: Poll;
  userVoteCount: number;
  totalStatements: number;
  remainingStatements: number;
  userPoints: UserPoints;
}

export const VotingProgress: React.FC<VotingProgressProps> = ({
  poll,
  userVoteCount,
  totalStatements,
  remainingStatements,
  userPoints
}) => {
  const personalProgress = (userVoteCount / totalStatements) * 100;

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        {/* Personal Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium hebrew-text">ההתקדמות שלך</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {userVoteCount}/{totalStatements}
            </Badge>
          </div>
          <Progress value={personalProgress} className="h-2" />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground hebrew-text">
              {remainingStatements > 0 
                ? `נותרו ${remainingStatements} הצהרות להצבעה`
                : 'סיימת להצביע על כל ההצהרות!'
              }
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Trophy className="h-3 w-3 text-yellow-600" />
              <span className="hebrew-text">{userPoints.total_points} נקודות כוללות</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
