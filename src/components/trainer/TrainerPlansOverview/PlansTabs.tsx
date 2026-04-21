'use client';

import React from 'react';

interface PlansTabsProps {
  activeTab: string;
  workoutPlans: any[];
  dietPlans: any[];
  onTabChange: (tabId: string) => void;
  dietLoading: boolean;
  dietError: string | null;
}

const PlansTabs: React.FC<PlansTabsProps> = ({
  activeTab,
  workoutPlans,
  dietPlans,
  onTabChange,
  dietLoading,
  dietError
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'workout', name: 'خطط التمرين', count: workoutPlans.length, icon: '🏋️' },
            { id: 'diet', name: 'الخطط الغذائية', count: dietPlans.length, icon: '🍎' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center ${
                activeTab === tab.id
                  ? 'border-green-500 text-green-600 dark:text-green-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
              <span className="mx-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 py-1 px-2 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default PlansTabs;
