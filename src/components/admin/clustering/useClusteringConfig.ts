
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ClusteringConfig, AlgorithmConfig, DEFAULT_CONFIG } from './types';

export const useClusteringConfig = (pollId: string) => {
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
          clustering_algorithm_config: JSON.stringify(config.clustering_algorithm_config),
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

  return {
    config,
    setConfig,
    loading,
    saving,
    hasChanges,
    saveConfig,
    resetConfig,
    resetToDefaults
  };
};
