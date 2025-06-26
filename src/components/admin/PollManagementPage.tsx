import React, { useState } from 'react';
import { Poll } from '@/types/poll';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClusteringStatus } from '@/components/ClusteringStatus';
import { LoadTestingPanel } from '@/components/LoadTestingPanel';
import { AdvancedClusteringSettings } from '@/components/admin/clustering/AdvancedClusteringSettings';
import { 
  Settings, 
  BarChart3, 
  Zap, 
  Brain,
  Target
} from 'lucide-react';

interface PollManagementPageProps {
  poll: Poll;
  onUpdate: () => void;
}

export const PollManagementPage: React.FC<PollManagementPageProps> = ({ 
  poll, 
  onUpdate 
}) => {
  return (
    <div className="space-y-6 hebrew-text">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ניהול סקר: {poll.title}</h1>
      </div>

      <Tabs defaultValue="clustering" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="clustering" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            קבצה
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            הגדרות
          </TabsTrigger>
          <TabsTrigger value="testing" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            בדיקת עומס
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            ניתוח
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clustering" className="space-y-4">
          <ClusteringStatus
            pollId={poll.poll_id}
            clusteringJob={null}
            isRunning={false}
          />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <AdvancedClusteringSettings pollId={poll.poll_id} />
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <LoadTestingPanel pollId={poll.poll_id} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="text-center p-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4" />
            <p>ניתוח מתקדם יבוא בקרוב</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
