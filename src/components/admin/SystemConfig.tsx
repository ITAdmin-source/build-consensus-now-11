
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { 
  Settings, 
  Users, 
  Tags, 
  Plus, 
  Edit, 
  Trash2,
  UserPlus,
  UserMinus,
  Key,
  Save
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock data for categories
const mockCategories = [
  { id: '1', name: 'חינוך', polls_count: 5 },
  { id: '2', name: 'תחבורה', polls_count: 3 },
  { id: '3', name: 'בריאות', polls_count: 2 },
  { id: '4', name: 'כלכלה', polls_count: 4 }
];

// Mock data for admin users
const mockAdmins = [
  { id: '1', username: 'admin', name: 'מנהל ראשי', role: 'super_admin', last_login: '2024-06-21 10:30' },
  { id: '2', username: 'manager1', name: 'מנהל סקרים', role: 'poll_admin', last_login: '2024-06-20 15:45' },
  { id: '3', username: 'moderator1', name: 'מנהל תוכן', role: 'poll_admin', last_login: '2024-06-19 09:15' }
];

export const SystemConfig: React.FC = () => {
  const { toast } = useToast();
  const [minStatements, setMinStatements] = useState(6);
  const [categories, setCategories] = useState(mockCategories);
  const [admins, setAdmins] = useState(mockAdmins);
  const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false);
  const [showNewAdminDialog, setShowNewAdminDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newAdminData, setNewAdminData] = useState({ username: '', name: '', password: '', role: 'poll_admin' });
  const [newPassword, setNewPassword] = useState('');

  const handleSaveMinStatements = () => {
    toast({
      title: 'הגדרות נשמרו',
      description: `מינימום הצהרות לסקר עודכן ל-${minStatements}`,
    });
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    
    const newCategory = {
      id: Date.now().toString(),
      name: newCategoryName,
      polls_count: 0
    };
    
    setCategories([...categories, newCategory]);
    setNewCategoryName('');
    setShowNewCategoryDialog(false);
    
    toast({
      title: 'קטגוריה נוספה',
      description: `הקטגוריה "${newCategoryName}" נוספה בהצלחה`,
    });
  };

  const handleDeleteCategory = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (category && category.polls_count > 0) {
      toast({
        title: 'לא ניתן למחוק',
        description: 'לא ניתן למחוק קטגוריה שיש בה סקרים פעילים',
        variant: 'destructive',
      });
      return;
    }
    
    setCategories(categories.filter(c => c.id !== categoryId));
    toast({
      title: 'קטגוריה נמחקה',
      description: 'הקטגוריה נמחקה בהצלחה',
    });
  };

  const handleAddAdmin = () => {
    if (!newAdminData.username.trim() || !newAdminData.name.trim() || !newAdminData.password.trim()) return;
    
    const newAdmin = {
      id: Date.now().toString(),
      username: newAdminData.username,
      name: newAdminData.name,
      role: newAdminData.role as 'super_admin' | 'poll_admin',
      last_login: 'מעולם לא התחבר'
    };
    
    setAdmins([...admins, newAdmin]);
    setNewAdminData({ username: '', name: '', password: '', role: 'poll_admin' });
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
    <Tabs defaultValue="general" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="general" className="hebrew-text">הגדרות כלליות</TabsTrigger>
        <TabsTrigger value="categories" className="hebrew-text">ניהול קטגוריות</TabsTrigger>
        <TabsTrigger value="admins" className="hebrew-text">ניהול מנהלים</TabsTrigger>
      </TabsList>

      {/* General Settings Tab */}
      <TabsContent value="general" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              הגדרות מערכת כלליות
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="min-statements">מינימום הצהרות לסקר חדש</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="min-statements"
                  type="number"
                  value={minStatements}
                  onChange={(e) => setMinStatements(Number(e.target.value))}
                  min={1}
                  max={50}
                  className="w-32"
                />
                <Button onClick={handleSaveMinStatements} size="sm">
                  <Save className="h-4 w-4 ml-1" />
                  שמור
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                מספר ההצהרות המינימלי הנדרש ליצירת סקר חדש
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Categories Management Tab */}
      <TabsContent value="categories" className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">ניהול קטגוריות</h3>
          <Dialog open={showNewCategoryDialog} onOpenChange={setShowNewCategoryDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 ml-1" />
                קטגוריה חדשה
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>הוספת קטגוריה חדשה</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category-name">שם הקטגוריה</Label>
                  <Input
                    id="category-name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="הכנס שם קטגוריה..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewCategoryDialog(false)}>
                  ביטול
                </Button>
                <Button onClick={handleAddCategory}>הוסף</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {categories.map((category) => (
            <Card key={category.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Tags className="h-5 w-5 text-blue-500" />
                    <div>
                      <h4 className="font-medium">{category.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {category.polls_count} סקרים
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteCategory(category.id)}
                      disabled={category.polls_count > 0}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      {/* Admin Management Tab */}
      <TabsContent value="admins" className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">ניהול מנהלים</h3>
          <Dialog open={showNewAdminDialog} onOpenChange={setShowNewAdminDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 ml-1" />
                מנהל חדש
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>הוספת מנהל חדש</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-username">שם משתמש</Label>
                  <Input
                    id="admin-username"
                    value={newAdminData.username}
                    onChange={(e) => setNewAdminData({...newAdminData, username: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-name">שם מלא</Label>
                  <Input
                    id="admin-name"
                    value={newAdminData.name}
                    onChange={(e) => setNewAdminData({...newAdminData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-password">סיסמה</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    value={newAdminData.password}
                    onChange={(e) => setNewAdminData({...newAdminData, password: e.target.value})}
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
                    <Users className="h-5 w-5 text-green-500" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{admin.name}</h4>
                        <Badge variant={admin.role === 'super_admin' ? 'default' : 'secondary'}>
                          {admin.role === 'super_admin' ? 'מנהל ראשי' : 'מנהל סקרים'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        @{admin.username} • כניסה אחרונה: {admin.last_login}
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
      </TabsContent>
    </Tabs>
  );
};
