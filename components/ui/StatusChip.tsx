import React from 'react';
import { InstanceStatus } from '../../types';

interface StatusChipProps {
  status: InstanceStatus;
}

// Fix: Added PENDING status and updated IN_PROGRESS for consistency.
const statusStyles: { [key in InstanceStatus]: { bg: string; text: string; dot: string } } = {
  [InstanceStatus.SUCCESS]: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
  [InstanceStatus.IN_PROGRESS]: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
  [InstanceStatus.FAILED]: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
  [InstanceStatus.PENDING]: { bg: 'bg-amber-100', text: 'text-amber-800', dot: 'bg-amber-500' },
  [InstanceStatus.CANCELLED]: { bg: 'bg-slate-200', text: 'text-slate-700', dot: 'bg-slate-500' },
};

const StatusChip: React.FC<StatusChipProps> = ({ status }) => {
  const styles = statusStyles[status];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles.bg} ${styles.text}`}>
      <span className={`w-2 h-2 mr-1.5 rounded-full ${styles.dot}`}></span>
      {status}
    </span>
  );
};

export default StatusChip;