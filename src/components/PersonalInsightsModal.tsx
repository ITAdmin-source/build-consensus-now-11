import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, X, Brain } from 'lucide-react';

interface PersonalInsightsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
  insights: string | null;
  error: string | null;
  onRetry?: () => void;
}

export const PersonalInsightsModal: React.FC<PersonalInsightsModalProps> = ({
  open,
  onOpenChange,
  isLoading,
  insights,
  error,
  onRetry
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold hebrew-text flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            התובנות האישיות שלך
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground hebrew-text">
                מנתח את דפוסי ההצבעה שלך...
              </p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="text-center">
                <p className="text-destructive hebrew-text mb-4">
                  אירעה שגיאה בעת יצירת התובנות
                </p>
                <p className="text-sm text-muted-foreground hebrew-text mb-4">
                  {error}
                </p>
                {onRetry && (
                  <Button onClick={onRetry} variant="outline" className="hebrew-text">
                    נסה שוב
                  </Button>
                )}
              </div>
            </div>
          )}

          {insights && !isLoading && !error && (
            <ScrollArea className="max-h-[50vh] pr-4">
              <div className="prose prose-sm max-w-none hebrew-text" dir="rtl">
                <div className="whitespace-pre-wrap leading-relaxed">
                  {insights}
                </div>
              </div>
            </ScrollArea>
          )}
        </div>

        {(insights || error) && (
          <div className="flex justify-end mt-6">
            <Button
              onClick={() => onOpenChange(false)}
              className="hebrew-text"
            >
              <X className="h-4 w-4 ml-2" />
              סגור
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};