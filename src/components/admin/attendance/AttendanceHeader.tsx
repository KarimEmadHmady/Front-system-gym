import React from 'react';

interface AttendanceHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onExportToExcel: () => void;
  onOpenAddModal: () => void;
  filteredRecordsCount: number;
}

export const AttendanceHeader: React.FC<AttendanceHeaderProps> = ({
  searchQuery,
  setSearchQuery,
  onExportToExcel,
  onOpenAddModal,
  filteredRecordsCount,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 md:mb-0">
        سجلات الحضور
      </h3>
      <div className="flex flex-col md:flex-row items-stretch gap-2 w-full md:w-auto">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="البحث بالاسم أو الهاتف"
          className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 w-full md:w-auto"
        />
        <button
          className="px-4 flex justify-center py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm flex items-center gap-1 w-full md:w-auto"
          onClick={onExportToExcel}
          disabled={filteredRecordsCount === 0}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          تصدير Excel
        </button>
        <button
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm w-full md:w-auto"
          onClick={onOpenAddModal}
        >
          إضافة سجل
        </button>
      </div>
    </div>
  );
};
