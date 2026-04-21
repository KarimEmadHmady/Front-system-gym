import React from 'react';

interface SessionsReportProps {
  sessionsLoading: boolean;
  sessionsError: string | null;
  sessionStats: {
    total: number;
    completed: number;
    upcoming: number;
    cancelled: number;
    revenue: number;
  } | null;
}

const SessionsReport: React.FC<SessionsReportProps> = ({
  sessionsLoading,
  sessionsError,
  sessionStats
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">تقارير الحصص</h3>
      {sessionsLoading ? (
        <div className="text-center py-8 text-gray-600">جاري التحميل...</div>
      ) : sessionsError ? (
        <div className="text-center py-8 text-red-600">{sessionsError}</div>
      ) : !sessionStats ? (
        <div className="text-center py-8 text-gray-500">لا توجد بيانات حصص متاحة</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">إجمالي الحصص</h4>
            <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{sessionStats.total}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">المكتملة</h4>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{sessionStats.completed}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">القادمة</h4>
            <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{sessionStats.upcoming}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">إيرادات الحصص</h4>
            <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              ج.م{sessionStats.revenue.toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionsReport;
