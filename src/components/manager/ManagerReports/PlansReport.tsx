'use client';

import React from 'react';

interface PlansStats {
  totalWorkout: number;
  totalDiet: number;
  activeWorkout: number;
  activeDiet: number;
  endedWorkout: number;
  endedDiet: number;
  latestWorkout: any[];
  latestDiet: any[];
}

interface PlansReportProps {
  workoutPlans: any[];
  dietPlans: any[];
  plansLoading: boolean;
  plansError: string | null;
  plansStats: PlansStats | null;
  getUserInfo: (userId: string) => { name: string; phone: string };
}

const PlansReport: React.FC<PlansReportProps> = ({
  workoutPlans,
  dietPlans,
  plansLoading,
  plansError,
  plansStats,
  getUserInfo
}) => {
  if (plansLoading) {
    return (
      <div className="text-center py-8 text-gray-600">جاري التحميل...</div>
    );
  }

  if (plansError) {
    return (
      <div className="text-center py-8 text-red-600">{plansError}</div>
    );
  }

  if (!plansStats) {
    return (
      <div className="text-center py-8 text-gray-500">لا توجد بيانات خطط متاحة</div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">تقارير الخطط</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg flex flex-col items-center">
          <span className="text-3xl mb-2">🏋️</span>
          <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">إجمالي خطط التمرين</h4>
          <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{plansStats.totalWorkout}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg flex flex-col items-center">
          <span className="text-3xl mb-2">✅</span>
          <h4 className="font-medium text-green-800 dark:text-green-200 mb-1">الخطط النشطة (تمرين)</h4>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{plansStats.activeWorkout}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg flex flex-col items-center">
          <span className="text-3xl mb-2">⏰</span>
          <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">الخطط المنتهية (تمرين)</h4>
          <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{plansStats.endedWorkout}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg flex flex-col items-center">
          <span className="text-3xl mb-2">🥗</span>
          <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">إجمالي خطط التغذية</h4>
          <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{plansStats.totalDiet}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg flex flex-col items-center">
          <span className="text-3xl mb-2">✅</span>
          <h4 className="font-medium text-green-800 dark:text-green-200 mb-1">الخطط النشطة (غذائية)</h4>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{plansStats.activeDiet}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg flex flex-col items-center">
          <span className="text-3xl mb-2">⏰</span>
          <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">الخطط المنتهية (غذائية)</h4>
          <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{plansStats.endedDiet}</p>
        </div>
      </div>

      {/* أحدث الخطط */}
      <div className="mt-6 space-y-6">
        {/* أحدث خطط التمرين */}
        <div className="overflow-x-auto rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-gray-900 dark:text-white mb-4 p-4 bg-gray-50 dark:bg-gray-700">أحدث خطط التمرين</h4>
          <table className="min-w-full bg-white dark:bg-gray-800">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm">
                <th className="py-2 px-4 text-center">اسم الخطة</th>
                <th className="py-2 px-4 text-center">المستخدم</th>
                <th className="py-2 px-4 text-center">رقم الهاتف</th>
                <th className="py-2 px-4 text-center">تاريخ البداية</th>
                <th className="py-2 px-4 text-center">تاريخ النهاية</th>
              </tr>
            </thead>
            <tbody>
              {plansStats.latestWorkout.map((plan) => {
                const info = getUserInfo(plan.userId);
                return (
                  <tr key={plan._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <td className="py-2 px-4 font-medium text-center">{plan.planName}</td>
                    <td className="py-2 px-4 text-center">{info.name}</td>
                    <td className="py-2 px-4 text-center">{info.phone || '-'}</td>
                    <td className="py-2 px-4 text-center">
                      {plan.startDate ? new Date(plan.startDate).toLocaleDateString('ar-EG') : '-'}
                    </td>
                    <td className="py-2 px-4 text-center">
                      {plan.endDate ? new Date(plan.endDate).toLocaleDateString('ar-EG') : '-'}
                    </td>
                  </tr>
                );
              })}
              {plansStats.latestWorkout.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-500">لا توجد خطط تمرين</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* أحدث خطط التغذية */}
        <div className="overflow-x-auto rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-gray-900 dark:text-white mb-4 p-4 bg-gray-50 dark:bg-gray-700">أحدث خطط التغذية</h4>
          <table className="min-w-full bg-white dark:bg-gray-800">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm">
                <th className="py-2 px-4 text-center">اسم الخطة</th>
                <th className="py-2 px-4 text-center">المستخدم</th>
                <th className="py-2 px-4 text-center">رقم الهاتف</th>
                <th className="py-2 px-4 text-center">تاريخ البداية</th>
                <th className="py-2 px-4 text-center">تاريخ النهاية</th>
              </tr>
            </thead>
            <tbody>
              {plansStats.latestDiet.map((plan) => {
                const info = getUserInfo(plan.userId);
                return (
                  <tr key={plan._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <td className="py-2 px-4 font-medium text-center">{plan.planName}</td>
                    <td className="py-2 px-4 text-center">{info.name}</td>
                    <td className="py-2 px-4 text-center">{info.phone || '-'}</td>
                    <td className="py-2 px-4 text-center">
                      {plan.startDate ? new Date(plan.startDate).toLocaleDateString('ar-EG') : '-'}
                    </td>
                    <td className="py-2 px-4 text-center">
                      {plan.endDate ? new Date(plan.endDate).toLocaleDateString('ar-EG') : '-'}
                    </td>
                  </tr>
                );
              })}
              {plansStats.latestDiet.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-500">لا توجد خطط تغذية</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PlansReport;
