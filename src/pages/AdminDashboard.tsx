
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
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
  Clock,
  Target,
  AlertCircle,
  Edit,
  Eye,
  Cog,
  Database
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { NewPollForm } from '@/components/admin/NewPollForm';
import { SystemConfig } from '@/components/admin/SystemConfig';
import { UserManagement } from '@/components/admin/UserManagement';
import { fetchAllPolls } from '@/integrations/supabase/polls';
import { extendPollTime } from '@/integrations/supabase/admin';
import type { Poll } from '@/types/poll';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { admin, logout } = useAdmin();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('polls');
  const [showNewPollDialog, setShowNewPollDialog] = useState(false);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    logout();
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

  const handleExtendTime = async (pollId: string) => {
    const newEndTime = new Date();
    newEndTime.setDate(newEndTime.getDate() + 7);
    
    try {
      await extendPollTime(pollId, newEndTime.toISOString());
      loadPolls();
      toast({
        title: 'זמן הסקר הוארך',
        description: 'הסקר הוארך בשבוע נוסף',
      });
    } catch (error) {
      toast({
        title: 'שגיאה בהארכת הזמן',
        description: 'אנא נסה שוב',
        variant: 'destructive'
      });
    }
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
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm">שלום, {admin?.name}</span>
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="polls" className="hebrew-text">ניהול סקרים</TabsTrigger>
            <TabsTrigger value="users" className="hebrew-text">ניהול משתמשים</TabsTrigger>
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
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                          onClick={() => navigate(`/results/${poll.poll_id}`)}
                        >
                          <Eye className="h-4 w-4 ml-1" />
                          תוצאות
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleExtendTime(poll.poll_id)}
                        >
                          <Clock className="h-4 w-4 ml-1" />
                          הארך זמן
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <Users className="h-6 w-6" />
              <h2 className="text-2xl font-bold">ניהול משתמשים ומנהלים</h2>
            </div>
            <UserManagement />
          </TabsContent>

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
    </div>
  );
};

export default AdminDashboard;
