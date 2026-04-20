'use client';

import React from 'react';
import type { Expense } from '@/types';

interface ExpenseTableProps {
  displayedItems: Expense[];
  loading: boolean;
  error: string | null;
  selectedId: string | null;
  limit: number;
  skip: number;
  count: number;
  effectiveFrom: string;
  effectiveTo: string;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

const ExpenseTable: React.FC<ExpenseTableProps> = ({
  displayedItems,
  loading,
  error,
  selectedId,
  limit,
  skip,
  count,
  effectiveFrom,
  effectiveTo,
  onSelect,
  onEdit,
  onDelete,
  onPreviousPage,
  onNextPage,
}) => {
  const pageSize = limit || 10;
  const currentPage = Math.floor((skip || 0) / pageSize) + 1;
  const totalPages = Math.max(1, Math.ceil((count || 0) / pageSize));
  const hasClientDateFilter = Boolean(effectiveFrom || effectiveTo);
  const totalForUi = hasClientDateFilter ? displayedItems.length : (count || 0);
  const start = totalForUi > 0 ? 1 : 0;
  const end = totalForUi;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-auto">
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="font-semibold text-gray-900 dark:text-white">المصروفات ({displayedItems.length})</h3>
        {loading && <span className="text-sm text-gray-500">Loading...</span>}
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
              <th className="px-4 py-2 text-center">الفئة</th>
              <th className="px-4 py-2 text-center">المبلغ</th>
              <th className="px-4 py-2 text-center">مدفوع ل</th>
              <th className="px-4 py-2 text-center">الملاحظات</th>
              <th className="px-4 py-2 text-center">الصورة</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedItems.map((row) => (
              <tr key={row._id} className={`border-t border-gray-200 dark:border-gray-700 ${selectedId === row._id ? 'bg-gray-50 dark:bg-gray-900/40' : ''}`}>
                <td className="px-4 py-2 text-sm text-center">{new Date(row.date).toLocaleDateString()}</td>
                <td className="px-4 py-2 text-center">{row.category}</td>
                <td className="px-4 py-2 text-center">EGP{new Intl.NumberFormat().format(row.amount)}</td>
                <td className="px-4 py-2 text-center">{row.paidTo || '-'}</td>
                <td className="px-4 py-2 text-center">{row.notes || '-'}</td>
                <td className="px-4 py-2 text-center">
                  {(row as any).imageUrl ? <img src={(row as any).imageUrl} alt="Expense" style={{width:40, height:40, objectFit:'cover', borderRadius:4, border:'1px solid #ccc'}} /> : '-'}
                </td>
                <td className="px-4 py-2 text-right space-x-2">
                  <button className="px-3 py-1 rounded bg-gray-600 text-white text-sm disabled:opacity-60" onClick={() => onSelect(row._id)} disabled={loading}>عرض</button>
                  <button className="px-3 py-1 rounded bg-green-600 text-white text-sm disabled:opacity-60" onClick={() => onEdit(row._id)} disabled={loading}>تعديل</button>
                  <button className="px-3 py-1 rounded bg-red-600 text-white text-sm disabled:opacity-60" onClick={() => onDelete(row._id)} disabled={loading}>حذف</button>
                </td>
              </tr>
            ))}
            {displayedItems.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-500">لا توجد بيانات</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-700 dark:text-gray-300">
        عرض {start} إلى {end} من {new Intl.NumberFormat().format(totalForUi)} نتيجة {hasClientDateFilter ? '(بعد الفلترة)' : ''} • صفحة {currentPage} من {totalPages}
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 rounded border dark:border-gray-700 disabled:opacity-50" disabled={(skip === 0) || loading} onClick={onPreviousPage}>السابق</button>
          <button className="px-3 py-1 rounded border dark:border-gray-700 disabled:opacity-50" disabled={((skip + pageSize) >= count) || loading} onClick={onNextPage}>التالي</button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseTable;
