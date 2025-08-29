import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Vote, CheckCircle, Calendar } from 'lucide-react';
import { UserPoints } from '@/integrations/supabase/userPoints';
import { UserPollParticipation } from '@/integrations/supabase/userParticipation';

interface ProfileStatsProps {
  points: UserPoints;
  participation: UserPollParticipation[];
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({ points, participation }) => {
  const completedPolls = participation.filter(p => p.is_completed).length;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-[#66c8ca]/10 rounded-full mx-auto mb-2">
              <Vote className="h-6 w-6 text-[#66c8ca]" />
            </div>
            <div className="text-2xl font-bold">{points.votes_count}</div>
            <div className="text-sm text-muted-foreground hebrew-text">סה"כ הצבעות</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-[#ec0081]/10 rounded-full mx-auto mb-2">
              <CheckCircle className="h-6 w-6 text-[#ec0081]" />
            </div>
            <div className="text-2xl font-bold">{completedPolls}</div>
            <div className="text-sm text-muted-foreground hebrew-text">סקרים שהושלמו</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-[#1a305b]/10 rounded-full mx-auto mb-2">
              <Calendar className="h-6 w-6 text-[#1a305b]" />
            </div>
            <div className="text-2xl font-bold">{participation.length}</div>
            <div className="text-sm text-muted-foreground hebrew-text">סה"כ השתתפות</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};