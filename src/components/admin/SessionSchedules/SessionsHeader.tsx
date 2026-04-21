'use client';

import React from 'react';

type Props = {
  viewMode: 'overview' | 'management';
  userRole: 'admin' | 'manager';
  totalRevenue: number;
  filterDate: string;
  setFilterDate: (v: string) => void;
  onAddSession: () => void;
  onExport: () => void;
};

const SessionsHeader = ({
  viewMode, userRole, totalRevenue,
  filterDate, setFilterDate,
  onAddSession, onExport,
}: Props) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-0 w-full text-center sm:text-right sm:w-auto">
          {viewMode === 'overview'
            ? `إدارة الحصص - ${userRole === 'admin' ? 'الإدارة' : 'الإدارة'}`
            : 'إدارة جدولة الحصص'}
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 sm:space-x-reverse gap-2 sm:gap-0 w-full sm:w-auto">
          <div className="text-center sm:text-right sm:ml-6">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">إجمالي الإيرادات</p>
            <p className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400">ج.م {totalRevenue}</p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            {/* Date Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <label htmlFor="filterDate" className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 text-center sm:text-right">
                بحث بالتاريخ
              </label>
              <input
                type="date"
                id="filterDate"
                value={filterDate}
                onChange={e => setFilterDate(e.target.value)}
                onClick={e => (e.currentTarget as HTMLInputElement).showPicker?.()}
                className="px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-pointer text-xs sm:text-sm text-center sm:text-right"
              />
              {filterDate && (
                <button
                  onClick={() => setFilterDate('')}
                  className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 sm:px-3 py-1 sm:py-2 rounded-md text-xs sm:text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  مسح التاريخ
                </button>
              )}
            </div>

            {viewMode === 'management' && (
              <button
                onClick={onAddSession}
                className="bg-gray-600 text-white w-full sm:w-32 py-2 sm:py-3 rounded-md text-xs sm:text-sm hover:bg-gray-700 transition-colors text-center mt-1 sm:mt-0"
              >
                إضافة حصة جديدة
              </button>
            )}

            <button
              onClick={onExport}
              className="bg-green-600 hover:bg-green-700 text-white px-2 sm:px-3 py-2 sm:py-3 rounded-md text-xs sm:text-sm transition-colors w-full sm:w-auto mt-1 sm:mt-0"
            >
              تصدير البيانات
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionsHeader;