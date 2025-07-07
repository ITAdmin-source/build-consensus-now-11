
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Round } from '@/types/round';
import { fetchAllRounds, deleteRound } from '@/integrations/supabase/rounds';
import { RoundForm } from './RoundForm';
import { ConfirmationDialog } from './ConfirmationDialog';

export const RoundsManagement: React.FC = () => {
  const { toast } = useToast();
  const [showNewRoundDialog, setShowNewRoundDialog] = useState(false);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingRound, setEditingRound] = useState<Round | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; roundId: string; roundTitle: string }>({
    open: false,
    roundId: '',
    roundTitle: ''
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadRounds();
  }, []);

  const loadRounds = async () => {
    try {
      setLoading(true);
      setError(null);
      const roundsData = await fetchAllRounds();
      setRounds(roundsData);
    } catch (error) {
      console.error('Error loading rounds:', error);
      setError('שגיאה בטעינת הסיבובים');
      setRounds([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRoundSuccess = () => {
    setShowNewRoundDialog(false);
    setEditingRound(null);
    loadRounds();
    toast({
      title: 'הסיבוב נשמר בהצלחה',
      description: 'הסיבוב זמין עכשיו במערכת',
    });
  };

  const handleDeleteRound = (roundId: string, roundTitle: string) => {
    setDeleteDialog({
      open: true,
      roundId,
      roundTitle
    });
  };

  const confirmDeleteRound = async () => {
    try {
      setDeleting(true);
      await deleteRound(deleteDialog.roundId);
      
      toast({
        title: 'הסיבוב נמחק בהצלחה',
        description: 'הסיבוב הוסר מהמערכת',
      });

      loadRounds();
      setDeleteDialog({ open: false, roundId: '', roundTitle: '' });
    } catch (error) {
      console.error('Error deleting round:', error);
      toast({
        title: 'שגיאה במחיקת הסיבוב',
        description: 'אנא נסה שוב',
        variant: 'destructive'
      });
    } finally {
      setDeleting(false);
    }
  };

  const getStatusIcon = (round: Round) => {
    switch (round.active_status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'completed':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = (round: Round) => {
    if (round.publish_status === 'draft') return 'טיוטה';
    switch (round.active_status) {
      case 'pending': return 'ממתין';
      case 'active': return 'פעיל';
      case 'completed': return 'הסתיים';
      default: return 'לא פעיל';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold hebrew-text">ניהול סיבובים</h2>
        <Dialog open={showNewRoundDialog} onOpenChange={setShowNewRoundDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 ml-1" />
              סיבוב חדש
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="hebrew-text">יצירת סיבוב חדש</DialogTitle>
            </DialogHeader>
            <RoundForm 
              onSuccess={handleRoundSuccess}
              onCancel={() => setShowNewRoundDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadRounds}
                className="mr-auto"
              >
                נסה שוב
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {rounds.length === 0 && !error ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Clock className="h-12 w-12 mx-auto mb-4 text-blue-500" />
            <p className="text-lg font-medium hebrew-text">אין סיבובים במערכת</p>
            <p className="text-muted-foreground mb-4 hebrew-text">צור סיבוב חדש כדי להתחיל</p>
            <Button onClick={() => setShowNewRoundDialog(true)}>
              <Plus className="h-4 w-4 ml-1" />
              צור סיבוב חדש
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {rounds.map((round) => (
            <Card key={round.round_id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="hebrew-text">{round.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(round)}
                    <span className="text-sm hebrew-text">{getStatusText(round)}</span>
                  </div>
                </div>
                {round.description && (
                  <p className="text-muted-foreground hebrew-text">{round.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium hebrew-text">תחילת הצבעה:</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(round.start_time).toLocaleString('he-IL')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium hebrew-text">סיום הצבעה:</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(round.end_time).toLocaleString('he-IL')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setEditingRound(round)}
                  >
                    ערוך
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDeleteRound(round.round_id, round.title)}
                  >
                    מחק
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Round Dialog */}
      <Dialog open={!!editingRound} onOpenChange={(open) => !open && setEditingRound(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="hebrew-text">עריכת סיבוב</DialogTitle>
          </DialogHeader>
          {editingRound && (
            <RoundForm 
              round={editingRound}
              onSuccess={handleRoundSuccess}
              onCancel={() => setEditingRound(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title="מחיקת סיבוב"
        description={`האם אתה בטוח שברצונך למחוק את הסיבוב "${deleteDialog.roundTitle}"? פעולה זו אינה ניתנת לביטול.`}
        confirmText="מחק"
        cancelText="ביטול"
        variant="destructive"
        onConfirm={confirmDeleteRound}
        isLoading={deleting}
      />
    </div>
  );
};
