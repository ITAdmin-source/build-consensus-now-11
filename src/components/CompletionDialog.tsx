import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, Home, BarChart3, Brain } from 'lucide-react';

interface CompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigateToResults: () => void;
  onNavigateToHome: () => void;
  onPersonalInsights: () => void;
}

export const CompletionDialog: React.FC<CompletionDialogProps> = ({
  open,
  onOpenChange,
  onNavigateToResults,
  onNavigateToHome,
  onPersonalInsights
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="bg-gradient-to-r from-green-100 to-blue-100 p-4 rounded-full">
              <Trophy className="h-12 w-12 text-yellow-500" />
            </div>
          </div>
          <DialogTitle className="text-xl font-bold hebrew-text">
            כל הכבוד! סיימת את הסקר
          </DialogTitle>
          <p className="text-muted-foreground hebrew-text">
            תודה על השתתפותך הפעילה! הדעה שלך חשובה ותורמת לעיצוב התוצאות הסופיות.
          </p>
        </DialogHeader>

        <div className="space-y-3 mt-6">
          <Button
            onClick={() => {
              onNavigateToResults();
              onOpenChange(false);
            }}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hebrew-text"
          >
            <BarChart3 className="h-4 w-4 ml-2" />
            צפה בתוצאות הסקר
          </Button>

          <Button
            onClick={() => {
              onNavigateToHome();
              onOpenChange(false);
            }}
            variant="outline"
            className="w-full hebrew-text"
          >
            <Home className="h-4 w-4 ml-2" />
            חזור לעמוד הבית
          </Button>

          <Button
            onClick={() => {
              onPersonalInsights();
              onOpenChange(false);
            }}
            variant="outline"
            className="w-full hebrew-text"
          >
            <Brain className="h-4 w-4 ml-2" />
            תובנות אישיות
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};