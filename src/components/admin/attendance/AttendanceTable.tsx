import React from 'react';
import type { AttendanceRecord, User } from '@/types/models';

interface AttendanceTableProps {
  records: AttendanceRecord[];
  userMap: Record<string, User>;
  loading: boolean;
  error: string | null;
  onEdit: (record: AttendanceRecord) => void;
  onDelete: (id: string) => void;
  deletingId: string | null;
  startIndex: number;
  endIndex: number;
  totalRecords: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({
  records,
  userMap,
  loading,
  error,
  onEdit,
  onDelete,
  deletingId,
  startIndex,
  endIndex,
  totalRecords,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (loading) {
    return <div className="text-gray-500 dark:text-gray-400">جاري التحميل...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead>
          <tr>
            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
              اسم العضو
            </th>
            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
              الهاتف
            </th>
            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
              التاريخ
            </th>
            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
              الوقت
            </th>
            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
              الحالة
            </th>
            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
              ملاحظات
            </th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {records.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-4 text-gray-400">
                لم يتم العثور على سجلات الحضور.
              </td>
            </tr>
          ) : (
            records.map((rec) => {
              const user = userMap[rec.userId];
              const dateObj = new Date(rec.date);
              return (
                <tr key={rec._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-2 whitespace-nowrap text-center">
                    {user?.name || '---'}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-center">
                    {user?.phone || '-'}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-center">
                    {dateObj.toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-center">
                    {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-center">
                    {rec.status === 'present' ? 'حاضر' : 
                     rec.status === 'absent' ? 'غائب' : 'معتذر'}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-center">
                    {rec.notes || '-'}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap flex gap-2">
                    <button
                      className="px-2 py-1 rounded bg-gray-200 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900 text-xs transition-colors"
                      onClick={() => onEdit(rec)}
                    >
                      تعديل
                    </button>
                    <button
                      className="px-2 py-1 rounded bg-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 text-xs transition-colors disabled:opacity-50"
                      onClick={() => onDelete(rec._id)}
                      disabled={deletingId === rec._id}
                    >
                      {deletingId === rec._id ? 'جاري الحذف...' : 'حذف'}
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      {records.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 text-sm text-gray-700 dark:text-gray-300">
          <div>
            عرض {Math.min(startIndex + 1, totalRecords)} إلى {endIndex} من أصل {totalRecords} نتيجة
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 rounded border border-gray-300 dark:border-gray-700 disabled:opacity-50"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              السابق
            </button>
            <span>
              الصفحة {currentPage} من {totalPages}
            </span>
            <button
              className="px-3 py-1 rounded border border-gray-300 dark:border-gray-700 disabled:opacity-50"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              التالي
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
