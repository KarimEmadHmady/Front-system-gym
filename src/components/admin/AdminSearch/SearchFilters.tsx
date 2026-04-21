import React from 'react';

interface SearchFilters {
  type: string;
  userId: string;
  employeeId: string;
  invoiceNumber: string;
  status: string;
  category: string;
  sourceType: string;
  paymentMethod: string;
  minAmount: string;
  maxAmount: string;
  from: string;
  to: string;
  sort: string;
  limit: number;
}

interface SearchFiltersProps {
  filters: SearchFilters;
  users: any[];
  showAdvanced: boolean;
  onFiltersChange: (key: keyof SearchFilters, value: string | number) => void;
  onToggleAdvanced: () => void;
  onResetFilters: () => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  users,
  showAdvanced,
  onFiltersChange,
  onToggleAdvanced,
  onResetFilters
}) => {
  const updateFilter = (key: keyof SearchFilters, value: string | number) => {
    onFiltersChange(key, value);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">البحث المتقدم</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">ابحث في جميع المعاملات المالية بمرونة عالية</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onToggleAdvanced}
            className="px-4 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            {showAdvanced ? 'إخفاء المتقدم' : 'إظهار المتقدم'}
          </button>
          <button
            onClick={onResetFilters}
            className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            إعادة تعيين
          </button>
        </div>
      </div>

      {/* Basic Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نوع المعاملة</label>
          <select
            value={filters.type}
            onChange={(e) => updateFilter('type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">الكل</option>
            <option value="revenue">إيرادات</option>
            <option value="expense">مصروفات</option>
            <option value="invoice">فواتير</option>
            <option value="payroll">رواتب</option>
            <option value="payment">مدفوعات</option>
            <option value="purchase">مشتريات</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المستخدم</label>
          <select
            value={filters.userId}
            onChange={(e) => updateFilter('userId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">الكل</option>
            {users.map(user => (
              <option key={user._id} value={user._id}>
                {user.name} {user.phone && `(${user.phone})`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">من تاريخ</label>
          <input
            type="date"
            value={filters.from}
            onChange={(e) => updateFilter('from', e.target.value)}
            onClick={(e) => (e.currentTarget as HTMLInputElement).showPicker?.()}
            className="w-full cursor-pointer px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">إلى تاريخ</label>
          <input
            type="date"
            value={filters.to}
            onChange={(e) => updateFilter('to', e.target.value)}
            onClick={(e) => (e.currentTarget as HTMLInputElement).showPicker?.()}
            className="w-full cursor-pointer px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">فلاتر متقدمة</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">رقم الفاتورة</label>
              <input
                type="text"
                value={filters.invoiceNumber}
                onChange={(e) => updateFilter('invoiceNumber', e.target.value)}
                placeholder="رقم الفاتورة"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الحالة</label>
              <select
                value={filters.status}
                onChange={(e) => updateFilter('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">الكل</option>
                <option value="paid">مدفوعة</option>
                <option value="pending">معلقة</option>
                <option value="overdue">متأخرة</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">فئة المصروف</label>
              <select
                value={filters.category}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">الكل</option>
                <option value="rent">إيجار</option>
                <option value="utilities">مرافق</option>
                <option value="equipment">معدات</option>
                <option value="maintenance">صيانة</option>
                <option value="other">أخرى</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نوع الإيراد</label>
              <select
                value={filters.sourceType}
                onChange={(e) => updateFilter('sourceType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">الكل</option>
                <option value="membership">عضوية</option>
                <option value="training">تدريب</option>
                <option value="products">منتجات</option>
                <option value="services">خدمات</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">طريقة الدفع</label>
              <select
                value={filters.paymentMethod}
                onChange={(e) => updateFilter('paymentMethod', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">الكل</option>
                <option value="cash">نقدي</option>
                <option value="card">بطاقة</option>
                <option value="bank">تحويل بنكي</option>
                <option value="online">أونلاين</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الترتيب</label>
              <select
                value={filters.sort}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="desc">الأحدث أولاً</option>
                <option value="asc">الأقدم أولاً</option>
              </select>
            </div>
          </div>

          {/* Amount Range */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الحد الأدنى</label>
              <input
                type="number"
                value={filters.minAmount}
                onChange={(e) => updateFilter('minAmount', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الحد الأقصى</label>
              <input
                type="number"
                value={filters.maxAmount}
                onChange={(e) => updateFilter('maxAmount', e.target.value)}
                placeholder="1000000"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">عدد النتائج</label>
              <select
                value={filters.limit}
                onChange={(e) => updateFilter('limit', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;
