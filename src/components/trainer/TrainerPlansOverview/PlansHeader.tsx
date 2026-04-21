'use client';

import React from 'react';

interface PlansHeaderProps {
  activeTab: string;
  onShowCreateModal: () => void;
  onShowCreateDietModal: () => void;
}

const PlansHeader: React.FC<PlansHeaderProps> = ({
  activeTab,
  onShowCreateModal,
  onShowCreateDietModal
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-0">
          خططي
        </h3>
        <div className="flex space-x-2">
          {activeTab === 'workout' ? (
            <button className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700 transition-colors" onClick={onShowCreateModal}>
              إنشاء خطة تمرين
            </button>
          ) : (
            <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition-colors" onClick={onShowCreateDietModal}>
              إنشاء خطة غذائية
            </button>
          )}
          <button className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
            تصدير البيانات
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlansHeader;
