'use client';

import React from 'react';
import { Search, Filter } from 'lucide-react';

interface MessageFiltersProps {
  searchTerm: string;
  filterStatus: 'all' | 'read' | 'unread';
  onSearchChange: (value: string) => void;
  onFilterChange: (value: 'all' | 'read' | 'unread') => void;
}

const MessageFilters: React.FC<MessageFiltersProps> = ({
  searchTerm,
  filterStatus,
  onSearchChange,
  onFilterChange
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="البحث بالاسم أو رقم الهاتف..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        />
      </div>
      <div className="relative">
        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <select
          value={filterStatus}
          onChange={(e) => onFilterChange(e.target.value as any)}
          className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        >
          <option value="all">جميع الرسائل</option>
          <option value="read">مقروءة</option>
          <option value="unread">غير مقروءة</option>
        </select>
      </div>
    </div>
  );
};

export default MessageFilters;
