import React, { useState, useMemo } from 'react';
import { Poll, Statement } from '@/types/poll';
import { Button } from '@/components/ui/button';
import { UserStatementForm } from '@/components/UserStatementForm';
import { VotingProgress } from '@/components/VotingProgress';
import { PointAnimation } from '@/components/PointAnimation';
import { EnhancedStatementCard } from '@/components/EnhancedStatementCard';
import { UserPoints } from '@/integrations/supabase/userPoints';
import { useAuth } from '@/contexts/AuthContext';
import { useReturnUrl } from '@/hooks/useReturnUrl';
import { useUserPoints } from '@/hooks/useUserPoints';
import { Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { getVotingButtonLabels } from '@/utils/votingButtonUtils';

interface OptimizedVotingInterfaceProps {
  poll: Poll;
  statement: Statement | null;
  userVoteCount: number;
  totalStatements: number;
  remainingStatements: number;
  userPoints: UserPoints;
  onVote: (statementId: string, vote: string) => void;
  onViewResults: () => void;
  onSubmitStatement?: (content: string, contentType: string) => void;
  isVoting?: boolean;
}

export const OptimizedVotingInterface: React.FC<OptimizedVotingInterfaceProps> = React.memo(({
  poll,
  statement,
  userVoteCount,
  totalStatements,
  remainingStatements,
  userPoints,
  onVote,
  onViewResults,
  onSubmitStatement,
  isVoting = false
}) => {
  const { user } = useAuth();
  const { createAuthUrl } = useReturnUrl();
  const { incrementPoints } = useUserPoints();
  const [pendingVote, setPendingVote] = useState<string | null>(null);
  const [showPointAnimation, setShowPointAnimation] = useState(false);
  const buttonLabels = getVotingButtonLabels(poll);

  const handleOptimisticVote = (vote: string) => {
    if (!statement) return;

    // Set pending vote for immediate UI feedback
    setPendingVote(vote);

    // Show point animation
    setShowPointAnimation(true);
    
    // Optimistically increment points
    incrementPoints();

    // Submit the actual vote
    onVote(statement.statement_id, vote);

    // Clear pending vote after a short delay to allow for smooth transition
    setTimeout(() => {
      setPendingVote(null);
    }, 300);
  };

  const handleAnimationComplete = () => {
    setShowPointAnimation(false);
  };

  // Memoize user statement section to prevent unnecessary re-renders
  const userStatementSection = useMemo(() => {
    if (!poll.allow_user_statements) return null;
    if (user && onSubmitStatement) {
      return <UserStatementForm poll={poll} onSubmitStatement={onSubmitStatement} />;
    } else {
      return <div className="text-center p-4 rounded-lg border border-blue-200 bg-white">
          <LogIn className="h-8 w-8 mx-auto mb-2 text-blue-600" />
          <p className="text-blue-800 mb-3 hebrew-text">להוספת היגדים חדשים יש להירשם ולהתחבר</p>
          <Link to={createAuthUrl()}>
            <Button variant="outline" size="sm">
              <LogIn className="h-4 w-4 ml-2" />
              התחבר למערכת
            </Button>
          </Link>
        </div>;
    }
  }, [poll.allow_user_statements, user, onSubmitStatement, poll, createAuthUrl]);

  // Show completion message when no statement is available
  if (!statement) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center p-8 bg-green-50 rounded-xl border border-green-200">
          <div className="text-4xl mb-4">🎉</div>
          <h3 className="text-xl font-bold text-green-800 mb-2 hebrew-text">
            סיימת להצביע על כל ההצהרות!
          </h3>
          <p className="text-green-700 mb-6 hebrew-text">
            תודה על השתתפותך. כעת תוכל לראות את התוצאות ולגלות אילו נקודות חיבור נמצאו.
          </p>
          <Button 
            onClick={onViewResults} 
            className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg hebrew-text"
            size="lg"
          >
            צפה בתוצאות
          </Button>
        </div>
        
        <VotingProgress 
          poll={poll} 
          userVoteCount={userVoteCount} 
          totalStatements={totalStatements} 
          remainingStatements={remainingStatements} 
          userPoints={userPoints} 
          onNavigateToResults={onViewResults} 
          onNavigateToHome={() => window.location.href = '/'} 
        />
        
        {userStatementSection}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PointAnimation show={showPointAnimation} onComplete={handleAnimationComplete} />
      
      {/* Enhanced Statement Card */}
      <EnhancedStatementCard
        statement={statement}
        onVote={handleOptimisticVote}
        isVoting={isVoting}
        pendingVote={pendingVote}
        currentIndex={userVoteCount}
        totalStatements={totalStatements}
        supportLabel={buttonLabels.support}
        opposeLabel={buttonLabels.oppose}
        unsureLabel={buttonLabels.unsure}
      />

      <VotingProgress 
        poll={poll} 
        userVoteCount={userVoteCount} 
        totalStatements={totalStatements} 
        remainingStatements={remainingStatements} 
        userPoints={userPoints} 
        onNavigateToResults={onViewResults} 
        onNavigateToHome={() => window.location.href = '/'} 
      />

      {userStatementSection}
    </div>
  );
});

OptimizedVotingInterface.displayName = 'OptimizedVotingInterface';
