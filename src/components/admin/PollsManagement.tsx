
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, AlertCircle, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { NewPollForm } from './NewPollForm';
import { ConfirmationDialog } from './ConfirmationDialog';
import { PollCard } from './PollCard';
import { fetchAllPolls } from '@/integrations/supabase/polls';
import { supabase } from '@/integrations/supabase/client';
import type { Poll } from '@/types/poll';

export const PollsManagement: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showNewPollDialog, setShowNewPollDialog] = useState(false);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; pollId: string; pollTitle: string }>({
    open: false,
    pollId: '',
    pollTitle: ''
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadPolls();
  }, []);

  const loadPolls = async () => {
    try {
      setLoading(true);
      setError(null);
      const pollsData = await fetchAllPolls();
      setPolls(pollsData);
    } catch (error) {
      console.error('Error loading polls:', error);
      setError('שגיאה בטעינת הסקרים');
      setPolls([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPoll = (pollId: string) => {
    navigate(`/admin/edit-poll/${pollId}`);
  };

  const handleNewPollSuccess = () => {
    setShowNewPollDialog(false);
    loadPolls();
    toast({
      title: 'סקר נוצר בהצלחה',
      description: 'הסקר החדש זמין עכשיו',
    });
  };

  const handleDeletePoll = (pollId: string, pollTitle: string) => {
    setDeleteDialog({
      open: true,
      pollId,
      pollTitle
    });
  };

  const confirmDeletePoll = async () => {
    try {
      setDeleting(true);
      
      const { error } = await supabase
        .from('polis_polls')
        .delete()
        .eq('poll_id', deleteDialog.pollId);

      if (error) {
        throw error;
      }

      toast({
        title: 'הסקר נמחק בהצלחה',
        description: 'הסקר הוסר מהמערכת',
      });

      loadPolls();
      setDeleteDialog({ open: false, pollId: '', pollTitle: '' });
    } catch (error) {
      console.error('Error deleting poll:', error);
      toast({
        title: 'שגיאה במחיקת הסקר',
        description: 'אנא נסה שוב',
        variant: 'destructive'
      });
    } finally {
      setDeleting(false);
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
        <h2 className="text-2xl font-bold">ניהול סקרים</h2>
        <Dialog open={showNewPollDialog} onOpenChange={setShowNewPollDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 ml-1" />
              סקר חדש
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="hebrew-text">יצירת סקר חדש</DialogTitle>
            </DialogHeader>
            <NewPollForm 
              onSuccess={handleNewPollSuccess}
              onCancel={() => setShowNewPollDialog(false)}
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
                onClick={loadPolls}
                className="mr-auto"
              >
                נסה שוב
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {polls.length === 0 && !error ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Database className="h-12 w-12 mx-auto mb-4 text-blue-500" />
            <p className="text-lg font-medium">אין סקרים במערכת</p>
            <p className="text-muted-foreground mb-4">צור סקר חדש כדי להתחיל</p>
            <Button onClick={() => setShowNewPollDialog(true)}>
              <Plus className="h-4 w-4 ml-1" />
              צור סקר חדש
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {polls.map((poll) => (
            <PollCard
              key={poll.poll_id}
              poll={poll}
              onEdit={handleEditPoll}
              onDelete={handleDeletePoll}
            />
          ))}
        </div>
      )}

      <ConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title="מחיקת סקר"
        description={`האם אתה בטוח שברצונך למחוק את הסקר "${deleteDialog.pollTitle}"? פעולה זו אינה ניתנת לביטול.`}
        confirmText="מחק"
        cancelText="ביטול"
        variant="destructive"
        onConfirm={confirmDeletePoll}
        isLoading={deleting}
      />
    </div>
  );
};
