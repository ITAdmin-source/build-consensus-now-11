
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Poll } from '@/types/poll';
import { CheckCircle, Activity, User, Target } from 'lucide-react';
import { UserPoints } from '@/integrations/supabase/userPoints';
import { EarlyCompletionConfirmDialog } from './EarlyCompletionConfirmDialog';

interface VotingProgressProps {
  poll: Poll;
  userVoteCount: number;
  totalStatements: number;
  remainingStatements: number;
  userPoints: UserPoints;
  onEndNow?: () => void;
}

export const VotingProgress: React.FC<VotingProgressProps> = ({
  poll,
  userVoteCount,
  totalStatements,
  remainingStatements,
  userPoints,
  onEndNow
}) => {
  const personalProgress = (userVoteCount / totalStatements) * 100;
  const minVotesToEnd = poll.min_statements_voted_to_end || 5;
  const canEndNow = userVoteCount >= minVotesToEnd || remainingStatements === 0;
  const [showEarlyCompletionConfirm, setShowEarlyCompletionConfirm] = useState(false);

  const handleEndNowClick = () => {
    if (remainingStatements > 0) {
      setShowEarlyCompletionConfirm(true);
    } else {
      onEndNow?.();
    }
  };

  const handleEarlyCompletionConfirm = () => {
    setShowEarlyCompletionConfirm(false);
    onEndNow?.();
  };

  return (
    <div className="space-y-4">
      <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] mb-6">
        <div className="flex items-center justify-center gap-3 text-gray-600 mb-6">
          <div className="bg-gradient-to-r from-blue-400 to-purple-500 p-3 rounded-xl">
            <User className="h-6 w-6 text-white" />
          </div>
          <span className="text-lg hebrew-text font-semibold">ההתקדמות שלך</span>
          <Badge variant="outline" className="text-sm px-3 py-1 bg-white/50">
            {userVoteCount}/{totalStatements}
          </Badge>
        </div>
        
        <div className="space-y-4">
          <div className="relative">
            <Progress 
              value={personalProgress} 
              threshold={totalStatements > 0 ? (minVotesToEnd / totalStatements) * 100 : 0}
              className="h-4 bg-gray-200/70 rounded-full overflow-hidden" 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full opacity-20 animate-pulse"></div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-500" />
              <span className="text-lg font-bold text-gray-800 hebrew-text">
                השלמת {Math.round(personalProgress)}% מהסקר
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2">
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
                className="hebrew-text bg-white/70 hover:bg-white"
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
            <div className="text-xs text-amber-600 hebrew-text bg-amber-50/70 p-2 rounded-lg">
              עליך להצביע על לפחות {minVotesToEnd - userVoteCount} הצהרות נוספות לפני שתוכל לסיים ({userVoteCount}/{minVotesToEnd})
            </div>
          )}
        </div>
      </div>

      <EarlyCompletionConfirmDialog
        open={showEarlyCompletionConfirm}
        onOpenChange={setShowEarlyCompletionConfirm}
        remainingStatements={remainingStatements}
        onContinueVoting={() => {}} // Just closes the dialog
        onEndAnyway={handleEarlyCompletionConfirm}
      />

    </div>
  );
};
