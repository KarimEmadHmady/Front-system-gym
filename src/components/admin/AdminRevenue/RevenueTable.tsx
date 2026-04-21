'use client';

import React from 'react';
import type { Revenue } from '@/services/revenueService';
import type { User } from '@/types/models';

type Props = {
  displayedItems: Revenue[];
  userMap: Record<string, User>;
  count: number;
  skip: number;
  limit: number;
  loading: boolean;
  error: string | null;
  selectedId: string | null;
  hasDateFilter: boolean;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
  onPrev: () => void;
  onNext: () => void;
};

const RevenueTable = ({
  displayedItems, userMap, count, skip, limit, loading, error,
  selectedId, hasDateFilter, onView, onDelete, onPrev, onNext,
}: Props) => {
  const pageSize = limit || 10;
  const currentPage = Math.floor((skip || 0) / pageSize) + 1;
  const totalPages = Math.max(1, Math.ceil((count || 0) / pageSize));
  const totalForUi = hasDateFilter ? displayedItems.length : (count || 0);
  const start = totalForUi > 0 ? 1 : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-auto">
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="font-semibold text-gray-900 dark:text-white">الدخل ({displayedItems.length})</h3>
        {loading && <span className="text-sm text-gray-500">جارِ التحميل...</span>}
      </div>
      {error && <div className="alert alert-error mb-3"><span>{error}</span></div>}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-2 text-center">التاريخ</th>
              <th className="px-4 py-2 text-center">المبلغ</th>
              <th className="px-4 py-2 text-center">طريقة الدفع</th>
              <th className="px-4 py-2 text-center">نوع المصدر</th>
              <th className="px-4 py-2 text-center">العميل</th>
              <th className="px-4 py-2 text-center">ملاحظات</th>
              <th className="px-4 py-2 text-right">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {displayedItems.map(row => (
              <tr key={row._id} className={`border-t border-gray-200 dark:border-gray-700 ${selectedId === row._id ? 'bg-gray-50 dark:bg-gray-900/40' : ''}`}>
                <td className="px-4 py-2 text-sm text-center">{new Date(row.date).toLocaleDateString()}</td>
                <td className="px-4 py-2 text-center">ج.م{new Intl.NumberFormat().format(row.amount)}</td>
                <td className="px-4 py-2 text-center">{row.paymentMethod}</td>
                <td className="px-4 py-2 text-center">{row.sourceType}</td>
                <td className="px-4 py-2 text-center">
                  {row.userId && userMap[row.userId] ? (
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{userMap[row.userId].name}</div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs">{userMap[row.userId].phone || '-'}</div>
                    </div>
                  ) : <span className="text-gray-500">-</span>}
                </td>
                <td className="px-4 py-2 text-center">{row.notes || '-'}</td>
                <td className="px-4 py-2 text-right space-x-2">
                  <button className="px-3 py-1 rounded bg-gray-600 text-white text-sm disabled:opacity-60" onClick={() => onView(row._id)} disabled={loading}>عرض</button>
                  <button className="px-3 py-1 rounded bg-red-600 text-white text-sm disabled:opacity-60" onClick={() => onDelete(row._id)} disabled={loading}>حذف</button>
                </td>
              </tr>
            ))}
            {displayedItems.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-500">لا توجد بيانات</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-700 dark:text-gray-300">
        <div>
          عرض {start} إلى {totalForUi} من {new Intl.NumberFormat().format(totalForUi)} نتيجة
          {hasDateFilter ? ' (بعد الفلترة)' : ''} • صفحة {currentPage} من {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 rounded border dark:border-gray-700 disabled:opacity-50" disabled={skip === 0 || loading} onClick={onPrev}>السابق</button>
          <button className="px-3 py-1 rounded border dark:border-gray-700 disabled:opacity-50" disabled={(skip + pageSize >= count) || loading} onClick={onNext}>التالي</button>
        </div>
      </div>
    </div>
  );
};

export default RevenueTable;