
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Poll } from '@/types/poll';
import { CheckCircle, Activity } from 'lucide-react';
import { UserPoints } from '@/integrations/supabase/userPoints';
import { CompletionDialog } from './CompletionDialog';
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
            <Progress value={personalProgress} className="h-3" />
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground hebrew-text">
                {remainingStatements > 0 
                  ? `נותרו ${remainingStatements} הצהרות להצבעה`
                  : 'סיימת להצביע על כל ההצהרות!'
                }
              </p>
              <Button
                onClick={() => setShowCompletionDialog(true)}
                size="sm"
                variant="outline"
                className="hebrew-text"
              >
                <CheckCircle className="h-4 w-4 ml-1" />
                סיים עכשיו
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
