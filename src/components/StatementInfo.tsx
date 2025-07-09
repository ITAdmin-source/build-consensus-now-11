
import React from 'react';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';

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
        className="w-96 max-w-md p-4 hebrew-text text-right" 
        align="center"
        side="bottom"
      >
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-foreground border-b pb-2">מידע נוסף</h4>
          <div className="max-h-64 overflow-y-auto">
            <MarkdownRenderer content={moreInfo} className="text-muted-foreground" />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
