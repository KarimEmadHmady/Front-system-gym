'use client';

import React from 'react';
import { UserCheck, DollarSign, Plus, FileText } from 'lucide-react';

interface SessionsHeaderProps {
  totalRevenue: number;
  onShowCreateModal: () => void;
  onExport: () => void;
}

const SessionsHeader: React.FC<SessionsHeaderProps> = ({
  totalRevenue,
  onShowCreateModal,
  onExport
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 mb-4 sm:mb-0">
            <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white">
              حصصي التدريبية
            </h3>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
                إجمالي الإيرادات
              </p>
              <p className="text-sm sm:text-xl font-bold text-green-600 dark:text-green-400">ج.م {totalRevenue}</p>
            </div>
            <div className="flex space-x-1 sm:space-x-2">
              <button 
                onClick={onShowCreateModal}
                className="flex items-center gap-1 sm:gap-2 bg-gray-600 text-white px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm hover:bg-gray-700 transition-colors"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">جدولة حصة جديدة</span>
                <span className="sm:hidden">جدولة</span>
              </button>
              <button
                onClick={onExport}
                className="flex items-center gap-1 sm:gap-2 bg-green-600 hover:bg-green-700 text-white px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm transition-colors"
              >
                <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">تصدير البيانات</span>
                <span className="sm:hidden">تصدير</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionsHeader;
