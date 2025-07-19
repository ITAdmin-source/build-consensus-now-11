
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Activity, Brain, Settings } from 'lucide-react';

interface AccountTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const AccountTabs: React.FC<AccountTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm h-12">
        <TabsTrigger 
          value="profile" 
          className="flex items-center gap-2 data-[state=active]:bg-[#1a305b] data-[state=active]:text-white"
        >
          <User className="h-4 w-4" />
          פרופיל
        </TabsTrigger>
        <TabsTrigger 
          value="activity" 
          className="flex items-center gap-2 data-[state=active]:bg-[#1a305b] data-[state=active]:text-white"
        >
          <Activity className="h-4 w-4" />
          פעילות
        </TabsTrigger>
        <TabsTrigger 
          value="insights" 
          className="flex items-center gap-2 data-[state=active]:bg-[#1a305b] data-[state=active]:text-white"
        >
          <Brain className="h-4 w-4" />
          תובנות
        </TabsTrigger>
        <TabsTrigger 
          value="settings" 
          className="flex items-center gap-2 data-[state=active]:bg-[#1a305b] data-[state=active]:text-white"
        >
          <Settings className="h-4 w-4" />
          הגדרות
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
