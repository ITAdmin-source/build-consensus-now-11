import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Share2, BarChart3, Home, Users } from 'lucide-react';

interface MotivationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShare: () => void;
  onNavigateToResults: () => void;
  onNavigateToHome: () => void;
}

export const MotivationDialog: React.FC<MotivationDialogProps> = ({
  open,
  onOpenChange,
  onShare,
  onNavigateToResults,
  onNavigateToHome
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-md text-center [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-4 rounded-full">
              <Users className="h-12 w-12 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-xl font-bold hebrew-text">
            עזור לנו לקבל תוצאות מדויקות יותר
          </DialogTitle>
          <p className="text-muted-foreground hebrew-text">
            ככל שיותר אנשים ישתתפו בסקר, התוצאות יהיו מדויקות ומייצגות יותר. 
            שתף את הסקר עם חברים ובני משפחה כדי לקבל תמונה מלאה יותר של דעת הקהל.
          </p>
        </DialogHeader>

        <div className="space-y-3 mt-6">
          <Button
            onClick={() => {
              onShare();
              onOpenChange(false);
            }}
            className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 hebrew-text"
          >
            <Share2 className="h-4 w-4 ml-2" />
            שתף את הסקר
          </Button>

          <Button
            onClick={() => {
              onNavigateToResults();
              onOpenChange(false);
            }}
            variant="outline"
            className="w-full hebrew-text"
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
        </div>
      </DialogContent>
    </Dialog>
  );
};