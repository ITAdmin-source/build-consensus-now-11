import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CountdownTimer } from './CountdownTimer';
import { Poll } from '@/types/poll';
import { Users, Target, Clock, Play, X } from 'lucide-react';

interface WelcomeOverlayProps {
  poll: Poll;
  participantCount: number;
  consensusPointsCount: number;
  onStartVoting: () => void;
  onShowTutorial: () => void;
}

interface TutorialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  poll: Poll;
}

const TutorialModal: React.FC<TutorialModalProps> = ({ open, onOpenChange, poll }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="hebrew-text text-xl">איך זה עובד?</DialogTitle>
          <DialogDescription className="space-y-4 text-right">
            <div className="hebrew-text text-base">
              <p className="mb-3">זה לא רק סקר - זה משחק שיתופי!</p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-voting-support text-white flex items-center justify-center text-sm font-bold">1</div>
                  <p>קראו כל הצהרה והחליטו מה דעתכם</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-voting-oppose text-white flex items-center justify-center text-sm font-bold">2</div>
                  <p>השתמשו בכפתורים או החליקו את הכרטיס</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-voting-unsure text-white flex items-center justify-center text-sm font-bold">3</div>
                  <p>עזרו למצוא נקודות הסכמה עם המשתתפים האחרים</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">הכפתורים:</p>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <Badge className="bg-voting-support text-white justify-center">{poll.support_button_label}</Badge>
                  <Badge className="bg-voting-unsure text-white justify-center">{poll.unsure_button_label}</Badge>
                  <Badge className="bg-voting-oppose text-white justify-center">{poll.oppose_button_label}</Badge>
                </div>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export const WelcomeOverlay: React.FC<WelcomeOverlayProps> = ({ 
  poll, 
  participantCount, 
  consensusPointsCount, 
  onStartVoting,
  onShowTutorial 
}) => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has visited this poll before
    const hasVisited = localStorage.getItem(`poll-welcome-${poll.poll_id}`);
    if (!hasVisited) {
      setIsVisible(true);
    }
  }, [poll.poll_id]);

  const handleStartVoting = () => {
    localStorage.setItem(`poll-welcome-${poll.poll_id}`, 'true');
    setIsVisible(false);
    onStartVoting();
  };

  const handleShowTutorial = () => {
    setShowTutorial(true);
  };

  if (!isVisible) return null;

  // Use round end_time for countdown
  const endTime = poll.round?.end_time || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const targetConsensusPoints = poll.min_consensus_points_to_win || 3;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg animate-scale-in">
          <CardContent className="p-6 space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Play className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold hebrew-text">{poll.title}</h1>
              </div>
              <p className="text-muted-foreground hebrew-text">{poll.description}</p>
            </div>

            {/* Game Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div className="text-lg font-bold">{participantCount}</div>
                <div className="text-xs text-muted-foreground hebrew-text">משתתפים</div>
              </div>
              
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <Target className="h-4 w-4 text-primary" />
                </div>
                <div className="text-lg font-bold">{consensusPointsCount}/{targetConsensusPoints}</div>
                <div className="text-xs text-muted-foreground hebrew-text">נקודות הסכמה</div>
              </div>
              
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <CountdownTimer endTime={endTime} compact />
                <div className="text-xs text-muted-foreground hebrew-text">זמן נותר</div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="space-y-3">
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <p className="hebrew-text font-medium text-primary">
                  זה לא רק סקר - זה משחק שיתופי!
                </p>
                <p className="hebrew-text text-sm text-muted-foreground mt-1">
                  כולם זוכים כשמוצאים הסכמה. כל הצבעה חשובה!
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={handleShowTutorial} 
                  variant="outline" 
                  className="flex-1 hebrew-text"
                >
                  איך זה עובד?
                </Button>
                <Button 
                  onClick={handleStartVoting} 
                  className="flex-1 hebrew-text bg-primary hover:bg-primary/90"
                >
                  הצטרף למשחק
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <TutorialModal 
        open={showTutorial} 
        onOpenChange={setShowTutorial} 
        poll={poll}
      />
    </>
  );
};