'use client';

import React from 'react';
import { UserCheck, FileText, Plus } from 'lucide-react';

interface AttendanceHeaderProps {
  onExport: () => void;
  onAddRecord: () => void;
}

const AttendanceHeader: React.FC<AttendanceHeaderProps> = ({
  onExport,
  onAddRecord
}) => {
  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white">سجلات حضوري</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-2 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[11px] transition-colors"
          >
            <FileText className="w-4 h-4" />
            تصدير البيانات
          </button>
          {/* <button 
            onClick={onAddRecord} 
            className="flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            إضافة سجل
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default AttendanceHeader;
