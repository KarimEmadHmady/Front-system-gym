'use client';

import React from 'react';

interface ProgressHeaderProps {
  progressModalClient: any;
  onShowCreateModal: () => void;
}

const ProgressHeader: React.FC<ProgressHeaderProps> = ({
  progressModalClient,
  onShowCreateModal
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-0">
          سجل تقدم {progressModalClient?.name}
        </h3>
        <div className="flex space-x-2">
          <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition-colors" onClick={onShowCreateModal}>
            إنشاء سجل تقدم
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProgressHeader;
