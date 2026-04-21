'use client';

import React from 'react';

interface SessionsTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sessions: any[];
}

const SessionsTabs: React.FC<SessionsTabsProps> = ({
  activeTab,
  setActiveTab,
  sessions
}) => {
  const tabs = [
    { id: 'all', name: 'الكل', count: sessions?.length || 0 },
    { id: 'today', name: 'اليوم', count: sessions?.filter(s => new Date(s.date).toISOString().split('T')[0] === new Date().toISOString().split('T')[0]).length || 0 },
    { id: 'upcoming', name: 'المجدولة', count: sessions?.filter(s => s.status === 'مجدولة').length || 0 },
    { id: 'completed', name: 'المكتملة', count: sessions?.filter(s => s.status === 'مكتملة').length || 0 },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex m-2 gap-1 sm:gap-2 text-center align-center justify-center flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-green-500 text-green-600 dark:text-green-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.name}
              <span className="mx-1 sm:mx-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-1 sm:px-2 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default SessionsTabs;
