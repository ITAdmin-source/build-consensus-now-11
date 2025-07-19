
import React from 'react';
import { UserPollParticipation } from '@/components/UserPollParticipation';
import { useUserParticipation } from '@/hooks/useUserParticipation';

export const ActivityTab: React.FC = () => {
  const { participation, loading, error } = useUserParticipation();

  return (
    <div className="space-y-6">
      <UserPollParticipation 
        participation={participation}
        loading={loading}
        error={error}
      />
    </div>
  );
};
