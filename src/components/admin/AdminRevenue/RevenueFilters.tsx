'use client';

import React from 'react';
import type { SortOrder } from './types';

type Props = {
  sourceType: string;
  setSourceType: (v: string) => void;
  paymentMethod: string;
  setPaymentMethod: (v: string) => void;
  minAmount: string;
  setMinAmount: (v: string) => void;
  maxAmount: string;
  setMaxAmount: (v: string) => void;
  from: string;
  setFrom: (v: string) => void;
  to: string;
  setTo: (v: string) => void;
  sort: SortOrder;
  setSort: (v: SortOrder) => void;
  limit: number;
  setLimit: (v: number) => void;
  loading: boolean;
  displayedCount: number;
  onRefresh: () => void;
  onClearFilters: () => void;
  onLoadSummary: () => void;
  onExport: () => void;
  onSkipReset: () => void;
};

const RevenueFilters = ({
  sourceType, setSourceType,
  paymentMethod, setPaymentMethod,
  minAmount, setMinAmount,
  maxAmount, setMaxAmount,
  from, setFrom,
  to, setTo,
  sort, setSort,
  limit, setLimit,
  loading,
  displayedCount,
  onRefresh,
  onClearFilters,
  onLoadSummary,
  onExport,
  onSkipReset,
}: Props) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        <div className="flex flex-col">
          <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">نوع المصدر</label>
          <select className="px-1.5 py-0.5 rounded border dark:bg-gray-900 text-xs h-8" value={sourceType} onChange={e => { setSourceType(e.target.value); onSkipReset(); }}>
            <option value="">الكل</option>
            <option value="subscription">اشتراك</option>
            <option value="purchase">شراء</option>
            <option value="invoice">فاتورة</option>
            <option value="other">أخرى</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">طريقة الدفع</label>
          <select className="px-1.5 py-0.5 rounded border dark:bg-gray-900 text-xs h-8" value={paymentMethod} onChange={e => { setPaymentMethod(e.target.value); onSkipReset(); }}>
            <option value="">الكل</option>
            <option value="cash">نقدي</option>
            <option value="card">بطاقة</option>
            <option value="transfer">تحويل</option>
            <option value="bank_transfer">حوالة بنكية</option>
            <option value="other">أخرى</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">أدنى مبلغ</label>
          <input type="number" className="px-1.5 py-0.5 rounded border dark:bg-gray-900 text-xs h-8" value={minAmount} onChange={e => { setMinAmount(e.target.value); onSkipReset(); }} />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">أقصى مبلغ</label>
          <input type="number" className="px-1.5 py-0.5 rounded border dark:bg-gray-900 text-xs h-8" value={maxAmount} onChange={e => { setMaxAmount(e.target.value); onSkipReset(); }} />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">من تاريخ</label>
          <input type="date" className="px-1.5 py-0.5 rounded border dark:bg-gray-900 text-xs h-8 cursor-pointer" value={from} onChange={e => { setFrom(e.target.value); onSkipReset(); }} onClick={e => (e.currentTarget as HTMLInputElement).showPicker?.()} />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">إلى تاريخ</label>
          <input type="date" className="px-1.5 py-0.5 rounded border dark:bg-gray-900 text-xs h-8 cursor-pointer" value={to} onChange={e => { setTo(e.target.value); onSkipReset(); }} onClick={e => (e.currentTarget as HTMLInputElement).showPicker?.()} />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">الترتيب</label>
          <select className="px-1.5 py-0.5 rounded border dark:bg-gray-900 text-xs h-8" value={sort} onChange={e => { setSort(e.target.value as SortOrder); onSkipReset(); }}>
            <option value="desc">الأحدث</option>
            <option value="asc">الأقدم</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">عدد النتائج</label>
          <select className="px-1.5 py-0.5 rounded border dark:bg-gray-900 text-xs h-8" value={limit} onChange={e => { setLimit(Number(e.target.value)); onSkipReset(); }}>
            {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div className="flex items-end">
          <button className="w-full px-1.5 py-0.5 rounded bg-gray-600 text-white text-xs h-8" onClick={onRefresh} disabled={loading}>
            {loading ? 'جارِ التحميل...' : 'تحديث'}
          </button>
        </div>
        <div className="flex items-end">
          <button className="w-full px-1.5 py-0.5 rounded border text-xs h-8" onClick={onClearFilters} disabled={loading}>إلغاء الفلاتر</button>
        </div>
        <div className="flex items-end">
          <button className="w-full px-1.5 py-0.5 rounded border text-xs h-8" onClick={onLoadSummary} disabled={loading}>ملخص</button>
        </div>
        <div className="flex mt-4">
          <button onClick={onExport} disabled={displayedCount === 0} className="px-4 py-2 rounded bg-green-600 text-white text-sm disabled:opacity-50 shadow hover:bg-green-700 transition-colors">
            تصدير البيانات
          </button>
        </div>
      </div>
    </div>
  );
};

export default RevenueFilters;