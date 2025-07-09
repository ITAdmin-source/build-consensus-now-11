
import React from 'react';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';

interface StatementInfoProps {
  moreInfo: string;
  statementContent?: string;
  className?: string;
}

export const StatementInfo: React.FC<StatementInfoProps> = ({ 
  moreInfo, 
  statementContent,
  className = '' 
}) => {
  const truncateStatement = (text: string, maxLength: number = 60) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-6 w-6 p-0 text-[#1a305b] hover:text-[#1a305b]/80 hover:bg-[#1a305b]/10 ${className}`}
          aria-label="מידע נוסף על ההצהרה"
        >
          <Info className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-96 lg:w-[500px] max-h-[70vh] overflow-y-auto p-0 hebrew-text text-right" 
        align="center"
        side="bottom"
        sideOffset={8}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 pb-3">
          {statementContent && (
            <div className="mb-2">
              <h3 className="font-medium text-base text-gray-900 leading-tight">
                {truncateStatement(statementContent)}
              </h3>
            </div>
          )}
          <h4 className="font-medium text-sm text-[#1a305b]">מידע נוסף</h4>
        </div>
        
        <div className="p-4 pt-3">
          <div className="text-base text-gray-700 leading-relaxed">
            <MarkdownRenderer content={moreInfo} />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
