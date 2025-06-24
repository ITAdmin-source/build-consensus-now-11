
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { 
  MoreVertical, 
  Shield, 
  Users, 
  UserCheck, 
  Edit, 
  Key, 
  Trash2,
  Clock
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'participant' | 'poll_admin' | 'super_admin';
  created_at: string;
  assigned_at: string | null;
  last_sign_in_at: string | null;
}

interface UserCardProps {
  user: User;
  currentUserRole: string;
  currentUserId?: string;
  onRoleChange: (user: User) => void;
  onResetPassword: (user: User) => void;
  onDeleteUser: (user: User) => void;
  isLoading?: string | null;
}

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'super_admin':
      return <Shield className="h-4 w-4 text-blue-500" />;
    case 'poll_admin':
      return <UserCheck className="h-4 w-4 text-green-500" />;
    default:
      return <Users className="h-4 w-4 text-gray-500" />;
  }
};

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'super_admin':
      return 'מנהל ראשי';
    case 'poll_admin':
      return 'מנהל סקרים';
    default:
      return 'משתתף';
  }
};

const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case 'super_admin':
      return 'default';
    case 'poll_admin':
      return 'secondary';
    default:
      return 'outline';
  }
};

export const UserCard: React.FC<UserCardProps> = ({
  user,
  currentUserRole,
  currentUserId,
  onRoleChange,
  onResetPassword,
  onDeleteUser,
  isLoading
}) => {
  const isCurrentUser = currentUserId === user.id;
  const canManageUser = currentUserRole === 'super_admin' && !isCurrentUser;
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'מעולם לא התחבר';
    return new Date(dateString).toLocaleString('he-IL');
  };

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            {getRoleIcon(user.role)}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium truncate">
                  {user.full_name || user.email}
                </h4>
                {isCurrentUser && (
                  <Badge variant="outline" className="text-xs">
                    אתה
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate mb-2">
                {user.email}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={getRoleBadgeVariant(user.role)}>
                  {getRoleLabel(user.role)}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatDate(user.last_sign_in_at)}
                </div>
              </div>
            </div>
          </div>
          
          {canManageUser && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  disabled={!!isLoading}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onRoleChange(user)}>
                  <Edit className="h-4 w-4 ml-1" />
                  שנה תפקיד
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onResetPassword(user)}>
                  <Key className="h-4 w-4 ml-1" />
                  איפוס סיסמה
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDeleteUser(user)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 ml-1" />
                  הסר משתמש
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
