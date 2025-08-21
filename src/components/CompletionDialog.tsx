import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, Home, BarChart3, Brain, UserPlus, ArrowRight } from 'lucide-react';
import { Confetti } from './Confetti';
import { useReturnUrl } from '@/hooks/useReturnUrl';

interface CompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigateToResults: () => void;
  onNavigateToHome: () => void;
  onPersonalInsights: () => void;
  onNext: () => void;
  isFullCompletion: boolean;
  isAuthenticated: boolean;
  pollSlug?: string;
}

export const CompletionDialog: React.FC<CompletionDialogProps> = ({
  open,
  onOpenChange,
  onNavigateToResults,
  onNavigateToHome,
  onPersonalInsights,
  onNext,
  isFullCompletion,
  isAuthenticated,
  pollSlug
}) => {
  const { createAuthUrl } = useReturnUrl();

  const handleRegisterClick = () => {
    const authUrl = createAuthUrl('/auth');
    window.location.href = authUrl;
  };

  return (
    <>
      <Confetti show={open && isFullCompletion} />
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent 
          className="sm:max-w-md text-center [&>button]:hidden"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader className="space-y-4">
            <div className="flex justify-center">
              <div className={`bg-gradient-to-r p-4 rounded-full ${
                isFullCompletion 
                  ? 'from-yellow-100 to-orange-100 animate-pulse' 
                  : 'from-green-100 to-blue-100'
              }`}>
                <Trophy className={`h-12 w-12 ${
                  isFullCompletion ? 'text-yellow-500' : 'text-primary'
                }`} />
              </div>
            </div>
            <DialogTitle className="text-xl font-bold hebrew-text">
              {isFullCompletion ? 'כל הכבוד! סיימת את הסקר במלואו' : 'תודה על השתתפותך!'}
            </DialogTitle>
            <p className="text-muted-foreground hebrew-text">
              {isFullCompletion 
                ? 'מדהים! השלמת את כל ההצהרות. דעתך חשובה ותורמת משמעותית לתוצאות הסקר.'
                : 'תודה על השתתפותך הפעילה! הדעה שלך חשובה ותורמת לעיצוב התוצאות הסופיות.'
              }
            </p>
          </DialogHeader>

          <div className="space-y-3 mt-6">
            {!isAuthenticated && (
              <Button
                onClick={handleRegisterClick}
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 hebrew-text"
              >
                <UserPlus className="h-4 w-4 ml-2" />
                הירשם כדי לשמור את התובנות שלך
              </Button>
            )}

            <Button
              onClick={() => {
                onNext();
                onOpenChange(false);
              }}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hebrew-text"
            >
              <ArrowRight className="h-4 w-4 ml-2" />
              המשך
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
    </>
  );
};