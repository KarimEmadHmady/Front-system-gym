'use client';

import React from 'react';

interface DismissedAlertsStatusProps {
  dismissedCount: number;
  totalAlerts: number;
  onReset: () => void;
  className?: string;
}

const DismissedAlertsStatus: React.FC<DismissedAlertsStatusProps> = ({ 
  dismissedCount, 
  totalAlerts, 
  onReset, 
  className = '' 
}) => {
  if (dismissedCount === 0) return null;

  return (
    <div className={`bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
            تم إغلاق {dismissedCount} من أصل {totalAlerts} تحذير
          </span>
        </div>
        <button
          onClick={onReset}
          className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded transition-colors"
        >
          إعادة تعيين
        </button>
      </div>
    </div>
  );
};

export default DismissedAlertsStatus;
