'use client';

import React from 'react';

interface ExpenseSummaryProps {
  summary: {
    range: { from: string | null; to: string | null };
    totals: { expense: number };
    monthly: Array<{ year: number; month: number; expense: number }>;
  } | null;
  count: number;
}

const ExpenseSummary: React.FC<ExpenseSummaryProps> = ({ summary, count }) => {
  return (
    <>
      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
          <div className="text-sm text-gray-500">إجمالي المصروفات</div>
          <div className="text-2xl font-semibold">EGP{new Intl.NumberFormat().format(summary?.totals.expense || 0)}</div>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
          <div className="text-sm text-gray-500">نطاق التاريخ</div>
          <div className="text-sm">{summary?.range.from || '-'} {summary?.range.to || '-'}</div>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
          <div className="text-sm text-gray-500">عدد السجلات</div>
          <div className="text-2xl font-semibold">{new Intl.NumberFormat().format(count)}</div>
        </div>
      </div>

      {/* Detailed Summary */}
      {summary && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">ملخص المصروفات</h3>
          <div className="mb-2 text-sm text-gray-600 dark:text-gray-300">
            النطاق: {summary.range.from || '-'} → {summary.range.to || '-'}
          </div>
          <div className="font-medium">الإجمالي: EGP{new Intl.NumberFormat().format(summary.totals.expense)}</div>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr>
                  <th className="px-3 py-2">السنة</th>
                  <th className="px-3 py-2">الشهر</th>
                  <th className="px-3 py-2">المصروف</th>
                </tr>
              </thead>
              <tbody>
                {summary.monthly.map((m, i) => (
                  <tr key={`${m.year}-${m.month}-${i}`} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="px-3 py-2">{m.year}</td>
                    <td className="px-3 py-2">{m.month}</td>
                    <td className="px-3 py-2">EGP{new Intl.NumberFormat().format(m.expense)}</td>
                  </tr>
                ))}
                {summary.monthly.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-sm text-gray-500">لا توجد بيانات شهرية</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};

export default ExpenseSummary;
