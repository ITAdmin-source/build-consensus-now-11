
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Database } from 'lucide-react';
import { ClusteringConfig } from './types';

interface ConfigurationPreviewProps {
  config: ClusteringConfig;
}

export const ConfigurationPreview: React.FC<ConfigurationPreviewProps> = ({ config }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          תצוגה מקדימה
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm space-y-2">
          <div className="flex justify-between">
            <span>טווח קבוצות:</span>
            <Badge>{config.clustering_min_groups}-{config.clustering_max_groups}</Badge>
          </div>
          <div className="flex justify-between">
            <span>סף הסכמה:</span>
            <Badge>{Math.round(config.clustering_algorithm_config.consensus_threshold * 100)}%</Badge>
          </div>
          <div className="flex justify-between">
            <span>גודל אצווה:</span>
            <Badge>{config.clustering_batch_size}</Badge>
          </div>
          <div className="flex justify-between">
            <span>מטמון:</span>
            <Badge>{config.clustering_cache_ttl_minutes}m</Badge>
          </div>
        </div>
        
        <Separator />
        
        <div className="text-xs text-muted-foreground">
          <p>• הגדרות אלו משפיעות על דיוק ומהירות הקבצה</p>
          <p>• שינויים דורשים הפעלה מחדש של אלגוריתם הקבצה</p>
          <p>• מומלץ לבדוק בבדיקת עומס לפני הפעלה מלאה</p>
        </div>
      </CardContent>
    </Card>
  );
};
