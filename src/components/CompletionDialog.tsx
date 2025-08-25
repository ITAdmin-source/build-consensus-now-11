import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, Home, UserPlus, ArrowRight, Loader2, AlertCircle, ChevronDown, ChevronUp, Sparkles, Brain } from 'lucide-react';
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
          className="sm:max-w-lg text-center [&>button]:hidden max-h-[95vh] overflow-y-auto border-0 shadow-2xl bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 backdrop-blur-sm"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader className="space-y-6 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
            
            <div className="flex justify-center relative z-10">
              <div className={`p-4 rounded-2xl shadow-lg relative overflow-hidden ${
                isFullCompletion 
                  ? 'bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 animate-bounce' 
                  : 'bg-gradient-to-br from-green-400 via-blue-500 to-purple-500 animate-bounce'
              }`}>
                {/* Sparkle effect for full completion */}
                {isFullCompletion && (
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-200/30 to-orange-200/30 animate-pulse rounded-2xl"></div>
                )}
                <Trophy className="h-12 w-12 text-white drop-shadow-sm relative z-10" />
              </div>
            </div>
            
            <div className="space-y-3 relative z-10">
              <DialogTitle className={`text-2xl font-bold bg-clip-text text-transparent hebrew-text ${
                isFullCompletion 
                  ? 'bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600' 
                  : 'bg-gradient-to-r from-green-600 via-blue-600 to-purple-600'
              }`}>
                {isFullCompletion ? 'כל הכבוד! סיימת את הסקר במלואו' : 'תודה על השתתפותך!'}
              </DialogTitle>
              <p className="text-gray-600 hebrew-text font-medium leading-relaxed">
                {isFullCompletion 
                  ? 'מדהים! השלמת את כל ההצהרות. דעתך חשובה ותורמת משמעותית לתוצאות הסקר.'
                  : 'תודה על השתתפותך הפעילה! הדעה שלך חשובה ותורמת לעיצוב התוצאות הסופיות.'
                }
              </p>
            </div>
          </DialogHeader>

          {/* Enhanced Personal Insights Section */}
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] mt-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="bg-gradient-to-r from-purple-400 to-pink-500 p-2 rounded-xl">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <h4 className="text-base font-bold text-gray-800 hebrew-text">תובנות אישיות מהסקר</h4>
              {insights && <Sparkles className="h-4 w-4 text-purple-500 animate-pulse" />}
            </div>
            
            {insightsLoading && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/30 rounded-xl p-4">
                <div className="flex items-center justify-center gap-3 text-gray-700 hebrew-text">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                  <span className="font-medium">יוצר תובנות אישיות בשבילך...</span>
                </div>
              </div>
            )}

            {insightsError && (
              <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-center gap-2 text-red-700 hebrew-text">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">{insightsError}</span>
                </div>
                <Button
                  onClick={handleRetryInsights}
                  size="sm"
                  variant="outline"
                  className="w-full text-sm hebrew-text border-red-200 hover:bg-red-50 rounded-xl"
                >
                  נסה שוב
                </Button>
              </div>
            )}

            {insights && !insightsLoading && !insightsError && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200/30 rounded-xl p-4">
                  <div className="text-sm text-gray-800 hebrew-text leading-relaxed font-medium">
                    {displayText}
                  </div>
                </div>
                
                {hasMore && (
                  <Button
                    onClick={() => setShowFullInsights(!showFullInsights)}
                    size="sm"
                    variant="ghost"
                    className="w-full text-sm text-purple-600 hebrew-text hover:bg-purple-50 rounded-xl font-semibold transition-all duration-300"
                  >
                    {showFullInsights ? (
                      <>
                        <ChevronUp className="h-4 w-4 ml-1" />
                        הראה פחות
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 ml-1" />
                        הראה יותר
                      </>
                    )}
                  </Button>
                )}
                
                {!isAuthenticated && (
                  <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/30 rounded-xl p-3">
                    <div className="text-xs text-amber-700 hebrew-text font-medium text-center">
                      הירשם כדי לשמור את התובנות שלך לצפייה עתידית
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Enhanced Action Buttons */}
          <div className="space-y-3 mt-8 pt-6 border-t border-gray-200/50">
            {!isAuthenticated && (
              <Button
                onClick={handleRegisterClick}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white hebrew-text font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border-0"
              >
                <UserPlus className="h-5 w-5 ml-2 drop-shadow-sm" />
                הירשם כדי לשמור את התובנות שלך
              </Button>
            )}

            <Button
              onClick={() => {
                onNext();
                onOpenChange(false);
              }}
              className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white hebrew-text font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border-0"
            >
              <ArrowRight className="h-5 w-5 ml-2 drop-shadow-sm" />
              המשך
            </Button>

            <Button
              onClick={() => {
                onNavigateToHome();
                onOpenChange(false);
              }}
              variant="outline"
              className="w-full hebrew-text font-semibold py-3 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 transform hover:scale-[1.02] bg-white/50 backdrop-blur-sm"
            >
              <Home className="h-5 w-5 ml-2 text-blue-600" />
              חזור לעמוד הבית
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};