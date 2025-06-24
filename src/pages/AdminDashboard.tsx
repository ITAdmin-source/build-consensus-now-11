
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Cog } from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { PollsManagement } from '@/components/admin/PollsManagement';
import { SystemConfig } from '@/components/admin/SystemConfig';
import { UserManagement } from '@/components/admin/UserManagement';

const AdminDashboard = () => {
  const { user, signOut, userRole, isSuperAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('polls');

  const userName = user?.user_metadata?.full_name || user?.email || 'מנהל';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 hebrew-text">
      <AdminHeader 
        userName={userName}
        userRole={userRole || ''}
        onSignOut={signOut}
      />

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

          <TabsContent value="polls" className="space-y-6">
            <PollsManagement />
          </TabsContent>

          {isSuperAdmin && (
            <TabsContent value="users" className="space-y-6">
              <div className="flex items-center gap-2 mb-6">
                <Users className="h-6 w-6" />
                <h2 className="text-2xl font-bold">ניהול משתמשים ותפקידים</h2>
              </div>
              <UserManagement />
            </TabsContent>
          )}

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
