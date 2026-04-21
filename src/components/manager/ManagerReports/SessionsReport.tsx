'use client';

import React from 'react';

interface SessionStats {
  total: number;
  completed: number;
  upcoming: number;
  cancelled: number;
  revenue: number;
}

interface SessionsReportProps {
  sessions: any[];
  sessionsLoading: boolean;
  sessionsError: string | null;
  sessionStats: SessionStats | null;
  getUserInfo: (userId: string) => { name: string; phone: string };
}

const SessionsReport: React.FC<SessionsReportProps> = ({
  sessions,
  sessionsLoading,
  sessionsError,
  sessionStats,
  getUserInfo
}) => {
  if (sessionsLoading) {
    return (
      <div className="text-center py-8 text-gray-600">جاري التحميل...</div>
    );
  }

  if (sessionsError) {
    return (
      <div className="text-center py-8 text-red-600">{sessionsError}</div>
    );
  }

  if (!sessionStats) {
    return (
      <div className="text-center py-8 text-gray-500">لا توجد بيانات حصص متاحة</div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">تقارير الحصص</h3>
      
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
          <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">ج.م{sessionStats.revenue}</p>
        </div>
      </div>

      {/* جدول الحصص */}
      <div className="overflow-x-auto rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <table className="min-w-full bg-white dark:bg-gray-800">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm">
              <th className="py-2 px-4 text-center">نوع الحصة</th>
              <th className="py-2 px-4 text-center">المستخدم</th>
              <th className="py-2 px-4 text-center">المدرب</th>
              <th className="py-2 px-4 text-center">التاريخ</th>
              <th className="py-2 px-4 text-center">وقت البداية</th>
              <th className="py-2 px-4 text-center">وقت النهاية</th>
              <th className="py-2 px-4 text-center">المدة (دقيقة)</th>
              <th className="py-2 px-4 text-center">السعر (ج.م)</th>
              <th className="py-2 px-4 text-center">الموقع</th>
              <th className="py-2 px-4 text-center">الحالة</th>
              <th className="py-2 px-4 text-center">الوصف</th>
            </tr>
          </thead>
          <tbody>
            {sessions
              .slice(0, 10)
              .map((session) => {
                const userInfo = getUserInfo(session.userId);
                const trainerInfo = getUserInfo(session.trainerId);
                return (
                  <tr key={session._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <td className="py-2 px-4 text-center">{session.sessionType || ''}</td>
                    <td className="py-2 px-4 text-center">{userInfo.name}</td>
                    <td className="py-2 px-4 text-center">{trainerInfo.name}</td>
                    <td className="py-2 px-4 text-center">
                      {session.date ? new Date(session.date).toLocaleDateString('ar-EG') : ''}
                    </td>
                    <td className="py-2 px-4 text-center">{session.startTime || ''}</td>
                    <td className="py-2 px-4 text-center">{session.endTime || ''}</td>
                    <td className="py-2 px-4 text-center">{session.duration || 0}</td>
                    <td className="py-2 px-4 text-center">{session.price || 0}</td>
                    <td className="py-2 px-4 text-center">{session.location || ''}</td>
                    <td className="py-2 px-4 text-center">{session.status || ''}</td>
                    <td className="py-2 px-4 text-center">{session.description || ''}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SessionsReport;
