import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowRight, RotateCcw } from 'lucide-react';

interface EarlyCompletionConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  remainingStatements: number;
  onContinueVoting: () => void;
  onEndAnyway: () => void;
}

export const EarlyCompletionConfirmDialog: React.FC<EarlyCompletionConfirmDialogProps> = ({
  open,
  onOpenChange,
  remainingStatements,
  onContinueVoting,
  onEndAnyway
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="bg-gradient-to-r from-amber-100 to-orange-100 p-4 rounded-full">
              <AlertTriangle className="h-12 w-12 text-amber-500" />
            </div>
          </div>
          <DialogTitle className="text-xl font-bold hebrew-text">
            בטוח שאתה רוצה לסיים?
          </DialogTitle>
          <p className="text-muted-foreground hebrew-text">
            נותרו לך רק <span className="font-bold text-primary">{remainingStatements}</span> הצהרות!
            <br />
            סיים את כל הסקר כדי לזכות בעוד נקודות!
          </p>
        </DialogHeader>

        <div className="space-y-3 mt-6">
          <Button
            onClick={() => {
              onContinueVoting();
              onOpenChange(false);
            }}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hebrew-text"
          >
            <RotateCcw className="h-4 w-4 ml-2" />
            חזור להצביע
          </Button>

          <Button
            onClick={() => {
              onEndAnyway();
              onOpenChange(false);
            }}
            variant="outline"
            className="w-full hebrew-text"
          >
            <ArrowRight className="h-4 w-4 ml-2" />
            סיים בכל זאת
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};