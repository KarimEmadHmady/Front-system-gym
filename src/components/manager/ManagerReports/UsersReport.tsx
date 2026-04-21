'use client';

import React from 'react';

interface UserStats {
  total: number;
  active: number;
  inactive: number;
  newThisMonth: number;
  growth: string;
}

interface UsersReportProps {
  users: any[];
  usersLoading: boolean;
  usersError: string | null;
  usersLoaded: boolean;
  userStats: UserStats | null;
  getUserInfo: (userId: string) => { name: string; phone: string };
}

const UsersReport: React.FC<UsersReportProps> = ({
  users,
  usersLoading,
  usersError,
  usersLoaded,
  userStats,
  getUserInfo
}) => {
  if (usersLoading) {
    return (
      <div className="text-center py-8 text-gray-600">جاري التحميل...</div>
    );
  }

  if (usersError) {
    return (
      <div className="text-center py-8 text-red-600">{usersError}</div>
    );
  }

  if (!usersLoaded) {
    return (
      <div className="text-center py-8 text-gray-500">جاري تحميل بيانات المستخدمين...</div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">لا توجد بيانات مستخدمين متاحة</div>
    );
  }

  if (!userStats) {
    return (
      <div className="text-center py-8 text-gray-500">جاري حساب الإحصائيات...</div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">تقارير المستخدمين</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg flex flex-col items-center">
          <span className="text-3xl mb-2">👥</span>
          <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">إجمالي المستخدمين</h4>
          <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{userStats.total}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg flex flex-col items-center">
          <span className="text-3xl mb-2">✅</span>
          <h4 className="font-medium text-green-800 dark:text-green-200 mb-1">النشطين</h4>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{userStats.active}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg flex flex-col items-center">
          <span className="text-3xl mb-2">🚫</span>
          <h4 className="font-medium text-red-800 dark:text-red-200 mb-1">غير النشطين</h4>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{userStats.inactive}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg flex flex-col items-center">
          <span className="text-3xl mb-2">🆕</span>
          <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">جدد هذا الشهر</h4>
          <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{userStats.newThisMonth}</p>
        </div>
      </div>

      {/* جدول أحدث الأعضاء */}
      <div className="overflow-x-auto rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <table className="min-w-full bg-white dark:bg-gray-800">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm">
              <th className="py-2 px-4 text-center">الاسم</th>
              <th className="py-2 px-4 text-center">الإيميل</th>
              <th className="py-2 px-4 text-center">رقم الهاتف</th>
              <th className="py-2 px-4 text-center">الحالة</th>
              <th className="py-2 px-4 text-center">تاريخ التسجيل</th>
            </tr>
          </thead>
          <tbody>
            {users
              .slice()
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 8)
              .map((user) => (
                <tr key={user._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <td className="py-2 px-4 font-medium text-center">{user.name}</td>
                  <td className="py-2 px-4 text-center">{user.email}</td>
                  <td className="py-2 px-4 text-center">{user.phone || '-'}</td>
                  <td className="py-2 px-4 text-center">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                      user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {user.status === 'active' ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-center">
                    {new Date(user.createdAt).toLocaleDateString('ar-EG')}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersReport;
