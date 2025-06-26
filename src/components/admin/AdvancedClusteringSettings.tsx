
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Brain, 
  Zap, 
  Target, 
  Users,
  Clock,
  Database,
  RotateCcw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AlgorithmConfig {
  pca_dimensions: number;
  consensus_threshold: number;
  min_group_size: number;
}

interface ClusteringConfig {
  clustering_min_groups: number;
  clustering_max_groups: number;
  clustering_min_participants: number;
  clustering_cache_ttl_minutes: number;
  clustering_batch_size: number;
  clustering_algorithm_config: AlgorithmConfig;
  min_support_pct: number;
  max_opposition_pct: number;
  min_votes_per_group: number;
}

const DEFAULT_CONFIG: ClusteringConfig = {
  clustering_min_groups: 2,
  clustering_max_groups: 5,
  clustering_min_participants: 3,
  clustering_cache_ttl_minutes: 60,
  clustering_batch_size: 100,
  clustering_algorithm_config: {
    pca_dimensions: 2,
    consensus_threshold: 0.7,
    min_group_size: 2
  },
  min_support_pct: 50,
  max_opposition_pct: 50,
  min_votes_per_group: 1
};

export const AdvancedClusteringSettings: React.FC<{ pollId: string }> = ({ pollId }) => {
  const [config, setConfig] = useState<ClusteringConfig>(DEFAULT_CONFIG);
  const [originalConfig, setOriginalConfig] = useState<ClusteringConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('polis_polls')
        .select(`
          clustering_min_groups,
          clustering_max_groups,
          clustering_min_participants,
          clustering_cache_ttl_minutes,
          clustering_batch_size,
          clustering_algorithm_config,
          min_support_pct,
          max_opposition_pct,
          min_votes_per_group
        `)
        .eq('poll_id', pollId)
        .single();

      if (error) throw error;

      // Safely parse the algorithm config with proper type checking
      let algorithmConfig: AlgorithmConfig = DEFAULT_CONFIG.clustering_algorithm_config;
      if (data.clustering_algorithm_config) {
        try {
          const parsedConfig = typeof data.clustering_algorithm_config === 'string' 
            ? JSON.parse(data.clustering_algorithm_config) 
            : data.clustering_algorithm_config;
          
          if (parsedConfig && typeof parsedConfig === 'object') {
            algorithmConfig = {
              pca_dimensions: parsedConfig.pca_dimensions ?? DEFAULT_CONFIG.clustering_algorithm_config.pca_dimensions,
              consensus_threshold: parsedConfig.consensus_threshold ?? DEFAULT_CONFIG.clustering_algorithm_config.consensus_threshold,
              min_group_size: parsedConfig.min_group_size ?? DEFAULT_CONFIG.clustering_algorithm_config.min_group_size
            };
          }
        } catch (parseError) {
          console.warn('Failed to parse clustering_algorithm_config, using defaults:', parseError);
        }
      }

      const fetchedConfig: ClusteringConfig = {
        clustering_min_groups: data.clustering_min_groups || DEFAULT_CONFIG.clustering_min_groups,
        clustering_max_groups: data.clustering_max_groups || DEFAULT_CONFIG.clustering_max_groups,
        clustering_min_participants: data.clustering_min_participants || DEFAULT_CONFIG.clustering_min_participants,
        clustering_cache_ttl_minutes: data.clustering_cache_ttl_minutes || DEFAULT_CONFIG.clustering_cache_ttl_minutes,
        clustering_batch_size: data.clustering_batch_size || DEFAULT_CONFIG.clustering_batch_size,
        clustering_algorithm_config: algorithmConfig,
        min_support_pct: data.min_support_pct || DEFAULT_CONFIG.min_support_pct,
        max_opposition_pct: data.max_opposition_pct || DEFAULT_CONFIG.max_opposition_pct,
        min_votes_per_group: data.min_votes_per_group || DEFAULT_CONFIG.min_votes_per_group
      };

      setConfig(fetchedConfig);
      setOriginalConfig(fetchedConfig);
    } catch (error) {
      console.error('Error fetching clustering config:', error);
      toast.error('שגיאה בטעינת הגדרות הקבצה');
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from('polis_polls')
        .update({
          clustering_min_groups: config.clustering_min_groups,
          clustering_max_groups: config.clustering_max_groups,
          clustering_min_participants: config.clustering_min_participants,
          clustering_cache_ttl_minutes: config.clustering_cache_ttl_minutes,
          clustering_batch_size: config.clustering_batch_size,
          clustering_algorithm_config: config.clustering_algorithm_config,
          min_support_pct: config.min_support_pct,
          max_opposition_pct: config.max_opposition_pct,
          min_votes_per_group: config.min_votes_per_group
        })
        .eq('poll_id', pollId);

      if (error) throw error;

      setOriginalConfig(config);
      setHasChanges(false);
      toast.success('הגדרות הקבצה נשמרו בהצלחה');
    } catch (error) {
      console.error('Error saving clustering config:', error);
      toast.error('שגיאה בשמירת הגדרות הקבצה');
    } finally {
      setSaving(false);
    }
  };

  const resetConfig = () => {
    setConfig(originalConfig);
    setHasChanges(false);
  };

  const resetToDefaults = () => {
    setConfig(DEFAULT_CONFIG);
    setHasChanges(true);
  };

  useEffect(() => {
    fetchConfig();
  }, [pollId]);

  useEffect(() => {
    setHasChanges(JSON.stringify(config) !== JSON.stringify(originalConfig));
  }, [config, originalConfig]);

  if (loading) {
    return <div className="flex items-center justify-center p-8">טוען הגדרות...</div>;
  }

  return (
    <div className="space-y-6 hebrew-text">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Settings className="h-5 w-5" />
          הגדרות קבצה מתקדמות
        </h3>
        
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setConfig(DEFAULT_CONFIG);
              setHasChanges(true);
            }}
            variant="outline"
            size="sm"
          >
            <RotateCcw className="h-4 w-4 ml-1" />
            אפס לברירת מחדל
          </Button>
          
          {hasChanges && (
            <Button
              onClick={() => {
                setConfig(originalConfig);
                setHasChanges(false);
              }}
              variant="outline"
              size="sm"
            >
              בטל שינויים
            </Button>
          )}
          
          <Button
            onClick={saveConfig}
            disabled={!hasChanges || saving}
            size="sm"
          >
            {saving ? 'שומר...' : 'שמור הגדרות'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Algorithm Settings */}
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

        {/* Performance Settings */}
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

        {/* Consensus Settings */}
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

        {/* Configuration Preview */}
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
      </div>
    </div>
  );
};
