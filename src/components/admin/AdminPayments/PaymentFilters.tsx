import React from 'react';

interface PaymentFiltersProps {
  search: string;
  methodFilter: string;
  onSearchChange: (value: string) => void;
  onMethodFilterChange: (value: string) => void;
  onExportToExcel: () => void;
  onAddPayment: () => void;
  canEdit: boolean;
  filteredCount: number;
}

const PaymentFilters: React.FC<PaymentFiltersProps> = ({
  search,
  methodFilter,
  onSearchChange,
  onMethodFilterChange,
  onExportToExcel,
  onAddPayment,
  canEdit,
  filteredCount
}) => {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <input 
        value={search} 
        onChange={e=>onSearchChange(e.target.value)} 
        placeholder="ابحث بالاسم/الهاتف/الإيميل" 
        className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm" 
      />
      <select 
        value={methodFilter} 
        onChange={e=>onMethodFilterChange(e.target.value)} 
        className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white  text-sm p-[4px]"
      >
        <option value="all">كل الطرق</option>
        <option value="cash">نقدي</option>
        <option value="card">بطاقة</option>
        <option value="bank_transfer">تحويل بنكي</option>
        <option value="other">أخرى</option>
      </select>
      <button
        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm flex items-center gap-1"
        onClick={onExportToExcel}
        disabled={filteredCount === 0}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7,10 12,15 17,10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        تصدير Excel
      </button>
      {canEdit && (
        <button 
          onClick={onAddPayment} 
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm"
        >
          إضافة مدفوع
        </button>
      )}
    </div>
  );
};

export default PaymentFilters;
