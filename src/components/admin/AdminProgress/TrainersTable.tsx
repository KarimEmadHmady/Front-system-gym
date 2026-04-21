'use client';

import React from 'react';
import type { TrainerRow } from './types';
import type { User } from '@/types/models';

type Props = {
  loading: boolean;
  filtered: TrainerRow[];
  query: string;
  setQuery: (q: string) => void;
  onOpenTrainer: (t: User) => void;
  onExportTrainer: (trainerId: string) => void;
  onAddProgress: () => void;
};

const TrainersTable = ({
  loading,
  filtered,
  query,
  setQuery,
  onOpenTrainer,
  onExportTrainer,
  onAddProgress,
}: Props) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">إدارة تقدم العملاء</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={onAddProgress}
            className="px-3 py-2 text-sm rounded-md bg-green-600 hover:bg-green-700 text-white"
          >
            إضافة تقدم
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="ابحث عن مدرب أو بريد إلكتروني"
          className="flex-1 px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white"
        />
      </div>

      {loading ? (
        <div className="text-sm text-gray-500 dark:text-gray-400">جاري التحميل...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300">المدرب</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300">العملاء</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300">سجلات التقدم</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300">آخر تحديث</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filtered.map(row => (
                <tr key={row.trainer._id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="px-3 py-2 text-center">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{row.trainer.name}</div>
                    <div className="text-xs text-gray-500">{row.trainer.email}</div>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 text-center">{row.clientsCount}</td>
                  <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 text-center">{row.progressCount}</td>
                  <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 text-center">
                    {row.latestProgressDate ? new Date(row.latestProgressDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onExportTrainer(row.trainer._id)}
                        className="px-3 py-1.5 text-sm rounded-md bg-green-600 hover:bg-green-700 text-white"
                        title="تصدير بيانات المدرب"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7,10 12,15 17,10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onOpenTrainer(row.trainer)}
                        className="px-3 py-1.5 text-sm rounded-md bg-gray-600 hover:bg-gray-700 text-white"
                      >
                        عرض التفاصيل
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TrainersTable;