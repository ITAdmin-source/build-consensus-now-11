
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Poll } from '@/types/poll';
import { CheckCircle, Activity } from 'lucide-react';
import { UserPoints } from '@/integrations/supabase/userPoints';
import { CompletionDialog } from './CompletionDialog';
import { MotivationDialog } from './MotivationDialog';
import { EarlyCompletionConfirmDialog } from './EarlyCompletionConfirmDialog';
import { PersonalInsightsModal } from './PersonalInsightsModal';
import { usePersonalInsights } from '@/hooks/usePersonalInsights';
import { useAuth } from '@/contexts/AuthContext';

interface VotingProgressProps {
  poll: Poll;
  userVoteCount: number;
  totalStatements: number;
  remainingStatements: number;
  userPoints: UserPoints;
  onNavigateToResults?: () => void;
  onNavigateToHome?: () => void;
  shouldShowCompletion?: boolean;
}

export const VotingProgress: React.FC<VotingProgressProps> = ({
  poll,
  userVoteCount,
  totalStatements,
  remainingStatements,
  userPoints,
  onNavigateToResults,
  onNavigateToHome,
  shouldShowCompletion = false
}) => {
  const { user } = useAuth();
  const personalProgress = (userVoteCount / totalStatements) * 100;
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [showMotivationDialog, setShowMotivationDialog] = useState(false);
  const [showEarlyCompletionConfirm, setShowEarlyCompletionConfirm] = useState(false);
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  
  const { isLoading, insights, error, generateInsights, clearInsights } = usePersonalInsights();

  const minVotesToEnd = poll.min_statements_voted_to_end || 5;
  const canEndNow = userVoteCount >= minVotesToEnd || remainingStatements === 0;
  const isFullCompletion = remainingStatements === 0;

  const handlePersonalInsights = async () => {
    setShowInsightsModal(true);
    clearInsights();
    await generateInsights(poll);
  };

  const handleRetryInsights = async () => {
    clearInsights();
    await generateInsights(poll);
  };

  const handleEndNowClick = () => {
    if (remainingStatements > 0) {
      setShowEarlyCompletionConfirm(true);
    } else {
      setShowCompletionDialog(true);
    }
  };

  const handleEarlyCompletionConfirm = () => {
    setShowCompletionDialog(true);
  };

  const handleNext = () => {
    setShowMotivationDialog(true);
  };

  const handleShare = () => {
    // Placeholder for share functionality
    console.log('Share functionality to be implemented');
  };

  // Auto-show completion dialog when triggered from parent
  React.useEffect(() => {
    if (shouldShowCompletion) {
      setShowCompletionDialog(true);
    }
  }, [shouldShowCompletion]);

  return (
    <div className="space-y-4">
      <Card className="mb-6">
        <CardContent className="p-6">
          {/* Personal Progress */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <span className="text-base font-medium hebrew-text">ההתקדמות שלך</span>
              </div>
              <Badge variant="outline" className="text-sm px-3 py-1">
                {userVoteCount}/{totalStatements}
              </Badge>
            </div>
            <Progress 
              value={personalProgress} 
              threshold={totalStatements > 0 ? (minVotesToEnd / totalStatements) * 100 : 0}
              className="h-3" 
            />
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground hebrew-text">
                {remainingStatements > 0 
                  ? `נותרו ${remainingStatements} הצהרות להצבעה`
                  : 'סיימת להצביע על כל ההצהרות!'
                }
              </p>
              {canEndNow ? (
                <Button
                  onClick={handleEndNowClick}
                  size="sm"
                  variant="outline"
                  className="hebrew-text"
                >
                  <CheckCircle className="h-4 w-4 ml-1" />
                  סיים עכשיו
                </Button>
              ) : (
                <Button
                  disabled
                  size="sm"
                  variant="outline"
                  className="hebrew-text opacity-50 cursor-not-allowed"
                  title={`עליך להצביע על לפחות ${minVotesToEnd - userVoteCount} הצהרות נוספות כדי לסיים`}
                >
                  <CheckCircle className="h-4 w-4 ml-1" />
                  סיים עכשיו
                </Button>
              )}
            </div>
            {!canEndNow && userVoteCount < minVotesToEnd && (
              <div className="text-xs text-amber-600 hebrew-text">
                עליך להצביע על לפחות {minVotesToEnd - userVoteCount} הצהרות נוספות לפני שתוכל לסיים ({userVoteCount}/{minVotesToEnd})
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <EarlyCompletionConfirmDialog
        open={showEarlyCompletionConfirm}
        onOpenChange={setShowEarlyCompletionConfirm}
        remainingStatements={remainingStatements}
        onContinueVoting={() => {}} // Just closes the dialog
        onEndAnyway={handleEarlyCompletionConfirm}
      />

      <CompletionDialog
        open={showCompletionDialog}
        onOpenChange={setShowCompletionDialog}
        onNavigateToResults={onNavigateToResults || (() => {})}
        onNavigateToHome={onNavigateToHome || (() => {})}
        onPersonalInsights={handlePersonalInsights}
        onNext={handleNext}
        isFullCompletion={isFullCompletion}
        isAuthenticated={!!user}
        pollSlug={poll.slug}
      />

      <MotivationDialog
        open={showMotivationDialog}
        onOpenChange={setShowMotivationDialog}
        onShare={handleShare}
        onNavigateToResults={onNavigateToResults || (() => {})}
        onNavigateToHome={onNavigateToHome || (() => {})}
      />

      <PersonalInsightsModal
        open={showInsightsModal}
        onOpenChange={setShowInsightsModal}
        isLoading={isLoading}
        insights={insights}
        error={error}
        onRetry={handleRetryInsights}
      />
    </div>
  );
};
