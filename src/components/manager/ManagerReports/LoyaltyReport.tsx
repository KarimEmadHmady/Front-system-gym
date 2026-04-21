'use client';

import React from 'react';
import { useLoyaltyStats } from '@/hooks/useLoyaltyStats';

interface LoyaltyReportProps {
  activeReport: string;
}

const LoyaltyReport: React.FC<LoyaltyReportProps> = ({ activeReport }) => {
  const { loyaltyStats, loading: loyaltyLoading } = useLoyaltyStats();

  if (activeReport !== 'loyalty') return null;

  if (loyaltyLoading) {
    return (
      <div className="text-center py-8 text-gray-600">جاري التحميل...</div>
    );
  }

  if (!loyaltyStats) {
    return (
      <div className="text-center py-8 text-gray-500">لا توجد بيانات ولاء متاحة</div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">تقارير نقاط الولاء</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg">
          <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">إجمالي النقاط الممنوحة</h4>
          <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{loyaltyStats.stats.totalPoints}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">النقاط المستخدمة</h4>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{loyaltyStats.stats.totalUsers}</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">متوسط النقاط</h4>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{loyaltyStats.stats.avgPoints}</p>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
          <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-2">أقصى نقاط</h4>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{loyaltyStats.stats.maxPoints}</p>
        </div>
      </div>

      {/* أفضل الأعضاء حسب نقاط الولاء */}
      {loyaltyStats.topUsers && loyaltyStats.topUsers.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium text-gray-900 dark:text-white mb-4">أفضل الأعضاء حسب نقاط الولاء</h4>
          <div className="overflow-x-auto rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <table className="min-w-full bg-white dark:bg-gray-800">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm">
                  <th className="py-2 px-4 text-center">الاسم</th>
                  <th className="py-2 px-4 text-center">رقم الهاتف</th>
                  <th className="py-2 px-4 text-center">نقاط الولاء</th>
                  <th className="py-2 px-4 text-center">مستوى العضوية</th>
                </tr>
              </thead>
              <tbody>
                {loyaltyStats.topUsers.map((user, index) => (
                  <tr key={user._id || index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <td className="py-2 px-4 font-medium text-center">{user.name}</td>
                    <td className="py-2 px-4 text-center">{user.email}</td>
                    <td className="py-2 px-4 text-center font-bold text-green-600 dark:text-green-400">{user.loyaltyPoints}</td>
                    <td className="py-2 px-4 text-center">{user.avatarUrl ? '🖼️' : '👤'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoyaltyReport;
