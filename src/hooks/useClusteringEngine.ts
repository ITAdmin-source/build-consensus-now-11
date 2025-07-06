// This file has been deprecated in favor of useSmartClustering.ts
// Keeping this file for backward compatibility but marking as deprecated

export const useClusteringEngine = () => {
  console.warn('useClusteringEngine is deprecated. Use useSmartClustering instead.');
  
  return {
    triggerClustering: () => {
      throw new Error('useClusteringEngine is deprecated. Use useSmartClustering instead.');
    },
    isLoading: false
  };
};
