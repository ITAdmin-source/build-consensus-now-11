
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCard } from './UserCard';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'participant' | 'poll_admin' | 'super_admin';
  created_at: string;
  assigned_at: string | null;
  last_sign_in_at: string | null;
}

interface UserSectionProps {
  title: string;
  icon: React.ReactNode;
  users: User[];
  currentUserRole: string;
  currentUserId?: string;
  onRoleChange: (user: User) => void;
  onResetPassword: (user: User) => void;
  onDeleteUser: (user: User) => void;
  isLoading?: string | null;
  showAll?: boolean;
  maxDisplay?: number;
}

export const UserSection: React.FC<UserSectionProps> = ({
  title,
  icon,
  users,
  currentUserRole,
  currentUserId,
  onRoleChange,
  onResetPassword,
  onDeleteUser,
  isLoading,
  showAll = false,
  maxDisplay = 10
}) => {
  const displayUsers = showAll ? users : users.slice(0, maxDisplay);
  const hasMore = users.length > maxDisplay && !showAll;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {icon}
        <h4 className="text-md font-medium">{title} ({users.length})</h4>
      </div>
      <div className="grid gap-4">
        {displayUsers.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            currentUserRole={currentUserRole}
            currentUserId={currentUserId}
            onRoleChange={onRoleChange}
            onResetPassword={onResetPassword}
            onDeleteUser={onDeleteUser}
            isLoading={isLoading}
          />
        ))}
        {hasMore && (
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-muted-foreground">
                ועוד {users.length - maxDisplay} משתתפים...
              </p>
              <Button variant="outline" size="sm" className="mt-2">
                הצג הכל
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
