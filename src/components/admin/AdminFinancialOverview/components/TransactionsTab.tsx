import React from 'react';
import { getTimeAgo } from '../utils/formatters';

interface Transaction {
  id: string;
  type: string;
  description?: string;
  amount: number;
  date: string;
  category: string;
  clientName?: string;
  employeeId?: string;
  employeeName?: string;
  vendorName?: string;
}

interface TransactionsTabProps {
  loading: boolean;
  error: string | null;
  paginatedTransactions: Transaction[];
  recentTransactions: Transaction[];
  currentPage: number;
  pageCount: number;
  startIndex: number;
  endIndex: number;
  userMap: Record<string, any>;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  onExport: () => void;
}

const TransactionRow = ({ transaction, userMap }: { transaction: Transaction; userMap: Record<string, any> }) => {
  let title = '';
  let description = '';
  let icon = transaction.type === 'revenue' ? '💰' : '💸';
  let color = transaction.type === 'revenue' ? 'text-green-600' : 'text-red-600';

  if (transaction.category === 'invoice') {
    title = `فاتورة #${transaction.description?.match(/\d+/)?.[0] || ''}`;
    description = transaction.description || '';
    icon = '🧾';
    color = 'text-gray-600';
  } else if (transaction.category === 'payroll') {
    title = 'راتب';
    const name = transaction.employeeName || userMap?.[transaction.employeeId || '']?.name || transaction.employeeId || 'موظف';
    description = `راتب - ${name}`;
    icon = '🧑‍💼';
    color = 'text-gray-600';
  } else if (transaction.type === 'revenue') {
    title = 'دفعة مستلمة';
    description = transaction.description || '';
  } else {
    title = 'مصروف';
    description = transaction.description || '';
  }

  const extra = transaction.clientName || transaction.employeeName || transaction.vendorName || '';

  return (
    <div className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${color}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">{title}</h4>
          <span className="text-xs text-gray-500 dark:text-gray-400">{getTimeAgo(transaction.date)}</span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
        {extra && <p className="text-xs text-gray-400 mt-1">{extra}</p>}
      </div>
      <div className="text-right min-w-[80px]">
        <p className={`font-medium ${color}`}>
          {transaction.amount > 0 ? '+' : ''}ج.م{transaction.amount.toLocaleString()}
        </p>
      </div>
    </div>
  );
};

const TransactionsTab: React.FC<TransactionsTabProps> = ({
  loading, error, paginatedTransactions, recentTransactions,
  currentPage, pageCount, startIndex, endIndex, userMap,
  onPageChange, onRefresh, onExport,
}) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">المعاملات الأخيرة</h3>
      <div className="flex items-center space-x-2">
        <button
          onClick={onExport}
          disabled={loading}
          className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'جارِ التصدير...' : 'تصدير البيانات'}
        </button>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
        >
          {loading ? 'جارِ التحميل...' : 'تحديث'}
        </button>
      </div>
    </div>

    {error && (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
    )}

    {loading && recentTransactions.length === 0 ? (
      <div className="text-center py-8 text-gray-500">جارِ تحميل المعاملات...</div>
    ) : recentTransactions.length === 0 ? (
      <div className="text-center py-8 text-gray-500">لا توجد معاملات حديثة</div>
    ) : (
      <div className="space-y-3">
        {paginatedTransactions.map((t) => (
          <TransactionRow key={t.id} transaction={t} userMap={userMap} />
        ))}
      </div>
    )}

    {recentTransactions.length > 0 && (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 text-sm text-gray-700 dark:text-gray-300">
        <div>عرض {startIndex + 1} إلى {endIndex} من {recentTransactions.length} نتيجة</div>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1 rounded border border-gray-300 dark:border-gray-700 disabled:opacity-50"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            السابق
          </button>
          <span>صفحة {currentPage} من {pageCount}</span>
          <button
            className="px-3 py-1 rounded border border-gray-300 dark:border-gray-700 disabled:opacity-50"
            onClick={() => onPageChange(Math.min(pageCount, currentPage + 1))}
            disabled={currentPage === pageCount}
          >
            التالي
          </button>
        </div>
      </div>
    )}
  </div>
);

export default TransactionsTab;