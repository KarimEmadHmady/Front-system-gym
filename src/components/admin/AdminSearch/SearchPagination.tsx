import React from 'react';

interface SearchPaginationProps {
  currentPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

const SearchPagination: React.FC<SearchPaginationProps> = ({
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  totalCount,
  onPageChange
}) => {
  return (
    <div className="mt-6 flex items-center justify-between">
      <div className="text-sm text-gray-500">
        عرض {startIndex + 1} إلى {Math.min(endIndex, totalCount)} من {totalCount} نتيجة
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          السابق
        </button>
        <span className="px-3 py-1 text-sm">
          صفحة {currentPage} من {totalPages}
        </span>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          التالي
        </button>
      </div>
    </div>
  );
};

export default SearchPagination;
