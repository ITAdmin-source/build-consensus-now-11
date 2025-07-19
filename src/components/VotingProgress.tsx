
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Poll } from '@/types/poll';
import { CheckCircle, BarChart3, Activity  } from 'lucide-react';
import { UserPoints } from '@/integrations/supabase/userPoints';
import { CompletionDialog } from './CompletionDialog';
import { PersonalInsightsModal } from './PersonalInsightsModal';
import { SocialProof } from './SocialProof';
import { CompletionTracker } from './CompletionTracker';
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
}

export const VotingProgress: React.FC<VotingProgressProps> = ({
  poll,
  userVoteCount,
  totalStatements,
  remainingStatements,
  userPoints,
  onNavigateToResults,
  onNavigateToHome
}) => {
  const { user } = useAuth();
  const personalProgress = (userVoteCount / totalStatements) * 100;
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  
  const { isLoading, insights, error, generateInsights, clearInsights } = usePersonalInsights();

  const handlePersonalInsights = async () => {
    setShowInsightsModal(true);
    clearInsights();
    await generateInsights(poll);
  };

  const handleRetryInsights = async () => {
    clearInsights();
    await generateInsights(poll);
  };

  return (
    <div className="space-y-4">
      <Card className="mb-6">
        <CardContent className="p-4">
          {/* Personal Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium hebrew-text">ההתקדמות שלך</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {userVoteCount}/{totalStatements}
              </Badge>
            </div>
            <Progress value={personalProgress} className="h-2" />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground hebrew-text">
                {remainingStatements > 0 
                  ? `נותרו ${remainingStatements} הצהרות להצבעה`
                  : 'סיימת להצביע על כל ההצהרות!'
                }
              </p>
              {onNavigateToResults && (
                <Button
                  onClick={() => setShowCompletionDialog(true)}
                  size="sm"
                  className="bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-600 hover:to-blue-600 hebrew-text"
                >
                  <CheckCircle className="h-3 w-3 ml-1" />
                  סיימתי
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Proof */}
      <SocialProof variant="compact" showLive />

      {/* Completion Tracker */}
      <CompletionTracker />

      <CompletionDialog
        open={showCompletionDialog}
        onOpenChange={setShowCompletionDialog}
        onNavigateToResults={onNavigateToResults || (() => {})}
        onNavigateToHome={onNavigateToHome || (() => {})}
        onPersonalInsights={handlePersonalInsights}
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
