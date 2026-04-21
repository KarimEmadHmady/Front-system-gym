import React from 'react';
import type { User } from '@/types/models';

type SortOrder = 'asc' | 'desc';

interface PayrollFiltersProps {
  employeeId: string;
  roleFilter: string;
  from: string;
  to: string;
  sort: SortOrder;
  loading: boolean;
  payrollUsers: User[];
  onEmployeeIdChange: (value: string) => void;
  onRoleFilterChange: (value: string) => void;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onSortChange: (value: SortOrder) => void;
  onLoadList: () => void;
  onResetFilters: () => void;
  onLoadSummary: () => void;
  onExportPayrollToExcel: () => void;
  displayedRowsLength: number;
}

const PayrollFilters: React.FC<PayrollFiltersProps> = ({
  employeeId,
  roleFilter,
  from,
  to,
  sort,
  loading,
  payrollUsers,
  onEmployeeIdChange,
  onRoleFilterChange,
  onFromChange,
  onToChange,
  onSortChange,
  onLoadList,
  onResetFilters,
  onLoadSummary,
  onExportPayrollToExcel,
  displayedRowsLength
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
        <div className="flex flex-col">
          <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">الموظف</label>
          <select 
            className="px-1.5 py-0.5 rounded border dark:bg-gray-900 text-xs h-8" 
            value={employeeId} 
            onChange={(e) => onEmployeeIdChange(e.target.value)}
          >
            <option value="">الكل</option>
            {payrollUsers.map(u => (
              <option key={u._id} value={u._id}>{u.name}{u.phone ? ` - ${u.phone}` : ''}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">الدور</label>
          <select 
            className="px-1.5 py-0.5 rounded border dark:bg-gray-900 text-xs h-8" 
            value={roleFilter} 
            onChange={(e) => onRoleFilterChange(e.target.value)}
          >
            <option value="">الكل</option>
            <option value="trainer">مدرب</option>
            <option value="manager">مدير</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">من تاريخ</label>
          <input
            type="date"
            className="px-1.5 py-0.5 rounded border dark:bg-gray-900 text-xs h-8 cursor-pointer"
            value={from}
            onChange={(e) => {
              const v = e.target.value;
              onFromChange(v);
            }}
            onClick={(e) => (e.currentTarget as HTMLInputElement).showPicker?.()}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">إلى تاريخ</label>
          <input
            type="date"
            className="px-1.5 py-0.5 rounded border dark:bg-gray-900 text-xs h-8 cursor-pointer"
            value={to}
            onChange={(e) => {
              const v = e.target.value;
              onToChange(v);
            }}
            onClick={(e) => (e.currentTarget as HTMLInputElement).showPicker?.()}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">الترتيب</label>
          <select 
            className="px-1.5 py-0.5 rounded border dark:bg-gray-900 text-xs h-8" 
            value={sort} 
            onChange={(e) => onSortChange(e.target.value as SortOrder)}
          >
            <option value="desc">الأحدث</option>
            <option value="asc">الأقدم</option>
          </select>
        </div>
        <div className="flex items-end space-x-2">
          <button 
            className="w-full px-1.5 py-0.5 rounded bg-gray-600 text-white text-xs h-8" 
            onClick={onLoadList} 
            disabled={loading}
          >
            {loading ? 'جارِ التحميل...' : 'تحديث'}
          </button>
        </div>
        <div className="flex items-end">
          <button
            className="w-full px-1.5 py-0.5 rounded border text-xs h-8"
            onClick={onResetFilters}
            disabled={loading}
          >
            إلغاء الفلاتر
          </button>
        </div>
        <div className="flex items-end">
          <button 
            className="w-full px-1.5 py-0.5 rounded border text-xs h-8" 
            onClick={onLoadSummary} 
            disabled={loading}
          >
            ملخص
          </button>
        </div>
        <div className="flex items-end">
          <button
            onClick={onExportPayrollToExcel}
            disabled={displayedRowsLength === 0}
            className="px-1.5 py-0.5 rounded bg-green-600 text-white text-xs h-8 disabled:opacity-50"
          >
            تصدير البيانات
          </button>          
        </div>
      </div>
    </div>
  );
};

export default PayrollFilters;
