'use client';

import React from 'react';

interface AlertResetButtonProps {
  onReset: () => void;
  className?: string;
}

const AlertResetButton: React.FC<AlertResetButtonProps> = ({ 
  onReset, 
  className = '' 
}) => {
  return (
    <button
      onClick={onReset}
      className={`inline-flex items-center px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-colors ${className}`}
      title="إعادة تعيين التحذيرات المغلقة"
    >
      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      إعادة تعيين التحذيرات
    </button>
  );
};

export default AlertResetButton;
