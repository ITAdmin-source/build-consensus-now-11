
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, 
  Settings, 
  Plus,
  LogOut,
  Home,
  Vote,
  Target,
  AlertCircle,
  Edit,
  Cog,
  Database,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { NewPollForm } from '@/components/admin/NewPollForm';
import { SystemConfig } from '@/components/admin/SystemConfig';
import { UserManagement } from '@/components/admin/UserManagement';
import { ConfirmationDialog } from '@/components/admin/ConfirmationDialog';
import { fetchAllPolls } from '@/integrations/supabase/polls';
import { extendPollTime } from '@/integrations/supabase/admin';
import { supabase } from '@/integrations/supabase/client';
import type { Poll } from '@/types/poll';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut, userRole, isSuperAdmin } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('polls');
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

  const handleLogout = () => {
    signOut();
    toast({
      title: 'התנתקת בהצלחה',
      description: 'להתראות!',
    });
    navigate('/');
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
      
      // Delete the poll from the database
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

      // Reload polls and close dialog
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

  const formatEndTime = (endTime: string) => {
    const date = new Date(endTime);
    return date.toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 hebrew-text flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg">טוען נתונים...</p>
        </div>
      </div>
    );
  }

  const userName = user?.user_metadata?.full_name || user?.email || 'מנהל';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 hebrew-text">
      {/* Admin Header */}
      <div className="bg-slate-800 text-white border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="text-white hover:bg-slate-700"
              >
                <Home className="h-4 w-4 ml-1" />
                נקודות חיבור
              </Button>
              <Badge variant="secondary" className="bg-slate-600 text-white">
                מערכת ניהול
              </Badge>
              <Badge variant="outline" className="text-white border-white">
                {userRole === 'super_admin' ? 'מנהל ראשי' : 'מנהל סקרים'}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm">שלום, {userName}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-white hover:bg-slate-700"
              >
                <LogOut className="h-4 w-4 ml-1" />
                התנתק
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">מערכת ניהול</h1>
          <p className="text-muted-foreground">ניהול סקרים, משתמשים והגדרות מערכת</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full ${isSuperAdmin ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <TabsTrigger value="polls" className="hebrew-text">ניהול סקרים</TabsTrigger>
            {isSuperAdmin && (
              <TabsTrigger value="users" className="hebrew-text">ניהול משתמשים</TabsTrigger>
            )}
            <TabsTrigger value="settings" className="hebrew-text">הגדרות מערכת</TabsTrigger>
          </TabsList>

          {/* Polls Management Tab */}
          <TabsContent value="polls" className="space-y-6">
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
                  <Card key={poll.poll_id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2">{poll.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                            <div className="flex items-center gap-1">
                              <Target className="h-4 w-4" />
                              {poll.current_consensus_points}/{poll.min_consensus_points_to_win} נק' חיבור
                            </div>
                            <div className="flex items-center gap-1">
                              <Vote className="h-4 w-4" />
                              {poll.total_votes} הצבעות
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {poll.total_statements} הצהרות
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <span>תאריך סיום: {formatEndTime(poll.end_time)}</span>
                          </div>
                        </div>
                        <Badge variant={poll.status === 'active' ? 'default' : 'secondary'}>
                          {poll.status === 'active' ? 'פעיל' : poll.status === 'closed' ? 'סגור' : 'טיוטה'}
                        </Badge>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditPoll(poll.poll_id)}
                        >
                          <Edit className="h-4 w-4 ml-1" />
                          עריכה
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeletePoll(poll.poll_id, poll.title)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 ml-1" />
                          מחק
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* User Management Tab - Only for Super Admins */}
          {isSuperAdmin && (
            <TabsContent value="users" className="space-y-6">
              <div className="flex items-center gap-2 mb-6">
                <Users className="h-6 w-6" />
                <h2 className="text-2xl font-bold">ניהול משתמשים ותפקידים</h2>
              </div>
              <UserManagement />
            </TabsContent>
          )}

          {/* System Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <Cog className="h-6 w-6" />
              <h2 className="text-2xl font-bold">הגדרות מערכת</h2>
            </div>
            <SystemConfig />
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
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

export default AdminDashboard;
