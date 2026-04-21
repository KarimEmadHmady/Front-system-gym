import React from 'react';

interface LoyaltyReportProps {
  loyaltyLoading: boolean;
  loyaltyStats: {
    stats: {
      totalPoints: number;
      totalUsers: number;
      avgPoints: number;
      maxPoints: number;
    };
    topUsers: Array<{
      _id: string;
      name: string;
      email: string;
      loyaltyPoints: number;
      avatarUrl?: string;
    }>;
  } | null;
}

const LoyaltyReport: React.FC<LoyaltyReportProps> = ({
  loyaltyLoading,
  loyaltyStats
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">تقارير نقاط الولاء</h3>
      {loyaltyLoading ? (
        <div className="text-center py-8 text-gray-600">جاري التحميل...</div>
      ) : !loyaltyStats ? (
        <div className="text-center py-8 text-gray-500">لا توجد بيانات ولاء متاحة</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">إجمالي النقاط</h4>
              <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{loyaltyStats.stats.totalPoints}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">عدد المستخدمين</h4>
              <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{loyaltyStats.stats.totalUsers}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">متوسط النقاط</h4>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{loyaltyStats.stats.avgPoints}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">أعلى نقاط</h4>
              <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{loyaltyStats.stats.maxPoints}</p>
            </div>
          </div>
          {/* Top users */}
          <div className="mt-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-4">أعلى المستخدمين بالنقاط</h4>
            <div className="overflow-x-auto rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <table className="min-w-full bg-white dark:bg-gray-800">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm">
                    <th className="py-2 px-4 text-center">الترتيب</th>
                    <th className="py-2 px-4 text-center">اسم المستخدم</th>
                    <th className="py-2 px-4 text-center">رقم الهاتف</th>
                    <th className="py-2 px-4 text-center">نقاط الولاء</th>
                    <th className="py-2 px-4 text-center">مستوى العضوية</th>
                  </tr>
                </thead>
                <tbody>
                  {loyaltyStats.topUsers?.slice(0, 5).map((u: any, index: number) => (
                    <tr key={u._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                      <td className="py-2 px-4 text-center">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                          index === 0 ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' :
                          index === 1 ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' :
                          index === 2 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-2 px-4 font-medium text-center">{u.name}</td>
                      <td className="py-2 px-4 text-center">{u.email || '-'}</td>
                      <td className="py-2 px-4 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                          {u.loyaltyPoints} نقطة
                        </span>
                      </td>
                      <td className="py-2 px-4 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                          مستخدم
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!loyaltyStats.topUsers || loyaltyStats.topUsers.length === 0) && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-gray-500">لا توجد بيانات مستخدمين</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LoyaltyReport;
