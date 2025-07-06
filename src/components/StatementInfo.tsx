
import React from 'react';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface StatementInfoProps {
  moreInfo: string;
  className?: string;
}

export const StatementInfo: React.FC<StatementInfoProps> = ({ 
  moreInfo, 
  className = '' 
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-6 w-6 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50 ${className}`}
          aria-label="מידע נוסף על ההצהרה"
        >
          <Info className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 max-w-sm p-4 hebrew-text text-right" 
        align="center"
        side="bottom"
      >
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-gray-900">מידע נוסף</h4>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {moreInfo}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
};
