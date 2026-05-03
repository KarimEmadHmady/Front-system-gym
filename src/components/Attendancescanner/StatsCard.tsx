'use client';

import React from 'react';
import { Calendar } from 'lucide-react';

interface TodaySummary {
  summary: {
    date: string;
    totalActiveMembers: number;
    totalPresent: number;
    totalAbsent: number;
    totalExcused: number;
    attendanceRate: number;
  };
  records: Array<{
    _id: string;
    userId: { name: string; barcode: string; role: string };
    status: string;
    date: string;
    createdAt: string;
  }>;
}

interface StatsCardProps {
  todaySummary: TodaySummary | null;
}

const StatsCard: React.FC<StatsCardProps> = ({ todaySummary }) => {
  // ✅ FIX: فحص واحد بس في الأول
  if (!todaySummary) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
        <Calendar className="h-4 w-4 text-gray-500" />
        <h2 className="font-semibold text-sm text-gray-900 dark:text-white">ملخص اليوم</h2>
      </div>
      <div className="p-5">
        {/* ✅ FIX: مفيش ternary تاني هنا، بما إننا اتأكدنا فوق إن todaySummary موجود */}
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-4xl font-black text-gray-800 dark:text-white">
              {Math.round(todaySummary.summary.attendanceRate)}%
            </div>
            <div className="text-xs text-gray-400 mt-0.5">معدل الحضور</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {todaySummary.summary.totalPresent}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">حاضر</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-gray-700 dark:text-gray-300">
                {todaySummary.summary.totalActiveMembers}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">الإجمالي</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
