
import React from 'react';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';

interface StatementInfoProps {
  statementContent: string;
  moreInfo: string;
  className?: string;
}

export const StatementInfo: React.FC<StatementInfoProps> = ({ 
  statementContent,
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
        className="w-[500px] max-w-[90vw] p-6 hebrew-text text-right" 
        align="center"
        side="bottom"
      >
        <div className="space-y-4">
          <div className="border-b pb-3">
            <h4 className="font-semibold text-base text-foreground leading-relaxed">
              {statementContent}
            </h4>
          </div>
          <div className="max-h-80 overflow-y-auto">
            <MarkdownRenderer 
              content={moreInfo} 
              className="text-muted-foreground text-base leading-relaxed" 
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
