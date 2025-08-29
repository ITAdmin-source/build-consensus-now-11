import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/UserAvatar';
import { Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { UserPoints } from '@/integrations/supabase/userPoints';

interface ProfileHeaderProps {
  user: any;
  profile: any;
  points: UserPoints;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, profile, points }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between">
        {/* Left side - Avatar and Name */}
        <div className="flex items-center gap-4">
          <UserAvatar
            avatarUrl={profile?.avatar_url}
            displayName={profile?.display_name}
            email={user?.email}
            size="lg"
          />
          <div>
            <h1 className="text-2xl font-bold hebrew-text">
              {profile?.display_name || user?.email?.split('@')[0] || 'משתמש'}
            </h1>
            <p className="text-muted-foreground hebrew-text">
              חבר מאז {new Date(user?.created_at).toLocaleDateString('he-IL')}
            </p>
          </div>
        </div>

        {/* Right side - Points and Leaderboard */}
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-lg px-4 py-2 font-bold">
            {points.total_points} נקודות
          </Badge>
          <Link to="/leaderboard">
            <Button variant="default" className="hebrew-text">
              <Trophy className="h-4 w-4 ml-2" />
              לוח המובילים
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};