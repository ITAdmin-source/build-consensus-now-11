
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  UserCheck,
  Shield,
  AlertCircle,
  Loader2,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UserManagementEnhanced } from './UserManagementEnhanced';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'participant' | 'poll_admin' | 'super_admin';
  created_at: string;
  assigned_at: string | null;
  last_sign_in_at: string | null;
}

export const UserManagement: React.FC = () => {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<'enhanced' | 'legacy'>('enhanced');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">ניהול משתמשים ותפקידים</h3>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'enhanced' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('enhanced')}
          >
            <Settings className="h-4 w-4 ml-1" />
            תצוגה מתקדמת
          </Button>
        </div>
      </div>

      <UserManagementEnhanced />
    </div>
  );
};
