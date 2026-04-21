import React from 'react';

interface PayrollPaginationProps {
  skip: number;
  limit: number;
  count: number;
  loading: boolean;
  displayedRowsLength: number;
  roleFilter: string;
  effectiveFrom: string;
  effectiveTo: string;
  onSkipChange: (skip: number) => void;
  onLoadList: () => void;
}

const PayrollPagination: React.FC<PayrollPaginationProps> = ({
  skip,
  limit,
  count,
  loading,
  displayedRowsLength,
  roleFilter,
  effectiveFrom,
  effectiveTo,
  onSkipChange,
  onLoadList
}) => {
  const pageSize = limit || 10;
  const currentPage = Math.floor((skip || 0) / pageSize) + 1;
  const totalPages = Math.max(1, Math.ceil((count || 0) / pageSize));
  const hasClientFilters = Boolean(roleFilter || effectiveFrom || effectiveTo);
  const totalForUi = hasClientFilters ? displayedRowsLength : (count || 0);
  const start = totalForUi > 0 ? 1 : 0;
  const end = totalForUi;

  return (
    <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-700 dark:text-gray-300">
      <div>
        عرض {start} إلى {end} من {new Intl.NumberFormat().format(totalForUi)} نتيجة
        {hasClientFilters ? ' (بعد الفلترة)' : ''} • صفحة {currentPage} من {totalPages}
      </div>
      <div className="flex items-center gap-2">
        <button 
          className="px-3 py-1 rounded border dark:border-gray-700 disabled:opacity-50" 
          disabled={(skip === 0) || loading} 
          onClick={() => { 
            const newSkip = Math.max(0, skip - pageSize); 
            onSkipChange(newSkip); 
            onLoadList(); 
          }}
        >
          السابق
        </button>
        <button 
          className="px-3 py-1 rounded border dark:border-gray-700 disabled:opacity-50" 
          disabled={((skip + pageSize) >= count) || loading} 
          onClick={() => { 
            const newSkip = skip + pageSize; 
            onSkipChange(newSkip); 
            onLoadList(); 
          }}
        >
          التالي
        </button>
      </div>
    </div>
  );
};

export default PayrollPagination;
