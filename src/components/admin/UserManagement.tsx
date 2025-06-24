
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  Key, 
  Shield,
  AlertCircle,
  UserCheck,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  fetchAllUsers, 
  createAdminUser, 
  assignUserRole, 
  removeUserRole, 
  deleteAdminUser,
  updateUserPassword 
} from '@/integrations/supabase/admin';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'super_admin' | 'poll_admin' | null;
  created_at: string;
  assigned_at: string | null;
  last_sign_in_at: string | null;
}

interface AdminResult {
  success: boolean;
  error?: string;
}

export const UserManagement: React.FC = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewAdminDialog, setShowNewAdminDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newAdminData, setNewAdminData] = useState({ email: '', full_name: '', password: '', role: 'poll_admin' });
  const [newPassword, setNewPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'super_admin' | 'poll_admin'>('poll_admin');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await fetchAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: 'שגיאה בטעינת המשתמשים',
        description: 'אנא נסה שוב',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async () => {
    if (!newAdminData.email.trim() || !newAdminData.full_name.trim() || !newAdminData.password.trim()) {
      toast({
        title: 'שגיאה',
        description: 'אנא מלא את כל השדות',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setActionLoading('create');
      const result = await createAdminUser({
        email: newAdminData.email,
        password: newAdminData.password,
        full_name: newAdminData.full_name,
        role: newAdminData.role as 'super_admin' | 'poll_admin'
      }) as AdminResult;
      
      if (result.success) {
        await loadUsers();
        setNewAdminData({ email: '', full_name: '', password: '', role: 'poll_admin' });
        setShowNewAdminDialog(false);
        
        toast({
          title: 'מנהל נוסף',
          description: `המנהל "${newAdminData.full_name}" נוסף בהצלחה`,
        });
      } else {
        toast({
          title: 'שגיאה ביצירת מנהל',
          description: result.error || 'שגיאה לא ידועה',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'שגיאה ביצירת מנהל',
        description: 'אנא נסה שוב',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleAssignRole = async () => {
    if (!selectedUserId) return;
    
    try {
      setActionLoading('assign');
      const result = await assignUserRole(selectedUserId, selectedRole) as AdminResult;
      
      if (result.success) {
        await loadUsers();
        setShowRoleDialog(false);
        setSelectedUserId(null);
        
        toast({
          title: 'תפקיד הוקצה',
          description: 'התפקיד הוקצה בהצלחה',
        });
      } else {
        toast({
          title: 'שגיאה בהקצאת תפקיד',
          description: result.error || 'שגיאה לא ידועה',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'שגיאה בהקצאת תפקיד',
        description: 'אנא נסה שוב',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveRole = async (userId: string) => {
    try {
      setActionLoading(`remove-${userId}`);
      const result = await removeUserRole(userId) as AdminResult;
      
      if (result.success) {
        await loadUsers();
        toast({
          title: 'תפקיד הוסר',
          description: 'התפקיד הוסר בהצלחה',
        });
      } else {
        toast({
          title: 'שגיאה בהסרת תפקיד',
          description: result.error || 'שגיאה לא ידועה',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'שגיאה בהסרת תפקיד',
        description: 'אנא נסה שוב',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user?.role === 'super_admin' && users.filter(u => u.role === 'super_admin').length === 1) {
      toast({
        title: 'לא ניתן למחוק',
        description: 'חייב להישאר לפחות מנהל ראשי אחד במערכת',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setActionLoading(`delete-${userId}`);
      const result = await deleteAdminUser(userId) as AdminResult;
      
      if (result.success) {
        await loadUsers();
        toast({
          title: 'משתמש נמחק',
          description: 'המשתמש נמחק מהמערכת',
        });
      } else {
        toast({
          title: 'שגיאה במחיקת משתמש',
          description: result.error || 'שגיאה לא ידועה',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'שגיאה במחיקת משתמש',
        description: 'אנא נסה שוב',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleChangePassword = async () => {
    if (!selectedUserId || !newPassword.trim()) return;
    
    try {
      setActionLoading('password');
      const result = await updateUserPassword(selectedUserId, newPassword) as AdminResult;
      
      if (result.success) {
        setNewPassword('');
        setSelectedUserId(null);
        setShowPasswordDialog(false);
        
        toast({
          title: 'סיסמה עודכנה',
          description: 'הסיסמה עודכנה בהצלחה',
        });
      } else {
        toast({
          title: 'שגיאה בעדכון סיסמה',
          description: result.error || 'שגיאה לא ידועה',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'שגיאה בעדכון סיסמה',
        description: 'אנא נסה שוב',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">ניהול משתמשים ומנהלים</h3>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="mr-2">טוען משתמשים...</span>
        </div>
      </div>
    );
  }

  const adminUsers = users.filter(user => user.role);
  const regularUsers = users.filter(user => !user.role);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">ניהול משתמשים ומנהלים</h3>
        <Dialog open={showNewAdminDialog} onOpenChange={setShowNewAdminDialog}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 ml-1" />
              צור מנהל חדש
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>יצירת מנהל חדש</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email">כתובת מייל</Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={newAdminData.email}
                  onChange={(e) => setNewAdminData({...newAdminData, email: e.target.value})}
                  placeholder="admin@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-name">שם מלא</Label>
                <Input
                  id="admin-name"
                  value={newAdminData.full_name}
                  onChange={(e) => setNewAdminData({...newAdminData, full_name: e.target.value})}
                  placeholder="שם מלא"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password">סיסמה</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={newAdminData.password}
                  onChange={(e) => setNewAdminData({...newAdminData, password: e.target.value})}
                  placeholder="סיסמה"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-role">תפקיד</Label>
                <select
                  id="admin-role"
                  value={newAdminData.role}
                  onChange={(e) => setNewAdminData({...newAdminData, role: e.target.value})}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="poll_admin">מנהל סקרים</option>
                  <option value="super_admin">מנהל ראשי</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewAdminDialog(false)}>
                ביטול
              </Button>
              <Button 
                onClick={handleCreateAdmin}
                disabled={actionLoading === 'create'}
              >
                {actionLoading === 'create' && <Loader2 className="h-4 w-4 animate-spin ml-1" />}
                צור
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Admin Users Section */}
      <div className="space-y-4">
        <h4 className="text-md font-medium flex items-center gap-2">
          <Shield className="h-4 w-4" />
          מנהלים ({adminUsers.length})
        </h4>
        {adminUsers.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{user.full_name || user.email}</h4>
                      <Badge variant={user.role === 'super_admin' ? 'default' : 'secondary'}>
                        {user.role === 'super_admin' ? 'מנהל ראשי' : 'מנהל סקרים'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {user.email} • 
                      {user.last_sign_in_at ? ` כניסה אחרונה: ${new Date(user.last_sign_in_at).toLocaleString('he-IL')}` : ' מעולם לא התחבר'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedUserId(user.id);
                      setShowPasswordDialog(true);
                    }}
                    disabled={actionLoading === 'password'}
                  >
                    <Key className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleRemoveRole(user.id)}
                    disabled={actionLoading === `remove-${user.id}`}
                  >
                    {actionLoading === `remove-${user.id}` ? 
                      <Loader2 className="h-4 w-4 animate-spin" /> : 
                      <UserMinus className="h-4 w-4" />
                    }
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDeleteUser(user.id)}
                    disabled={
                      actionLoading === `delete-${user.id}` || 
                      (user.role === 'super_admin' && adminUsers.filter(u => u.role === 'super_admin').length === 1)
                    }
                  >
                    {actionLoading === `delete-${user.id}` ? 
                      <Loader2 className="h-4 w-4 animate-spin" /> : 
                      <UserMinus className="h-4 w-4" />
                    }
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Regular Users Section */}
      <div className="space-y-4">
        <h4 className="text-md font-medium flex items-center gap-2">
          <Users className="h-4 w-4" />
          משתמשים רגילים ({regularUsers.length})
        </h4>
        {regularUsers.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-gray-500" />
                  <div>
                    <h4 className="font-medium">{user.full_name || user.email}</h4>
                    <p className="text-sm text-muted-foreground">
                      {user.email} • 
                      {user.last_sign_in_at ? ` כניסה אחרונה: ${new Date(user.last_sign_in_at).toLocaleString('he-IL')}` : ' מעולם לא התחבר'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedUserId(user.id);
                      setSelectedRole('poll_admin');
                      setShowRoleDialog(true);
                    }}
                    disabled={actionLoading === 'assign'}
                  >
                    <UserCheck className="h-4 w-4 ml-1" />
                    הקצה תפקיד
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDeleteUser(user.id)}
                    disabled={actionLoading === `delete-${user.id}`}
                  >
                    {actionLoading === `delete-${user.id}` ? 
                      <Loader2 className="h-4 w-4 animate-spin" /> : 
                      <UserMinus className="h-4 w-4" />
                    }
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>שינוי סיסמה</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">סיסמה חדשה</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="הכנס סיסמה חדשה..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              ביטול
            </Button>
            <Button 
              onClick={handleChangePassword}
              disabled={actionLoading === 'password'}
            >
              {actionLoading === 'password' && <Loader2 className="h-4 w-4 animate-spin ml-1" />}
              עדכן סיסמה
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Role Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>הקצאת תפקיד</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role-select">בחר תפקיד</Label>
              <select
                id="role-select"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as 'super_admin' | 'poll_admin')}
                className="w-full p-2 border rounded-md"
              >
                <option value="poll_admin">מנהל סקרים</option>
                <option value="super_admin">מנהל ראשי</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
              ביטול
            </Button>
            <Button 
              onClick={handleAssignRole}
              disabled={actionLoading === 'assign'}
            >
              {actionLoading === 'assign' && <Loader2 className="h-4 w-4 animate-spin ml-1" />}
              הקצה תפקיד
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
