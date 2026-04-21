'use client';

import React from 'react';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const map: Record<string, string> = {
    present: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    absent: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    excused: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  };
  const label: Record<string, string> = { present: 'حاضر', absent: 'غائب', excused: 'معذور' };
  
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {label[status] ?? 'غير معروف'}
    </span>
  );
};

export default StatusBadge;
