
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Target } from 'lucide-react';
import { ClusteringConfig } from './types';

interface ConsensusSettingsProps {
  config: ClusteringConfig;
  setConfig: React.Dispatch<React.SetStateAction<ClusteringConfig>>;
}

export const ConsensusSettings: React.FC<ConsensusSettingsProps> = ({ config, setConfig }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          הגדרות נקודות הסכמה
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>אחוז תמיכה מינימלי</Label>
          <Slider
            value={[config.min_support_pct]}
            onValueChange={([value]) => setConfig(prev => ({ ...prev, min_support_pct: value }))}
            min={30}
            max={90}
            step={5}
            className="py-4"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>30%</span>
            <Badge variant="outline">{config.min_support_pct}%</Badge>
            <span>90%</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label>אחוז התנגדות מקסימלי</Label>
          <Slider
            value={[config.max_opposition_pct]}
            onValueChange={([value]) => setConfig(prev => ({ ...prev, max_opposition_pct: value }))}
            min={10}
            max={70}
            step={5}
            className="py-4"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>10%</span>
            <Badge variant="outline">{config.max_opposition_pct}%</Badge>
            <span>70%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
