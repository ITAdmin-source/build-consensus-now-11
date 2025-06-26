
import React from 'react';
import { ClusteringDashboard } from '@/components/admin/ClusteringDashboard';
import { NavigationHeader } from '@/components/NavigationHeader';

const AdminClusteringDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <NavigationHeader currentPage="admin" />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <ClusteringDashboard />
      </div>
    </div>
  );
};

export default AdminClusteringDashboard;
