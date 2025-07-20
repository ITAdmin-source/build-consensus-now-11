import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Gift, Users, Trophy, Vote } from 'lucide-react';
import { MigrationResult } from '@/hooks/useMigrationManager';

interface MigrationSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  result: MigrationResult;
}

export const MigrationSuccessDialog = ({ 
  isOpen, 
  onClose, 
  result 
}: MigrationSuccessDialogProps) => {
  if (!result.success) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-background border border-border">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <DialogTitle className="text-xl font-bold text-foreground">
            ברוך הבא לנקודות חיבור!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-center text-muted-foreground">
            הנתונים שלך הועברו בהצלחה:
          </p>
          
          <div className="space-y-3">
            {result.points_migrated > 0 && (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">נקודות שנשמרו</span>
                </div>
                <Badge variant="secondary" className="font-bold bg-green-100 text-green-800">
                  {result.points_migrated}
                </Badge>
              </div>
            )}
            
            {result.votes_migrated > 0 && (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <Vote className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">קולות שהועברו</span>
                </div>
                <Badge variant="secondary" className="font-bold bg-green-100 text-green-800">
                  {result.votes_migrated}
                </Badge>
              </div>
            )}
            
            {result.groups_migrated > 0 && (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">קבוצות דעה</span>
                </div>
                <Badge variant="secondary" className="font-bold bg-green-100 text-green-800">
                  {result.groups_migrated}
                </Badge>
              </div>
            )}
          </div>
          
          <div className="bg-primary/5 p-4 rounded-lg text-center">
            <Trophy className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="font-bold text-lg text-primary">
              סה"כ נקודות: {result.total_points}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              תובנות אישיות יתווספו בקרוב לחשבון שלך
            </p>
          </div>
        </div>
        
        <Button 
          onClick={onClose}
          className="w-full"
        >
          המשך לחשבון שלי
        </Button>
      </DialogContent>
    </Dialog>
  );
};