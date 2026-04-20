import React from 'react';

type TopUser = {
  _id: string;
  name: string;
  email: string;
  loyaltyPoints: number;
  avatarUrl?: string;
};

interface Props {
  topUsers: TopUser[];
  loading: boolean;
}

const TopUsers: React.FC<Props> = ({ topUsers, loading }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">أفضل 3 مستخدمين حسب النقاط</h3>
      {loading ? (
        <div className="text-center py-4 text-gray-500">جاري التحميل...</div>
      ) : (
        <div className="flex flex-col md:flex-row gap-4">
          {topUsers.map((u, i) => (
            <div key={u._id} className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-lg p-4 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-2xl font-bold text-gray-600 dark:text-gray-300 mb-2">
                {u.avatarUrl ? (
                  <img 
                    src={u.avatarUrl} 
                    alt={u.name}
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                <span className="text-2xl" style={{ display: u.avatarUrl ? 'none' : 'flex' }}>
                  {u.name?.charAt(0) || '?'}
                </span>
              </div>
              <div className="font-semibold text-lg text-gray-900 dark:text-white">{u.name}</div>
              <div className="text-sm text-gray-500 dark:text-gray-300">{u.email}</div>
              <div className="mt-2 text-gray-700 dark:text-gray-200 font-bold">{u.loyaltyPoints} نقاط</div>
              <div className="text-xs text-gray-400 mt-1">#{i + 1}</div>
            </div>
          ))}
          {topUsers.length === 0 && <div className="text-gray-400">لا يوجد مستخدمين</div>}
        </div>
      )}
    </div>
  );
};

export default TopUsers;
