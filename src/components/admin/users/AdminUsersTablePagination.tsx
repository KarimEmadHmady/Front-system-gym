import React from 'react';

interface AdminUsersTablePaginationProps {
  currentPage: number;
  setCurrentPage: (v: number) => void;
  PAGE_SIZE: number;
  totalUsers: number;
  loading: boolean;
}

const AdminUsersTablePagination: React.FC<AdminUsersTablePaginationProps> = ({
  currentPage,
  setCurrentPage,
  PAGE_SIZE,
  totalUsers,
  loading,
}) => {
  const totalPages = Math.ceil(totalUsers / PAGE_SIZE) || 1;
  const startIdx = (currentPage - 1) * PAGE_SIZE + 1;
  const endIdx = Math.min(currentPage * PAGE_SIZE, totalUsers);

  return (
    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          عرض {startIdx}-{endIdx} من {totalUsers} مستخدم
          <span className="mx-2 text-xs text-gray-400">صفحة {currentPage} من {totalPages}</span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1 || loading}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            السابق
          </button>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage >= totalPages || loading}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            التالي
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersTablePagination;
