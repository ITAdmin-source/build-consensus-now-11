import React, { useState } from 'react';
import { SharePopup } from '@/components/SharePopup';
import { StatementsTable } from '@/components/StatementsTable';
import { DetailedResultsPage } from '@/components/DetailedResultsPage';
import { UnifiedLayoutWrapper } from '@/components/UnifiedLayoutWrapper';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Home, Brain, Share2, LayoutGrid } from 'lucide-react';
import { Poll, Statement, ConsensusPoint, Group, GroupStatementStats } from '@/types/poll';
import { UserPoints } from '@/integrations/supabase/userPoints';

interface SimplifiedResultsPageProps {
  poll: Poll;
  statements: Statement[];
  consensusPoints: ConsensusPoint[];
  groups: Group[];
  groupStats: GroupStatementStats[];
  userPoints: UserPoints;
  onBackToHome: () => void;
  onNavigateToVoting?: () => void;
  onNavigateToInsights?: () => void;
  onNavigateToMotivation?: () => void;
  isLive?: boolean;
  isPollCompleted?: boolean;
}

export const SimplifiedResultsPage: React.FC<SimplifiedResultsPageProps> = ({
  poll,
  statements,
  consensusPoints,
  groups,
  groupStats,
  userPoints,
  onBackToHome,
  onNavigateToVoting,
  onNavigateToInsights,
  onNavigateToMotivation,
  isLive = false,
  isPollCompleted = false
}) => {
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [showDetailedResults, setShowDetailedResults] = useState(false);

  // If detailed results are requested, render the detailed page with smooth transition
  if (showDetailedResults) {
    return (
      <div className="animate-fade-in">
        <DetailedResultsPage
          poll={poll}
          statements={statements}
          consensusPoints={consensusPoints}
          groups={groups}
          groupStats={groupStats}
          userPoints={userPoints}
          onBackToHome={onBackToHome}
          onBackToSimplified={() => setShowDetailedResults(false)}
          isPollCompleted={isPollCompleted}
        />
      </div>
    );
  }
  return (
    <div className="animate-fade-in">
      <UnifiedLayoutWrapper
        poll={poll}
        userPoints={userPoints}
        currentState="results"
        containerWidth="wide" 
        showTopSection={true}
        showBreadcrumb={true}
        isPollCompleted={isPollCompleted}
        onShareClick={() => setShowSharePopup(true)}
      >
          {/* Results Section */}
          <Card className="mb-6 bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <h2 className="text-xl font-bold hebrew-text">תוצאות הסקר</h2>
                {isPollCompleted && consensusPoints.length > 0 && (
                  <p className="text-sm text-muted-foreground hebrew-text">
                    {consensusPoints.length} נקודות קונצנזוס זוהו
                  </p>
                )}
              </div>
              <Button
                onClick={() => setShowDetailedResults(true)}
                variant="outline"
                size="sm"
                className="hebrew-text hover:bg-muted/50 transition-colors"
              >
                <LayoutGrid className="h-4 w-4 ml-2" />
                תצוגה מפורטת
              </Button>
            </CardHeader>
            <CardContent>
              {/* Statements table showing poll results */}
              <StatementsTable
                statements={statements}
                groups={groups}
                groupStats={groupStats}
              />
            </CardContent>
          </Card>

          {/* Navigation Options */}
          {(onNavigateToInsights || onNavigateToMotivation) && (
            <Card className="mb-6 bg-white/60 backdrop-blur-sm border border-gray-100/50 rounded-xl">
              <CardHeader>
                <h3 className="text-lg font-semibold hebrew-text">עבור לעמודים נוספים</h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {onNavigateToInsights && (
                    <Button
                      onClick={onNavigateToInsights}
                      variant="outline"
                      size="lg"
                      className="hebrew-text font-semibold py-4 rounded-xl border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-300 transform hover:scale-[1.02] bg-white/50 backdrop-blur-sm"
                    >
                      <Brain className="h-6 w-6 ml-2 text-purple-600" />
                      התובנות שלי
                    </Button>
                  )}
                  {onNavigateToMotivation && (
                    <Button
                      onClick={onNavigateToMotivation}
                      variant="outline"
                      size="lg"
                      className="hebrew-text font-semibold py-4 rounded-xl border-2 border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-300 transform hover:scale-[1.02] bg-white/50 backdrop-blur-sm"
                    >
                      <Share2 className="h-6 w-6 ml-2 text-green-600" />
                      מניעים למעורבות
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

      </UnifiedLayoutWrapper>

      <SharePopup
        open={showSharePopup}
        onOpenChange={setShowSharePopup}
        poll={poll}
      />
    </div>
  );
};