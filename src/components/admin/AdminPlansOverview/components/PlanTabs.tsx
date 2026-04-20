import React from 'react';

interface PlanTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const PlanTabs: React.FC<PlanTabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
      <nav className="flex space-x-8">
        <button
          onClick={() => setActiveTab('workout')}
          className={`py-2 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'workout'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Workout Plans
        </button>
        <button
          onClick={() => setActiveTab('diet')}
          className={`py-2 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'diet'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Diet Plans
        </button>
      </nav>
    </div>
  );
};

export default PlanTabs;
