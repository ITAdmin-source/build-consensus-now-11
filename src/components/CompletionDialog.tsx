import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, Home, UserPlus, ArrowRight, Loader2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Confetti } from './Confetti';
import { useReturnUrl } from '@/hooks/useReturnUrl';
import { usePersonalInsights } from '@/hooks/usePersonalInsights';
import { useAuth } from '@/contexts/AuthContext';
import { Poll } from '@/types/poll';
import { extractTextExcerpt } from '@/utils/textExcerpt';

interface CompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigateToResults: () => void;
  onNavigateToHome: () => void;
  onNext: () => void;
  isFullCompletion: boolean;
  isAuthenticated: boolean;
  poll: Poll;
}

export const CompletionDialog: React.FC<CompletionDialogProps> = ({
  open,
  onOpenChange,
  onNavigateToResults,
  onNavigateToHome,
  onNext,
  isFullCompletion,
  isAuthenticated,
  poll
}) => {
  const { createAuthUrl } = useReturnUrl();
  const { user } = useAuth();
  const { isLoading: insightsLoading, insights, error: insightsError, generateInsights, clearInsights } = usePersonalInsights();
  const [showFullInsights, setShowFullInsights] = useState(false);

  const handleRegisterClick = () => {
    const authUrl = createAuthUrl('/auth');
    window.location.href = authUrl;
  };

  const handleRetryInsights = () => {
    clearInsights();
    generateInsights(poll);
  };

  // Auto-generate insights when dialog opens
  useEffect(() => {
    if (open) {
      clearInsights();
      generateInsights(poll);
    }
  }, [open, poll.poll_id]);

  const { excerpt, hasMore } = insights ? extractTextExcerpt(insights) : { excerpt: '', hasMore: false };
  const displayText = showFullInsights ? insights : excerpt;

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

          {/* Personal Insights Section */}
          <div className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg p-4 space-y-3">
            <h4 className="text-sm font-semibold text-primary hebrew-text">תובנות אישיות מהסקר</h4>
            
            {insightsLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground hebrew-text">
                <Loader2 className="h-4 w-4 animate-spin" />
                יוצר תובנות אישיות בשבילך...
              </div>
            )}

            {insightsError && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-destructive hebrew-text">
                  <AlertCircle className="h-4 w-4" />
                  {insightsError}
                </div>
                <Button
                  onClick={handleRetryInsights}
                  size="sm"
                  variant="outline"
                  className="text-xs hebrew-text"
                >
                  נסה שוב
                </Button>
              </div>
            )}

            {insights && !insightsLoading && !insightsError && (
              <div className="space-y-2">
                <div className="text-sm text-foreground hebrew-text leading-relaxed">
                  {displayText}
                </div>
                {hasMore && (
                  <Button
                    onClick={() => setShowFullInsights(!showFullInsights)}
                    size="sm"
                    variant="ghost"
                    className="text-xs text-primary hebrew-text h-auto p-1"
                  >
                    {showFullInsights ? (
                      <>
                        <ChevronUp className="h-3 w-3 ml-1" />
                        הראה פחות
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3 w-3 ml-1" />
                        הראה יותר
                      </>
                    )}
                  </Button>
                )}
                {!isAuthenticated && (
                  <div className="text-xs text-muted-foreground hebrew-text">
                    הירשם כדי לשמור את התובנות שלך לצפייה עתידית
                  </div>
                )}
              </div>
            )}
          </div>

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
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};