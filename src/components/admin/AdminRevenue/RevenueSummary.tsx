'use client';

import React from 'react';
import type { SummaryData } from './types';

type Props = {
  summary: SummaryData | null;
  count: number;
};

const RevenueSummary = ({ summary, count }: Props) => {
  return (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
          <div className="text-sm text-gray-500">إجمالي الدخل</div>
          <div className="text-2xl font-semibold">ج.م{new Intl.NumberFormat().format(summary?.totals.revenue || 0)}</div>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
          <div className="text-sm text-gray-500">النطاق الزمني</div>
          <div className="text-sm">{summary?.range.from || '-'} → {summary?.range.to || '-'}</div>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
          <div className="text-sm text-gray-500">عدد السجلات</div>
          <div className="text-2xl font-semibold">{new Intl.NumberFormat().format(count)}</div>
        </div>
      </div>

      {/* Monthly Chart */}
      {summary && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">الشارت الشهري للدخل</h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              النطاق: {summary.range.from || '-'} → {summary.range.to || '-'}
            </div>
          </div>
          {summary.monthly.length > 0 ? (
            <div className="w-full overflow-x-auto">
              {(() => {
                const maxVal = Math.max(...summary.monthly.map(m => m.revenue || 0), 0);
                return (
                  <div className="min-w-[560px]">
                    <div className="h-48 flex items-end gap-2 px-2">
                      {summary.monthly.map((m, idx) => {
                        const pct = maxVal > 0 ? Math.round((m.revenue / maxVal) * 100) : 0;
                        return (
                          <div key={`${m.year}-${m.month}-${idx}`} className="flex-1 flex flex-col items-center">
                            <div className="w-full h-40 bg-gray-100 dark:bg-gray-900/30 rounded-t">
                              <div
                                className="w-full bg-gray-600 dark:bg-gray-500 rounded-t"
                                style={{ height: `${pct}%` }}
                                title={`ج.م${new Intl.NumberFormat().format(m.revenue)}`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-2 flex gap-2 px-2">
                      {summary.monthly.map((m, idx) => (
                        <div key={`lbl-${m.year}-${m.month}-${idx}`} className="flex-1 text-center text-xs text-gray-600 dark:text-gray-300">
                          {m.year}/{String(m.month).padStart(2, '0')}
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 flex gap-2 px-2">
                      {summary.monthly.map((m, idx) => (
                        <div key={`val-${m.year}-${m.month}-${idx}`} className="flex-1 text-center text-[10px] text-gray-500 dark:text-gray-400">
                          ج.م{new Intl.NumberFormat().format(m.revenue)}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="text-sm text-gray-500 dark:text-gray-400">لا توجد بيانات شهرية</div>
          )}
        </div>
      )}
    </>
  );
};

export default RevenueSummary;