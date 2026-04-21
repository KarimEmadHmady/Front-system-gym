'use client';

import React from 'react';

type Props = {
  currentPage: number;
  totalPages: number;
  totalSessions: number;
  startIndex: number;
  endIndex: number;
  itemsPerPage: number;
  onPrev: () => void;
  onNext: () => void;
  onItemsPerPageChange: (n: number) => void;
};

const SessionsPagination = ({
  currentPage, totalPages, totalSessions,
  startIndex, endIndex, itemsPerPage,
  onPrev, onNext, onItemsPerPageChange,
}: Props) => {
  if (totalPages <= 1) return null;

  return (
    <div className="bg-white dark:bg-gray-800 px-2 md:px-6 py-4 border-t border-gray-200 dark:border-gray-700">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="text-sm text-gray-500 dark:text-gray-400 text-center md:text-right">
          عرض {totalSessions === 0 ? 0 : startIndex + 1} إلى {Math.min(endIndex, totalSessions)} من {totalSessions} نتيجة
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 w-full md:w-auto">
          <div className="flex flex-row items-center justify-center gap-2">
            <label className="text-sm text-gray-700 dark:text-gray-300">عدد العناصر:</label>
            <select
              value={itemsPerPage}
              onChange={e => onItemsPerPageChange(Number(e.target.value))}
              className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="flex flex-row items-center justify-center gap-2 w-full md:w-auto">
            <button onClick={onPrev} disabled={currentPage === 1} className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 w-full md:w-auto">السابق</button>
            <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300 text-center">صفحة {currentPage} من {totalPages}</span>
            <button onClick={onNext} disabled={currentPage === totalPages} className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 w-full md:w-auto">التالي</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionsPagination;