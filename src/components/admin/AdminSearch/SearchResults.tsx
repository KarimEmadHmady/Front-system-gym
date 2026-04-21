import React from 'react';
import { Download } from 'lucide-react';

interface SearchResult {
  type: string;
  id: string;
  amount: number;
  date: string;
  userId?: string;
  employeeId?: string;
  method?: string;
  sourceType?: string;
  category?: string;
  status?: string;
  invoiceNumber?: string;
  itemName?: string;
  notes?: string;
  bonuses?: number;
  deductions?: number;
  raw: any;
}

interface SearchResultsProps {
  loading: boolean;
  error: string | null;
  visibleResults: SearchResult[];
  totalCount: number;
  startIndex: number;
  endIndex: number;
  totalAmount: number;
  getUserInfo: (userId: string) => { name: string; phone: string };
  onExportToExcel: () => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  loading,
  error,
  visibleResults,
  totalCount,
  startIndex,
  endIndex,
  totalAmount,
  getUserInfo,
  onExportToExcel
}) => {
  const getResultIcon = (type: string) => {
    const icons = {
      revenue: '💰',
      expense: '💸',
      invoice: '🧾',
      payroll: '👥',
      payment: '💳',
      purchase: '🛒'
    };
    return icons[type as keyof typeof icons] || '📄';
  };

  const getResultColor = (type: string) => {
    const colors = {
      revenue: 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200',
      expense: 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200',
      invoice: 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-200',
      payroll: 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-200',
      payment: 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-200',
      purchase: 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-200'
    };
    return colors[type as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      revenue: 'إيراد',
      expense: 'مصروف',
      invoice: 'فاتورة',
      payroll: 'راتب',
      payment: 'دفعة',
      purchase: 'شراء'
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
            نتائج البحث ({Math.min(endIndex, totalCount).toLocaleString()} / {totalCount.toLocaleString()})
          </h4>
          {/* مربع مجموع المبالغ */}
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-1 sm:gap-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded px-2 sm:px-4 py-1 sm:py-2 font-bold text-sm sm:text-[14px] flex-row shadow-sm text-center sm:text-right">
            <span className="text-lg sm:text-2xl">💰</span>
            <span>المجموع:</span>
            <span className="ltr:ml-1 sm:ltr:ml-2 rtl:mr-1 sm:rtl:mr-2">ج.م{totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 mt-1 sm:mt-0">
            {loading && <span className="text-xs sm:text-sm text-gray-600">جاري البحث...</span>}
            {visibleResults.length > 0 && (
              <button
                onClick={onExportToExcel}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs sm:text-sm"
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                تصدير Excel
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {visibleResults.length === 0 && !loading ? (
          <div className="text-center py-8 text-gray-500">
            لا توجد نتائج للبحث
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm">
                  <th className="py-3 px-4 text-center">النوع</th>
                  <th className="py-3 px-4 text-center">المبلغ</th>
                  <th className="py-3 px-4 text-center">التاريخ</th>
                  <th className="py-3 px-4 text-center">المستخدم</th>
                  <th className="py-3 px-4 text-center">التفاصيل</th>
                  <th className="py-3 px-4 text-center">ملاحظات</th>
                </tr>
              </thead>
              <tbody>
                {visibleResults.map((result) => {
                  const userInfo = result.userId ? getUserInfo(result.userId) : null;
                  return (
                    <tr key={`${result.type}-${result.id}`} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${getResultColor(result.type)}`}>
                          {getResultIcon(result.type)} {getTypeLabel(result.type)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-semibold">
                        ج.م{result.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {new Date(result.date).toLocaleDateString('ar-EG')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {userInfo ? (
                          <div>
                            <div className="font-medium">{userInfo.name}</div>
                            {userInfo.phone && <div className="text-xs text-gray-500">{userInfo.phone}</div>}
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="text-sm">
                          {result.invoiceNumber && <div>فاتورة: {result.invoiceNumber}</div>}
                          {result.itemName && <div>المنتج: {result.itemName}</div>}
                          {result.method && <div>الطريقة: {result.method}</div>}
                          {result.status && <div>الحالة: {result.status}</div>}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                          {result.notes || '-'}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
