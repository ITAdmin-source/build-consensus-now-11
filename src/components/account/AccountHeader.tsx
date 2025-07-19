
import React from 'react';
import { UserAvatar } from '@/components/UserAvatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Calendar, BarChart3 } from 'lucide-react';
import { UserPoints } from '@/integrations/supabase/userPoints';

interface AccountHeaderProps {
  user: any;
  profile: any;
  points: UserPoints;
}

export const AccountHeader: React.FC<AccountHeaderProps> = ({ user, profile, points }) => {
  const joinedDate = new Date(user.created_at).toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'long'
  });

  return (
    <Card className="overflow-hidden bg-gradient-to-r from-[#1a305b] to-[#66c8ca] text-white">
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Avatar Section */}
          <div className="relative">
            <UserAvatar
              avatarUrl={profile?.avatar_url}
              displayName={profile?.display_name}
              email={user.email}
              size="lg"
              className="h-24 w-24 border-4 border-white/20"
            />
            <div className="absolute -bottom-2 -right-2">
              <Badge variant="secondary" className="bg-[#ec0081] text-white border-0">
                <Trophy className="h-3 w-3 mr-1" />
                {points.total_points}
              </Badge>
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 text-center md:text-right">
            <h1 className="text-3xl font-bold mb-2">
              {profile?.display_name || 'משתמש'}
            </h1>
            <p className="text-white/80 mb-4">
              {profile?.bio || 'ברוך הבא לפלטפורמת נקודות החיבור'}
            </p>
            <div className="flex items-center justify-center md:justify-end gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>הצטרף ב{joinedDate}</span>
              </div>
              <div className="flex items-center gap-1">
                <BarChart3 className="h-4 w-4" />
                <span>{points.votes_count} הצבעות</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-2xl font-bold">{points.total_points}</div>
              <div className="text-xs text-white/80">נקודות</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-2xl font-bold">{points.votes_count}</div>
              <div className="text-xs text-white/80">הצבעות</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-2xl font-bold">-</div>
              <div className="text-xs text-white/80">תובנות</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
