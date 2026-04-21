import React from 'react';
import type { Payment } from '@/services/paymentService';
import type { User } from '@/types/models';

interface PaymentTableProps {
  payments: Payment[];
  userMap: Record<string, User>;
  canEdit: boolean;
  deletingId: string | null;
  onEdit: (payment: Payment) => void;
  onDelete: (id: string) => void;
  startIndex: number;
  pageSize: number;
  totalPayments: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaymentTable: React.FC<PaymentTableProps> = ({
  payments,
  userMap,
  canEdit,
  deletingId,
  onEdit,
  onDelete,
  startIndex,
  pageSize,
  totalPayments,
  currentPage,
  totalPages,
  onPageChange
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead>
          <tr>
            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase ">المستخدم</th>
            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase ">المبلغ</th>
            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase ">التاريخ</th>
            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase ">الطريقة</th>
            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase ">ملاحظات</th>
            {canEdit && <th className="px-4 py-2"></th>}
          </tr>
        </thead>
        <tbody>
          {payments.length === 0 ? (
            <tr><td colSpan={canEdit ? 6 : 5} className="text-center py-4 text-gray-400">لا توجد مدفوعات.</td></tr>
          ) : payments.map(p => {
            const u = userMap[p.userId];
            const d = new Date(p.date);
            return (
              <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 py-2 whitespace-nowrap text-center">{u?.name || p.userId} {u?.phone ? `(${u.phone})` : ''}</td>
                <td className="px-4 py-2 whitespace-nowrap text-center">{p.amount}</td>
                <td className="px-4 py-2 whitespace-nowrap text-center">{d.toLocaleDateString()} {d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td>
                <td className="px-4 py-2 whitespace-nowrap text-center">{p.method === 'cash' ? 'نقدي' : p.method === 'card' ? 'بطاقة' : p.method === 'bank_transfer' ? 'تحويل بنكي' : 'أخرى'}</td>
                <td className="px-4 py-2 whitespace-nowrap text-center">{p.notes || '-'}</td>
                {canEdit && (
                  <td className="px-4 py-2 whitespace-nowrap flex gap-2">
                    <button className="px-2 py-1 rounded bg-gray-200 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900 text-xs" onClick={()=>onEdit(p)}>تعديل</button>
                    <button className="px-2 py-1 rounded bg-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 text-xs disabled:opacity-50" onClick={()=>onDelete(p._id)} disabled={deletingId===p._id}>{deletingId===p._id?'جارٍ الحذف...':'حذف'}</button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      {payments.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 text-sm text-gray-700 dark:text-gray-300">
          <div>
            عرض {totalPayments === 0 ? 0 : startIndex + 1} إلى {Math.min(startIndex + pageSize, totalPayments)} من {totalPayments} نتيجة
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 rounded border border-gray-300 dark:border-gray-700 disabled:opacity-50"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              السابق
            </button>
            <span>
              صفحة {currentPage} من {totalPages}
            </span>
            <button
              className="px-3 py-1 rounded border border-gray-300 dark:border-gray-700 disabled:opacity-50"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              التالي
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentTable;
