
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface UserSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const UserSearch: React.FC<UserSearchProps> = ({
  searchQuery,
  onSearchChange
}) => {
  return (
    <div className="relative">
      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input
        placeholder="חפש משתמשים..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pr-10"
      />
    </div>
  );
};
