import React from 'react';

interface Props {
  history: any[];
  loading: boolean;
  error: string | null;
  filterUserId: string;
  setFilterUserId: (value: string) => void;
  filterType: string;
  setFilterType: (value: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  totalCount: number;
  users: any[];
}

const PointsHistory: React.FC<Props> = ({
  history, loading, error, filterUserId, setFilterUserId,
  filterType, setFilterType, currentPage, setCurrentPage,
  pageSize, totalCount, users
}) => {
  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">سجل النقاط</h3>
      
      <div className="mb-4 flex flex-col md:flex-row gap-4">
        <select
          value={filterUserId}
          onChange={(e) => setFilterUserId(e.target.value)}
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
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
        >
          <option value="">كل الأنواع</option>
          <option value="earned">مكتسبة</option>
          <option value="redeemed">مستبدلة</option>
          <option value="expired">منتهية الصلاحية</option>
        </select>
      </div>

      {loading && <div className="text-center py-4 text-gray-500">جاري التحميل...</div>}
      {error && <div className="text-center py-4 text-red-500">{error}</div>}

      {!loading && !error && (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-2 text-right">المستخدم</th>
                  <th className="px-4 py-2 text-right">النوع</th>
                  <th className="px-4 py-2 text-right">النقاط</th>
                  <th className="px-4 py-2 text-right">السبب</th>
                  <th className="px-4 py-2 text-right">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {history.map((record, index) => (
                  <tr key={index} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="px-4 py-2">{record.userName}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-sm ${
                        record.type === 'earned' ? 'bg-green-100 text-green-800' : 
                        record.type === 'redeemed' ? 'bg-blue-100 text-blue-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {record.type === 'earned' ? 'مكتسبة' : record.type === 'redeemed' ? 'مستبدلة' : 'منتهية الصلاحية'}
                      </span>
                    </td>
                    <td className="px-4 py-2">{record.points}</td>
                    <td className="px-4 py-2">{record.reason || '-'}</td>
                    <td className="px-4 py-2">{new Date(record.createdAt).toLocaleDateString('ar-EG')}</td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-gray-500">لا توجد سجلات</td>
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

export default PointsHistory;
