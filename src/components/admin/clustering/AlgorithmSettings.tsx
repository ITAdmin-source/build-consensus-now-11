
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Brain } from 'lucide-react';
import { ClusteringConfig } from './types';

interface AlgorithmSettingsProps {
  config: ClusteringConfig;
  setConfig: React.Dispatch<React.SetStateAction<ClusteringConfig>>;
}

export const AlgorithmSettings: React.FC<AlgorithmSettingsProps> = ({ config, setConfig }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          הגדרות אלגוריתם
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>מספר קבוצות מינימלי</Label>
          <Slider
            value={[config.clustering_min_groups]}
            onValueChange={([value]) => setConfig(prev => ({ ...prev, clustering_min_groups: value }))}
            min={2}
            max={8}
            step={1}
            className="py-4"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>2</span>
            <Badge variant="outline">{config.clustering_min_groups}</Badge>
            <span>8</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label>מספר קבוצות מקסימלי</Label>
          <Slider
            value={[config.clustering_max_groups]}
            onValueChange={([value]) => setConfig(prev => ({ ...prev, clustering_max_groups: Math.max(value, prev.clustering_min_groups) }))}
            min={config.clustering_min_groups}
            max={10}
            step={1}
            className="py-4"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{config.clustering_min_groups}</span>
            <Badge variant="outline">{config.clustering_max_groups}</Badge>
            <span>10</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label>גודל קבוצה מינימלי</Label>
          <Input
            type="number"
            value={config.clustering_algorithm_config.min_group_size}
            onChange={(e) => setConfig(prev => ({
              ...prev,
              clustering_algorithm_config: {
                ...prev.clustering_algorithm_config,
                min_group_size: parseInt(e.target.value) || 1
              }
            }))}
            min={1}
            max={50}
          />
        </div>

        <div className="space-y-2">
          <Label>סף הסכמה</Label>
          <Slider
            value={[config.clustering_algorithm_config.consensus_threshold * 100]}
            onValueChange={([value]) => setConfig(prev => ({
              ...prev,
              clustering_algorithm_config: {
                ...prev.clustering_algorithm_config,
                consensus_threshold: value / 100
              }
            }))}
            min={50}
            max={95}
            step={5}
            className="py-4"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>50%</span>
            <Badge variant="outline">{Math.round(config.clustering_algorithm_config.consensus_threshold * 100)}%</Badge>
            <span>95%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
