
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { getSystemSetting } from '@/integrations/supabase/settings';
import { GeneralSettings } from './settings/GeneralSettings';
import { CategoriesManagement } from './settings/CategoriesManagement';
import { MicroserviceSettings } from './MicroserviceSettings';

export const SystemConfig: React.FC = () => {
  const { toast } = useToast();
  const [minStatements, setMinStatements] = useState(6);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      console.log('Loading system settings...');
      
      const minStatementsValue = await getSystemSetting('min_statements_per_poll');
      if (minStatementsValue) {
        setMinStatements(parseInt(minStatementsValue, 10));
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast({
        title: 'שגיאה בטעינת הנתונים',
        description: 'אנא נסה שוב',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
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
    <Tabs defaultValue="general" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="general" className="hebrew-text">הגדרות כלליות</TabsTrigger>
        <TabsTrigger value="categories" className="hebrew-text">ניהול קטגוריות</TabsTrigger>
        <TabsTrigger value="microservice" className="hebrew-text">מיקרו-שירות</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="space-y-6">
        <GeneralSettings 
          initialMinStatements={minStatements}
          onMinStatementsChange={setMinStatements}
        />
      </TabsContent>

      <TabsContent value="categories" className="space-y-6">
        <CategoriesManagement />
      </TabsContent>

      <TabsContent value="microservice" className="space-y-6">
        <MicroserviceSettings />
      </TabsContent>
    </Tabs>
  );
};
