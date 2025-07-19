
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';

interface UserAvatarProps {
  avatarUrl?: string | null;
  displayName?: string | null;
  email?: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  avatarUrl,
  displayName,
  email,
  size = 'md',
  onClick,
  className = '',
}) => {
  const getInitials = () => {
    if (displayName) {
      const names = displayName.split(' ');
      if (names.length >= 2) {
        return names[0][0] + names[1][0];
      }
      return names[0][0];
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  };

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const AvatarComponent = (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      <AvatarImage src={avatarUrl || undefined} alt={displayName || 'Avatar'} />
      <AvatarFallback className="bg-[#66c8ca] text-[#1a305b] font-semibold">
        {avatarUrl ? undefined : getInitials()}
      </AvatarFallback>
    </Avatar>
  );

  if (onClick) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={onClick}
        className="rounded-full p-0 hover:bg-transparent"
      >
        {AvatarComponent}
      </Button>
    );
  }

  return AvatarComponent;
};
