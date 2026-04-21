'use client';

import React from 'react';
import type { TabDef, TabId } from './types';

type Props = {
  tabs: TabDef[];
  activeTab: TabId;
  onTabChange: (id: TabId) => void;
};

const SessionsTabs = ({ tabs, activeTab, onTabChange }: Props) => {
  const tabClass = (id: string) =>
    `py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
      activeTab === id
        ? 'border-gray-500 text-gray-600 dark:text-gray-400'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
    }`;

  const badge = (count: number) => (
    <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 py-0 px-2 mx-2 rounded-full text-xs">
      {count}
    </span>
  );

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      {/* Mobile */}
      <div className="md:hidden w-full pb-2">
        <nav className="flex flex-col space-y-2 px-2 py-2">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => onTabChange(tab.id)} className={tabClass(tab.id) + ' mb-4'}>
              {tab.name}{badge(tab.count)}
            </button>
          ))}
        </nav>
      </div>
      {/* Desktop */}
      <nav className="hidden md:flex space-x-8 px-6 justify-center flex-wrap">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => onTabChange(tab.id)} className={tabClass(tab.id)}>
            {tab.name}{badge(tab.count)}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default SessionsTabs;