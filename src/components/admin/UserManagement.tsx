
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
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock data for admin users
const mockAdmins = [
  { id: '1', email: 'admin@example.com', name: 'מנהל ראשי', role: 'super_admin', last_login: '2024-06-21 10:30' },
  { id: '2', email: 'manager@example.com', name: 'מנהל סקרים', role: 'poll_admin', last_login: '2024-06-20 15:45' },
  { id: '3', email: 'moderator@example.com', name: 'מנהל תוכן', role: 'poll_admin', last_login: '2024-06-19 09:15' }
];

export const UserManagement: React.FC = () => {
  const { toast } = useToast();
  const [admins, setAdmins] = useState(mockAdmins);
  const [showNewAdminDialog, setShowNewAdminDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<string | null>(null);
  const [newAdminData, setNewAdminData] = useState({ email: '', name: '', password: '', role: 'poll_admin' });
  const [newPassword, setNewPassword] = useState('');

  const handleAddAdmin = () => {
    if (!newAdminData.email.trim() || !newAdminData.name.trim() || !newAdminData.password.trim()) return;
    
    const newAdmin = {
      id: Date.now().toString(),
      email: newAdminData.email,
      name: newAdminData.name,
      role: newAdminData.role as 'super_admin' | 'poll_admin',
      last_login: 'מעולם לא התחבר'
    };
    
    setAdmins([...admins, newAdmin]);
    setNewAdminData({ email: '', name: '', password: '', role: 'poll_admin' });
    setShowNewAdminDialog(false);
    
    toast({
      title: 'מנהל נוסף',
      description: `המנהל "${newAdminData.name}" נוסף בהצלחה`,
    });
  };

  const handleRemoveAdmin = (adminId: string) => {
    const admin = admins.find(a => a.id === adminId);
    if (admin?.role === 'super_admin' && admins.filter(a => a.role === 'super_admin').length === 1) {
      toast({
        title: 'לא ניתן למחוק',
        description: 'חייב להישאר לפחות מנהל אחד במערכת',
        variant: 'destructive',
      });
      return;
    }
    
    setAdmins(admins.filter(a => a.id !== adminId));
    toast({
      title: 'מנהל הוסר',
      description: 'המנהל הוסר מהמערכת',
    });
  };

  const handleChangePassword = () => {
    if (!newPassword.trim()) return;
    
    setNewPassword('');
    setSelectedAdmin(null);
    setShowPasswordDialog(false);
    
    toast({
      title: 'סיסמה עודכנה',
      description: 'הסיסמה עודכנה בהצלחה',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">ניהול משתמשים ומנהלים</h3>
        <Dialog open={showNewAdminDialog} onOpenChange={setShowNewAdminDialog}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 ml-1" />
              הוסף מנהל
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>הוספת מנהל חדש</DialogTitle>
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
                  value={newAdminData.name}
                  onChange={(e) => setNewAdminData({...newAdminData, name: e.target.value})}
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
              <Button onClick={handleAddAdmin}>הוסף</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {admins.map((admin) => (
          <Card key={admin.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{admin.name}</h4>
                      <Badge variant={admin.role === 'super_admin' ? 'default' : 'secondary'}>
                        {admin.role === 'super_admin' ? 'מנהל ראשי' : 'מנהל סקרים'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {admin.email} • כניסה אחרונה: {admin.last_login}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedAdmin(admin.id);
                      setShowPasswordDialog(true);
                    }}
                  >
                    <Key className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleRemoveAdmin(admin.id)}
                    disabled={admin.role === 'super_admin' && admins.filter(a => a.role === 'super_admin').length === 1}
                  >
                    <UserMinus className="h-4 w-4" />
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
            <Button onClick={handleChangePassword}>עדכן סיסמה</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
