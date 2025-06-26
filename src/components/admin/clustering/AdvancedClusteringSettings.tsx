
import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings, RotateCcw } from 'lucide-react';
import { useClusteringConfig } from './useClusteringConfig';
import { AlgorithmSettings } from './AlgorithmSettings';
import { PerformanceSettings } from './PerformanceSettings';
import { ConsensusSettings } from './ConsensusSettings';
import { ConfigurationPreview } from './ConfigurationPreview';

export const AdvancedClusteringSettings: React.FC<{ pollId: string }> = ({ pollId }) => {
  const {
    config,
    setConfig,
    loading,
    saving,
    hasChanges,
    saveConfig,
    resetConfig,
    resetToDefaults
  } = useClusteringConfig(pollId);

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
            onClick={resetToDefaults}
            variant="outline"
            size="sm"
          >
            <RotateCcw className="h-4 w-4 ml-1" />
            אפס לברירת מחדל
          </Button>
          
          {hasChanges && (
            <Button
              onClick={resetConfig}
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
        <AlgorithmSettings config={config} setConfig={setConfig} />
        <PerformanceSettings config={config} setConfig={setConfig} />
        <ConsensusSettings config={config} setConfig={setConfig} />
        <ConfigurationPreview config={config} />
      </div>
    </div>
  );
};
