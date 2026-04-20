'use client';

import React from 'react';

type SortOrder = 'asc' | 'desc';

interface ExpenseFiltersProps {
  category: string;
  setCategory: (value: string) => void;
  minAmount: string;
  setMinAmount: (value: string) => void;
  maxAmount: string;
  setMaxAmount: (value: string) => void;
  from: string;
  setFrom: (value: string) => void;
  to: string;
  setTo: (value: string) => void;
  sort: SortOrder;
  setSort: (value: SortOrder) => void;
  limit: number;
  setLimit: (value: number) => void;
  skip: number;
  setSkip: (value: number) => void;
  loading: boolean;
  onLoadList: () => void;
  onLoadSummary: () => void;
  onClearFilters: () => void;
  onExport: () => void;
  displayedItemsLength: number;
}

const ExpenseFilters: React.FC<ExpenseFiltersProps> = ({
  category,
  setCategory,
  minAmount,
  setMinAmount,
  maxAmount,
  setMaxAmount,
  from,
  setFrom,
  to,
  setTo,
  sort,
  setSort,
  limit,
  setLimit,
  skip,
  setSkip,
  loading,
  onLoadList,
  onLoadSummary,
  onClearFilters,
  onExport,
  displayedItemsLength,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
        <div className="flex flex-col">
          <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">التصنيف</label>
          <input
            className="px-1.5 py-0.5 rounded border dark:bg-gray-900 text-xs w-full h-8 min-w-[110px] sm:max-w-[160px] w-full"
            placeholder="مثال: rent"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">الحد الأدنى للمبلغ</label>
          <input
            type="number"
            className="px-1.5 py-0.5 rounded border dark:bg-gray-900 text-xs w-full h-8 min-w-[110px] sm:max-w-[160px] w-full"
            placeholder="0"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">الحد الأقصى للمبلغ</label>
          <input
            type="number"
            className="px-1.5 py-0.5 rounded border dark:bg-gray-900 text-xs w-full h-8 min-w-[110px] sm:max-w-[160px] w-full"
            placeholder="10000"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">التاريخ من</label>
          <input
            type="date"
            className="px-1.5 py-0.5 rounded border dark:bg-gray-900 text-xs w-full h-8 min-w-[110px] sm:max-w-[160px] w-full cursor-pointer"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            onClick={(e) => (e.currentTarget as HTMLInputElement).showPicker?.()}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">التاريخ إلى</label>
          <input
            type="date"
            className="px-1.5 py-0.5 rounded border dark:bg-gray-900 text-xs w-full h-8 min-w-[110px] sm:max-w-[160px] w-full cursor-pointer"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            onClick={(e) => (e.currentTarget as HTMLInputElement).showPicker?.()}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">الترتيب</label>
          <select
            className="px-1.5 py-0.5 rounded border dark:bg-gray-900 text-xs w-full h-8 min-w-[110px] sm:max-w-[160px] w-full"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOrder)}
          >
            <option value="desc">الأحدث</option>
            <option value="asc">الأقدم</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">الحد الأقصى للعرض</label>
          <input
            type="number"
            className="px-1.5 py-0.5 rounded border dark:bg-gray-900 text-xs w-full h-8 min-w-[110px] sm:max-w-[160px] w-full"
            placeholder="20"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value || 0))}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">الرقم الصفحة</label>
          <input
            type="number"
            className="px-1.5 py-0.5 rounded border dark:bg-gray-900 text-xs w-full h-8 min-w-[110px] sm:max-w-[160px] w-full"
            placeholder="0"
            value={skip}
            onChange={(e) => setSkip(Number(e.target.value || 0))}
          />
        </div>
        <div className="flex items-end">
          <button
            className="w-full px-1.5 py-0.5 rounded bg-gray-600 text-white text-xs h-8 min-w-[110px] sm:max-w-[160px] w-full"
            onClick={onLoadList}
            disabled={loading}
          >
            {loading ? 'جارِ التحميل...' : 'تحديث'}
          </button>
        </div>
        <div className="flex items-end">
          <button
            className="w-full px-1.5 py-0.5 rounded border text-xs h-8 min-w-[110px] sm:max-w-[160px] w-full"
            onClick={onClearFilters}
            disabled={loading}
          >
            مسح الفلتر الحالى 
          </button>
        </div>
        <div className="flex items-end">
          <button
            className="w-full px-1.5 py-0.5 rounded border text-xs h-8 min-w-[110px] sm:max-w-[160px] w-full"
            onClick={() => { setSkip(0); onLoadSummary(); }}
            disabled={loading}
          >
            ملخص
          </button>
        </div>
        <div className="flex  mt-4">
          <button
            onClick={onExport}
            disabled={displayedItemsLength === 0}
            className="px-4 py-2 rounded bg-green-600 text-white text-sm disabled:opacity-50 shadow hover:bg-green-700 transition-colors"
          >
            تصدير البيانات
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseFilters;
