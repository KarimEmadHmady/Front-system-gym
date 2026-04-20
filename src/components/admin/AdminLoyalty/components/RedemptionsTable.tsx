import React from 'react';

interface Props {
  redemptions: any[];
  loading: boolean;
  error: string | null;
  filters: {
    userId: string;
    rewardId: string;
    startDate: string;
    endDate: string;
  };
  setFilters: (filters: any) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  totalCount: number;
  users: any[];
  rewards: any[];
}

const RedemptionsTable: React.FC<Props> = ({
  redemptions, loading, error, filters, setFilters,
  currentPage, setCurrentPage, pageSize, totalCount, users, rewards
}) => {
  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalCount);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev: any) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">سجل الاستبدالات</h3>
      
      <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <select
          value={filters.userId}
          onChange={(e) => handleFilterChange('userId', e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
        >
          <option value="">كل المستخدمين</option>
          {users.map((user) => (
            <option key={user._id} value={user._id}>
              {user.name}
            </option>
          ))}
        </select>
        
        <select
          value={filters.rewardId}
          onChange={(e) => handleFilterChange('rewardId', e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
        >
          <option value="">كل المكافآت</option>
          {rewards.map((reward) => (
            <option key={reward._id} value={reward._id}>
              {reward.name}
            </option>
          ))}
        </select>
        
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => handleFilterChange('startDate', e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
          placeholder="تاريخ البدء"
        />
        
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => handleFilterChange('endDate', e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
          placeholder="تاريخ النهاية"
        />
      </div>

      {loading && <div className="text-center py-4 text-gray-500">جاري التحميل...</div>}
      {error && <div className="text-center py-4 text-red-500">{error}</div>}

      {!loading && !error && (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-2 text-right">اسم المستخدم</th>
                  <th className="px-4 py-2 text-right">اسم المكافأة</th>
                  <th className="px-4 py-2 text-right">النقاط المستخدمة</th>
                  <th className="px-4 py-2 text-right">الحالة</th>
                  <th className="px-4 py-2 text-right">ملاحظات</th>
                  <th className="px-4 py-2 text-right">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {redemptions.map((redemption, index) => (
                  <tr key={index} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="px-4 py-2">{redemption.userName}</td>
                    <td className="px-4 py-2">{redemption.rewardName}</td>
                    <td className="px-4 py-2">{redemption.pointsUsed}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-sm ${
                        redemption.status === 'completed' ? 'bg-green-100 text-green-800' : 
                        redemption.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {redemption.status === 'completed' ? 'مكتملة' : 
                         redemption.status === 'pending' ? 'في الانتظار' : 'فشلت'}
                      </span>
                    </td>
                    <td className="px-4 py-2">{redemption.notes || '-'}</td>
                    <td className="px-4 py-2">{new Date(redemption.createdAt).toLocaleDateString('ar-EG')}</td>
                  </tr>
                ))}
                {redemptions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-500">لا توجد استبدالات</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                عرض {startIndex} إلى {endIndex} من {totalCount} مدخلات (صفحة {currentPage} من {totalPages})
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50"
                >
                  السابق
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50"
                >
                  التالي
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RedemptionsTable;
