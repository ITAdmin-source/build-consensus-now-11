
import React from 'react';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-6 w-6 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50 ${className}`}
          aria-label="מידע נוסף על ההצהרה"
        >
          <Info className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] hebrew-text text-right">
        <DialogHeader className="text-right">
          <DialogTitle className="text-lg font-semibold text-foreground leading-relaxed text-right">
            {statementContent}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 max-h-96 overflow-y-auto">
          <MarkdownRenderer 
            content={moreInfo} 
            className="text-muted-foreground text-base leading-relaxed" 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
