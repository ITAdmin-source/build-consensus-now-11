
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Zap } from 'lucide-react';
import { ClusteringConfig } from './types';

interface PerformanceSettingsProps {
  config: ClusteringConfig;
  setConfig: React.Dispatch<React.SetStateAction<ClusteringConfig>>;
}

export const PerformanceSettings: React.FC<PerformanceSettingsProps> = ({ config, setConfig }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          הגדרות ביצועים
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>משתתפים מינימליים לקבצה</Label>
          <Input
            type="number"
            value={config.clustering_min_participants}
            onChange={(e) => setConfig(prev => ({ ...prev, clustering_min_participants: parseInt(e.target.value) || 3 }))}
            min={3}
            max={100}
          />
        </div>

        <div className="space-y-2">
          <Label>גודל אצווה</Label>
          <Input
            type="number"
            value={config.clustering_batch_size}
            onChange={(e) => setConfig(prev => ({ ...prev, clustering_batch_size: parseInt(e.target.value) || 100 }))}
            min={10}
            max={1000}
            step={10}
          />
        </div>

        <div className="space-y-2">
          <Label>זמן מטמון (דקות)</Label>
          <Input
            type="number"
            value={config.clustering_cache_ttl_minutes}
            onChange={(e) => setConfig(prev => ({ ...prev, clustering_cache_ttl_minutes: parseInt(e.target.value) || 60 }))}
            min={5}
            max={1440}
            step={5}
          />
        </div>

        <div className="space-y-2">
          <Label>הצבעות מינימליות לקבוצה</Label>
          <Input
            type="number"
            value={config.min_votes_per_group}
            onChange={(e) => setConfig(prev => ({ ...prev, min_votes_per_group: parseInt(e.target.value) || 1 }))}
            min={1}
            max={10}
          />
        </div>
      </CardContent>
    </Card>
  );
};
