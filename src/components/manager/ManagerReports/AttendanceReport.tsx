'use client';

import React from 'react';

interface AttendanceStats {
  total: number;
  present: number;
  absent: number;
  excused: number;
  attendanceRate: string;
  topMembers: Array<{ userId: string; count: number }>;
  latest: any[];
}

interface AttendanceReportProps {
  attendanceRecords: any[];
  attendanceLoading: boolean;
  attendanceError: string | null;
  attendanceStats: AttendanceStats | null;
  getUserInfo: (userId: string) => { name: string; phone: string };
}

const AttendanceReport: React.FC<AttendanceReportProps> = ({
  attendanceRecords,
  attendanceLoading,
  attendanceError,
  attendanceStats,
  getUserInfo
}) => {
  if (attendanceLoading) {
    return (
      <div className="text-center py-8 text-gray-600">جاري التحميل...</div>
    );
  }

  if (attendanceError) {
    return (
      <div className="text-center py-8 text-red-600">{attendanceError}</div>
    );
  }

  if (!attendanceStats) {
    return (
      <div className="text-center py-8 text-gray-500">لا توجد بيانات حضور متاحة</div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">تقارير الحضور</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg">
          <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">إجمالي الحضور</h4>
          <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{attendanceStats.total}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">الحاضرين</h4>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{attendanceStats.present}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">الغائبين</h4>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{attendanceStats.absent}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg">
          <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">المعذورين</h4>
          <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{attendanceStats.excused}</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">نسبة الحضور</h4>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{attendanceStats.attendanceRate}%</p>
        </div>
      </div>

      {/* جدول الحضور */}
      <div className="overflow-x-auto rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <table className="min-w-full bg-white dark:bg-gray-800">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm">
              <th className="py-2 px-4 text-center">الاسم</th>
              <th className="py-2 px-4 text-center">رقم الهاتف</th>
              <th className="py-2 px-4 text-center">التاريخ</th>
              <th className="py-2 px-4 text-center">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {attendanceStats.latest.map((record) => {
              const info = getUserInfo(record.userId);
              return (
                <tr key={record._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <td className="py-2 px-4 font-medium text-center">{info.name}</td>
                  <td className="py-2 px-4 text-center">{info.phone}</td>
                  <td className="py-2 px-4 text-center">
                    {new Date(record.date).toLocaleDateString('ar-EG')}
                  </td>
                  <td className="py-2 px-4 text-center">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                      record.status === 'present' 
                        ? 'bg-green-100 text-green-700' 
                        : record.status === 'absent' 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {record.status === 'present' ? 'حضور' : 
                       record.status === 'absent' ? 'غياب' : 'إعفاء'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* أفضل الأعضاء حسب الحضور */}
      {attendanceStats.topMembers.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium text-gray-900 dark:text-white mb-4">أفضل الأعضاء حسب الحضور</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {attendanceStats.topMembers.map((member, index) => {
              const info = getUserInfo(member.userId);
              return (
                <div key={member.userId} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{info.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{info.phone}</p>
                    </div>
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      {member.count}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceReport;
