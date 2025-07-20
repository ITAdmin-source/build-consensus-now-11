import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Users, Trophy, Vote } from 'lucide-react';
import { MigrationPreview } from '@/hooks/useMigrationManager';

interface MigrationPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  preview: MigrationPreview | null;
  isLoading?: boolean;
}

export const MigrationPreviewModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  preview, 
  isLoading = false 
}: MigrationPreviewModalProps) => {
  if (!preview?.hasData) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-background border border-border">
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl font-bold text-foreground">
            שמירת הנתונים שלך
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-center text-muted-foreground">
            ברצוננו לשמור את כל ההישגים שלך מהביקור הנוכחי:
          </p>
          
          <div className="space-y-3">
            {preview.points > 0 && (
              <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                <div className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-primary" />
                  <span className="font-medium">נקודות שנצברו</span>
                </div>
                <Badge variant="secondary" className="font-bold">
                  {preview.points}
                </Badge>
              </div>
            )}
            
            {preview.votes > 0 && (
              <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                <div className="flex items-center gap-2">
                  <Vote className="h-5 w-5 text-primary" />
                  <span className="font-medium">קולות שנמסרו</span>
                </div>
                <Badge variant="secondary" className="font-bold">
                  {preview.votes}
                </Badge>
              </div>
            )}
            
            {preview.polls > 0 && (
              <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  <span className="font-medium">סקרים שהשתתפת בהם</span>
                </div>
                <Badge variant="secondary" className="font-bold">
                  {preview.polls}
                </Badge>
              </div>
            )}
            
            {preview.groups > 0 && (
              <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="font-medium">קבוצות דעה</span>
                </div>
                <Badge variant="secondary" className="font-bold">
                  {preview.groups}
                </Badge>
              </div>
            )}
          </div>
          
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              לאחר ההרשמה תוכל להמשיך מקום שעצרת ולקבל תובנות אישיות מהשתתפותך
            </p>
          </div>
        </div>
        
        <div className="flex gap-2 pt-4">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1"
            disabled={isLoading}
          >
            ביטול
          </Button>
          <Button 
            onClick={onConfirm}
            className="flex-1"
            disabled={isLoading}
          >
            {isLoading ? 'מעביר נתונים...' : 'שמור והמשך'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};