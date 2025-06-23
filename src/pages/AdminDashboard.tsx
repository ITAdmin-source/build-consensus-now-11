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
  BarChart3, 
  Settings, 
  Plus,
  LogOut,
  Home,
  Vote,
  Clock,
  Target,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Eye,
  Cog
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { NewPollForm } from '@/components/admin/NewPollForm';
import { SystemConfig } from '@/components/admin/SystemConfig';
import { fetchAllPolls } from '@/integrations/supabase/polls';
import { fetchAdminStats, fetchPendingStatements, approveStatement, rejectStatement, extendPollTime } from '@/integrations/supabase/admin';
import type { Poll } from '@/types/poll';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { admin, logout } = useAdmin();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [showNewPollDialog, setShowNewPollDialog] = useState(false);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [pendingStatements, setPendingStatements] = useState<any[]>([]);
  const [stats, setStats] = useState({
    activePolls: 0,
    totalParticipants: 0,
    votesToday: 0,
    pendingStatements: 0
  });
  const [loading, setLoading] = useState(true);
  const [loadingStates, setLoadingStates] = useState({
    polls: true,
    stats: true,
    statements: true
  });
  const [errors, setErrors] = useState({
    polls: null as string | null,
    stats: null as string | null,
    statements: null as string | null
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setLoadingStates({ polls: true, stats: true, statements: true });
      setErrors({ polls: null, stats: null, statements: null });
      
      console.log('Loading admin dashboard data...');
      
      // Load data with individual error handling
      const dataPromises = [
        loadPolls(),
        loadStats(), 
        loadPendingStatements()
      ];

      await Promise.allSettled(dataPromises);
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast({
        title: 'שגיאה בטעינת נתונים',
        description: 'חלק מהנתונים עלולים להיות לא מעודכנים',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPolls = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, polls: true }));
      const pollsData = await fetchAllPolls();
      console.log('Polls loaded:', pollsData);
      setPolls(pollsData);
      setErrors(prev => ({ ...prev, polls: null }));
    } catch (error) {
      console.error('Error loading polls:', error);
      setErrors(prev => ({ ...prev, polls: 'שגיאה בטעינת הסקרים' }));
      setPolls([]);
    } finally {
      setLoadingStates(prev => ({ ...prev, polls: false }));
    }
  };

  const loadStats = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, stats: true }));
      const statsData = await fetchAdminStats();
      console.log('Stats loaded:', statsData);
      setStats(statsData);
      setErrors(prev => ({ ...prev, stats: null }));
    } catch (error) {
      console.error('Error loading stats:', error);
      setErrors(prev => ({ ...prev, stats: 'שגיאה בטעינת הסטטיסטיקות' }));
    } finally {
      setLoadingStates(prev => ({ ...prev, stats: false }));
    }
  };

  const loadPendingStatements = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, statements: true }));
      const pendingData = await fetchPendingStatements();
      console.log('Pending statements loaded:', pendingData);
      setPendingStatements(pendingData);
      setErrors(prev => ({ ...prev, statements: null }));
    } catch (error) {
      console.error('Error loading pending statements:', error);
      setErrors(prev => ({ ...prev, statements: 'שגיאה בטעינת ההצהרות הממתינות' }));
      setPendingStatements([]);
    } finally {
      setLoadingStates(prev => ({ ...prev, statements: false }));
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

  const handleApproveStatement = async (statementId: string) => {
    try {
      await approveStatement(statementId);
      setPendingStatements(prev => prev.filter(stmt => stmt.statement_id !== statementId));
      toast({
        title: 'הצהרה אושרה',
        description: 'ההצהרה נוספה לסקר בהצלחה',
      });
    } catch (error) {
      toast({
        title: 'שגיאה באישור ההצהרה',
        description: 'אנא נסה שוב',
        variant: 'destructive'
      });
    }
  };

  const handleRejectStatement = async (statementId: string) => {
    try {
      await rejectStatement(statementId);
      setPendingStatements(prev => prev.filter(stmt => stmt.statement_id !== statementId));
      toast({
        title: 'הצהרה נדחתה',
        description: 'ההצהרה הוסרה מהמתנה',
      });
    } catch (error) {
      toast({
        title: 'שגיאה בדחיית ההצהרה',
        description: 'אנא נסה שוב',
        variant: 'destructive'
      });
    }
  };

  const handleEditPoll = (pollId: string) => {
    navigate(`/admin/edit-poll/${pollId}`);
  };

  const handleNewPollSuccess = () => {
    setShowNewPollDialog(false);
    setActiveTab('polls');
    loadData(); // Refresh data
    toast({
      title: 'סקר נוצר בהצלחה',
      description: 'הסקר החדש זמין בכרטיסיית ניהול הסקרים',
    });
  };

  const handleExtendTime = async (pollId: string) => {
    const newEndTime = new Date();
    newEndTime.setDate(newEndTime.getDate() + 7); // Extend by 7 days
    
    try {
      await extendPollTime(pollId, newEndTime.toISOString());
      loadData(); // Refresh data
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

  if (loading && loadingStates.polls && loadingStates.stats && loadingStates.statements) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 hebrew-text flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg">טוען נתונים...</p>
        </div>
      </div>
    );
  }

  if (errors.stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 hebrew-text flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">שגיאה בטעינת הסטטיסטיקות</h2>
          <p className="text-muted-foreground mb-4">{errors.stats}</p>
          <Button onClick={loadStats}>נסה שוב</Button>
        </div>
      </div>
    );
  }

  if (errors.polls) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 hebrew-text flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">שגיאה בטעינת הסקרים</h2>
          <p className="text-muted-foreground mb-4">{errors.polls}</p>
          <Button onClick={loadPolls}>נסה שוב</Button>
        </div>
      </div>
    );
  }

  if (errors.statements) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 hebrew-text flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">שגיאה בטעינת ההצהרות הממתינות</h2>
          <p className="text-muted-foreground mb-4">{errors.statements}</p>
          <Button onClick={loadPendingStatements}>נסה שוב</Button>
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
          <p className="text-muted-foreground">ניהול סקרים, הצהרות וניתוח נתונים</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="hebrew-text">סקירה כללית</TabsTrigger>
            <TabsTrigger value="polls" className="hebrew-text">ניהול סקרים</TabsTrigger>
            <TabsTrigger value="statements" className="hebrew-text">אישור הצהרות</TabsTrigger>
            <TabsTrigger value="analytics" className="hebrew-text">אנליטיקה</TabsTrigger>
            <TabsTrigger value="system" className="hebrew-text">הגדרות מערכת</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {errors.stats && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-orange-700">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.stats}</span>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">סקרים פעילים</p>
                      <p className="text-2xl font-bold">
                        {loadingStates.stats ? '...' : stats.activePolls}
                      </p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">משתתפים פעילים</p>
                      <p className="text-2xl font-bold">
                        {loadingStates.stats ? '...' : stats.totalParticipants}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">הצבעות היום</p>
                      <p className="text-2xl font-bold">
                        {loadingStates.stats ? '...' : stats.votesToday}
                      </p>
                    </div>
                    <Vote className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">הצהרות ממתינות</p>
                      <p className="text-2xl font-bold">
                        {loadingStates.stats ? '...' : stats.pendingStatements}
                      </p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>פעילות אחרונה</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div className="flex-1">
                      <p className="font-medium">מערכת הניהול פעילה ותקינה</p>
                      <p className="text-sm text-muted-foreground">עודכן זה עתה</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

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

            {errors.polls && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.polls}</span>
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

            {loadingStates.polls ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p>טוען סקרים...</p>
                </CardContent>
              </Card>
            ) : polls.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-blue-500" />
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

          {/* Statements Approval Tab */}
          <TabsContent value="statements" className="space-y-6">
            <h2 className="text-2xl font-bold">אישור הצהרות</h2>
            
            {errors.statements && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.statements}</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={loadPendingStatements}
                      className="mr-auto"
                    >
                      נסה שוב
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {loadingStates.statements ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p>טוען הצהרות ממתינות...</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {pendingStatements.map((statement) => (
                  <Card key={statement.statement_id}>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div>
                          <Badge variant="outline" className="mb-2">
                            {statement.polis_polls?.title || 'סקר לא זמין'}
                          </Badge>
                          <p className="text-lg">{statement.content}</p>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>נשלח ב-{new Date(statement.created_at).toLocaleString('he-IL')}</span>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleApproveStatement(statement.statement_id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 ml-1" />
                            אשר
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleRejectStatement(statement.statement_id)}
                          >
                            <XCircle className="h-4 w-4 ml-1" />
                            דחה
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {pendingStatements.length === 0 && !loadingStates.statements && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                      <p className="text-lg font-medium">אין הצהרות ממתינות לאישור</p>
                      <p className="text-muted-foreground">כל ההצהרות שהוגשו כבר אושרו או נדחו</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold">אנליטיקה ונתונים</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>פעילות שבועית</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                      <p>גרף פעילות יוצג כאן</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>התפלגות דעות</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Users className="h-12 w-12 mx-auto mb-2" />
                      <p>התפלגות קבוצות דעות תוצג כאן</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* System Configuration Tab */}
          <TabsContent value="system" className="space-y-6">
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
