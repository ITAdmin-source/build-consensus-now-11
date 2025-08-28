import React, { useState } from 'react';
import { NavigationHeader } from '@/components/NavigationHeader';
import { MinimalTopSection } from '@/components/MinimalTopSection';
import { SharePopup } from '@/components/SharePopup';
import { SimplifiedStatementsTable } from '@/components/SimplifiedStatementsTable';
import { DetailedResultsPage } from '@/components/DetailedResultsPage';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Home } from 'lucide-react';
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
  isLive = false,
  isPollCompleted = false
}) => {
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [showDetailedResults, setShowDetailedResults] = useState(false);

  // If detailed results are requested, render the detailed page
  if (showDetailedResults) {
    return (
      <DetailedResultsPage
        poll={poll}
        statements={statements}
        consensusPoints={consensusPoints}
        groups={groups}
        groupStats={groupStats}
        userPoints={userPoints}
        onBackToHome={onBackToHome}
        onNavigateToVoting={onNavigateToVoting}
        onBackToSimplified={() => setShowDetailedResults(false)}
        isLive={isLive}
        isPollCompleted={isPollCompleted}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <NavigationHeader currentPage="results" userPoints={userPoints} poll={poll} />
      
      {/* Minimal Top Section */}
      <MinimalTopSection 
        poll={poll}
        isPollCompleted={isPollCompleted}
        onShareClick={() => setShowSharePopup(true)}
      />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Results Section */}
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-xl font-bold hebrew-text">תוצאות הסקר</h2>
            {isPollCompleted && consensusPoints.length > 0 && (
              <p className="text-sm text-muted-foreground hebrew-text">
                {consensusPoints.length} נקודות קונצנזוס זוהו
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Statements List */}
            <SimplifiedStatementsTable
              statements={statements}
              consensusPoints={consensusPoints}
            />
            
            {/* View Full Results Button */}
            <div className="flex justify-center pt-4 border-t">
              <Button
                onClick={() => setShowDetailedResults(true)}
                className="flex items-center gap-2 hebrew-text"
              >
                <Eye className="h-4 w-4" />
                צפה בתוצאות מפורטות
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* All Polls Button */}
        <div className="flex justify-center">
          <Button
            onClick={onBackToHome}
            variant="outline"
            size="lg"
            className="flex items-center gap-2 hebrew-text"
          >
            <Home className="h-4 w-4" />
            כל הסקרים
          </Button>
        </div>
      </div>

      {/* Share Popup */}
      <SharePopup
        open={showSharePopup}
        onOpenChange={setShowSharePopup}
        poll={poll}
      />
    </div>
  );
};