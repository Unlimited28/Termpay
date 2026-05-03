import React from 'react';
import { PageHeader } from '../../components/ui';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" />
      <div className="bg-white p-8 rounded-xl shadow-premium border border-surface-border text-center">
        <p className="text-text-secondary">Dashboard coming in Slice 5</p>
      </div>
    </div>
  );
};

export default Dashboard;
