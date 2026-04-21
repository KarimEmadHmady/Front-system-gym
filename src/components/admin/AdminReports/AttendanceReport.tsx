import React from 'react';

interface AttendanceReportProps {
  attendanceLoading: boolean;
  attendanceError: string | null;
  attendanceStats: {
    total: number;
    present: number;
    absent: number;
    excused: number;
    attendanceRate: string;
    topMembers: Array<{ userId: string; count: number }>;
    latest: any[];
  } | null;
  getUserInfo: (userId: string) => { name: string; phone: string };
}

const AttendanceReport: React.FC<AttendanceReportProps> = ({
  attendanceLoading,
  attendanceError,
  attendanceStats,
  getUserInfo
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">تقارير الحضور</h3>
      {attendanceLoading ? (
        <div className="text-center py-8 text-gray-600">جاري التحميل...</div>
      ) : attendanceError ? (
        <div className="text-center py-8 text-red-600">{attendanceError}</div>
      ) : !attendanceStats ? (
        <div className="text-center py-8 text-gray-500">لا توجد بيانات حضور متاحة</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg flex flex-col items-center">
              <span className="text-3xl mb-2">📅</span>
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">إجمالي السجلات</h4>
              <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{attendanceStats.total}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg flex flex-col items-center">
              <span className="text-3xl mb-2">✅</span>
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-1">الحضور</h4>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{attendanceStats.present}</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg flex flex-col items-center">
              <span className="text-3xl mb-2">🚫</span>
              <h4 className="font-medium text-red-800 dark:text-red-200 mb-1">الغياب</h4>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{attendanceStats.absent}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg flex flex-col items-center">
              <span className="text-3xl mb-2">📝</span>
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">إعفاءات</h4>
              <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{attendanceStats.excused}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg flex flex-col items-center">
              <span className="text-3xl mb-2">📈</span>
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">نسبة الالتزام</h4>
              <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{attendanceStats.attendanceRate}%</p>
            </div>
          </div>
          {/* Top members */}
          <div className="mt-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-center bg-gray-500 py-2">الأعضاء الأكثر التزامًا</h4>
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm">
                  <th className="py-2 px-4">الاسم</th>
                  <th className="py-2 px-4">رقم الهاتف</th>
                  <th className="py-2 px-4">عدد الحضور</th>
                </tr>
              </thead>
              <tbody>
                {attendanceStats.topMembers.map((m: any) => {
                  const info = getUserInfo(m.userId);
                  return (
                    <tr key={m.userId} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-center">
                      <td className="py-2 px-4 font-medium text-center">{info.name}</td>
                      <td className="py-2 px-4 text-center">{info.phone || '-'}</td>
                      <td className="py-2 px-4 text-center">{m.count}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <h4 className="font-medium text-gray-900 dark:text-white mt-4 mb-2 text-center bg-gray-500 py-2">أحدث سجلات الحضور</h4>
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm">
                  <th className="py-2 px-4">الاسم</th>
                  <th className="py-2 px-4">رقم الهاتف</th>
                  <th className="py-2 px-4">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {attendanceStats.latest.map((a: any) => {
                  const info = getUserInfo(a.userId);
                  return (
                    <tr key={a._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-center">
                      <td className="py-2 px-4 font-medium text-center">{info.name}</td>
                      <td className="py-2 px-4 text-center">{info.phone || '-'}</td>
                      <td className="py-2 px-4 text-center">{a.status === 'present' ? 'حضور' : a.status === 'absent' ? 'غياب' : 'إعفاء'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default AttendanceReport;
