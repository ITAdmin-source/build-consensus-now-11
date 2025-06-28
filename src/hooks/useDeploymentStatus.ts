
import { useState, useEffect } from 'react';
import { getSystemSetting, updateSystemSetting } from '@/integrations/supabase/settings';

interface DeploymentStatus {
  status: 'not_deployed' | 'deploying' | 'deployed' | 'error';
  url?: string;
  lastCheck?: string;
  error?: string;
}

export const useDeploymentStatus = () => {
  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStatus>({
    status: 'not_deployed'
  });
  const [loading, setLoading] = useState(true);

  const checkDeploymentStatus = async () => {
    try {
      const [status, url, lastCheck] = await Promise.all([
        getSystemSetting('clustering_microservice_status'),
        getSystemSetting('clustering_microservice_url'),
        getSystemSetting('clustering_microservice_last_check')
      ]);

      setDeploymentStatus({
        status: (status as any) || 'not_deployed',
        url: url || undefined,
        lastCheck: lastCheck || undefined
      });
    } catch (error) {
      console.error('Error checking deployment status:', error);
      setDeploymentStatus({
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateDeploymentStatus = async (
    status: DeploymentStatus['status'],
    url?: string,
    error?: string
  ) => {
    try {
      await Promise.all([
        updateSystemSetting('clustering_microservice_status', status),
        url ? updateSystemSetting('clustering_microservice_url', url) : Promise.resolve(),
        updateSystemSetting('clustering_microservice_last_check', new Date().toISOString())
      ]);

      setDeploymentStatus({
        status,
        url,
        lastCheck: new Date().toISOString(),
        error
      });
    } catch (error) {
      console.error('Error updating deployment status:', error);
    }
  };

  useEffect(() => {
    checkDeploymentStatus();
  }, []);

  return {
    deploymentStatus,
    loading,
    checkDeploymentStatus,
    updateDeploymentStatus
  };
};
