import React from 'react';
import type { Payroll } from '@/services/payrollService';
import type { User } from '@/types/models';

interface PayrollTableProps {
  displayedRows: Payroll[];
  selectedId: string | null;
  loading: boolean;
  error: string | null;
  userMap: Record<string, User>;
  onSelect: (id: string) => void;
  onRequestDelete: (id: string) => void;
}

const PayrollTable: React.FC<PayrollTableProps> = ({
  displayedRows,
  selectedId,
  loading,
  error,
  userMap,
  onSelect,
  onRequestDelete
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-auto">
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="font-semibold text-gray-900 dark:text-white">الرواتب ({displayedRows.length})</h3>
        {loading && <span className="text-sm text-gray-500">جارِ التحميل...</span>}
      </div>
      {error && (
        <div className="alert alert-error mb-3">
          <span>{error}</span>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-2 text-center">التاريخ</th>
              <th className="px-4 py-2 text-center">الموظف</th>
              <th className="px-4 py-2 text-center">الراتب</th>
              <th className="px-4 py-2 text-center">المكافآت</th>
              <th className="px-4 py-2 text-center">الخصومات</th>
              <th className="px-4 py-2 text-center">ملاحظات</th>
              <th className="px-4 py-2 text-right">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {displayedRows.map((r) => (
              <tr 
                key={r._id} 
                className={`border-t border-gray-200 dark:border-gray-700 ${
                  selectedId === r._id ? 'bg-gray-50 dark:bg-gray-900/40' : ''
                }`}
              >
                <td className="px-4 py-2 text-sm text-center">
                  {new Date(r.paymentDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 text-center">
                  {r.employeeId && userMap[r.employeeId] ? (
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {userMap[r.employeeId].name}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs">
                        {userMap[r.employeeId].phone || '-'}
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </td>
                <td className="px-4 py-2 text-center">
                  ج.م{new Intl.NumberFormat().format(r.salaryAmount)}
                </td>
                <td className="px-4 py-2 text-center">
                  {typeof r.bonuses === 'number' ? r.bonuses : '-'}
                </td>
                <td className="px-4 py-2 text-center">
                  {typeof r.deductions === 'number' ? r.deductions : '-'}
                </td>
                <td className="px-4 py-2 text-center">{r.notes || '-'}</td>
                <td className="px-4 py-2 text-right space-x-2">
                  <button 
                    className="px-3 py-1 rounded bg-gray-600 text-white text-sm disabled:opacity-60" 
                    onClick={() => onSelect(r._id)} 
                    disabled={loading}
                  >
                    عرض
                  </button>
                  <button 
                    className="px-3 py-1 rounded bg-red-600 text-white text-sm disabled:opacity-60" 
                    onClick={() => onRequestDelete(r._id)} 
                    disabled={loading}
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
            {displayedRows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                  لا توجد بيانات
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PayrollTable;
