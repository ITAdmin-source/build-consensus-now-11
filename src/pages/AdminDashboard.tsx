import React, { useState } from 'react';
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

// Mock data for demonstration
const mockPolls = [
  {
    id: '1',
    title: 'עתיד החינוך בישראל',
    status: 'active',
    votes: 1247,
    participants: 89,
    consensus_points: 3,
    target: 5,
    end_time: '2024-12-31T23:59:59'
  },
  {
    id: '2', 
    title: 'מדיניות תחבורה ציבורית',
    status: 'closed',
    votes: 856,
    participants: 67,
    consensus_points: 7,
    target: 6,
    end_time: '2024-06-15T23:59:59'
  }
];

const mockPendingStatements = [
  {
    id: '1',
    content: 'יש להשקיע יותר בטכנולוגיה חינוכית',
    poll_title: 'עתיד החינוך בישראל',
    submitted_by: 'משתמש_123',
    submitted_at: '2024-06-20T14:30:00'
  },
  {
    id: '2',
    content: 'תחבורה ציבורית חינמית תפחית עומס תנועה',
    poll_title: 'מדיניות תחבורה ציבורית', 
    submitted_by: 'משתמש_456',
    submitted_at: '2024-06-20T16:45:00'
  }
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { admin, logout } = useAdmin();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [showNewPollDialog, setShowNewPollDialog] = useState(false);

  const handleLogout = () => {
    logout();
    toast({
      title: 'התנתקת בהצלחה',
      description: 'להתראות!',
    });
    navigate('/');
  };

  const handleApproveStatement = (statementId: string) => {
    toast({
      title: 'הצהרה אושרה',
      description: 'ההצהרה נוספה לסקר בהצלחה',
    });
  };

  const handleRejectStatement = (statementId: string) => {
    toast({
      title: 'הצהרה נדחתה',
      description: 'ההצהרה הוסרה מהמתנה',
    });
  };

  const handleEditPoll = (pollId: string) => {
    navigate(`/admin/edit-poll/${pollId}`);
  };

  const handleNewPollSuccess = () => {
    setShowNewPollDialog(false);
    setActiveTab('polls');
    toast({
      title: 'סקר נוצר בהצלחה',
      description: 'הסקר החדש זמין בכרטיסיית ניהול הסקרים',
    });
  };

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">סקרים פעילים</p>
                      <p className="text-2xl font-bold">12</p>
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
                      <p className="text-2xl font-bold">1,247</p>
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
                      <p className="text-2xl font-bold">389</p>
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
                      <p className="text-2xl font-bold">{mockPendingStatements.length}</p>
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
                      <p className="font-medium">סקר חדש נוצר: "מדיניות דיור"</p>
                      <p className="text-sm text-muted-foreground">לפני 2 שעות</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Users className="h-5 w-5 text-blue-500" />
                    <div className="flex-1">
                      <p className="font-medium">23 משתתפים חדשים הצטרפו היום</p>
                      <p className="text-sm text-muted-foreground">לפני 4 שעות</p>
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

            <div className="grid gap-6">
              {mockPolls.map((poll) => (
                <Card key={poll.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">{poll.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {poll.participants} משתתפים
                          </div>
                          <div className="flex items-center gap-1">
                            <Vote className="h-4 w-4" />
                            {poll.votes} הצבעות
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="h-4 w-4" />
                            {poll.consensus_points}/{poll.target} נק' חיבור
                          </div>
                        </div>
                      </div>
                      <Badge variant={poll.status === 'active' ? 'default' : 'secondary'}>
                        {poll.status === 'active' ? 'פעיל' : 'סגור'}
                      </Badge>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditPoll(poll.id)}
                      >
                        <Edit className="h-4 w-4 ml-1" />
                        עריכה
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 ml-1" />
                        תוצאות
                      </Button>
                      <Button variant="outline" size="sm">
                        <Clock className="h-4 w-4 ml-1" />
                        הארך זמן
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Statements Approval Tab */}
          <TabsContent value="statements" className="space-y-6">
            <h2 className="text-2xl font-bold">אישור הצהרות</h2>
            
            <div className="grid gap-4">
              {mockPendingStatements.map((statement) => (
                <Card key={statement.id}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <Badge variant="outline" className="mb-2">
                          {statement.poll_title}
                        </Badge>
                        <p className="text-lg">{statement.content}</p>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>נשלח על ידי: {statement.submitted_by}</span>
                        <span>ב-{new Date(statement.submitted_at).toLocaleString('he-IL')}</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleApproveStatement(statement.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 ml-1" />
                          אשר
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleRejectStatement(statement.id)}
                        >
                          <XCircle className="h-4 w-4 ml-1" />
                          דחה
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
