import React from "react";
import type { Invoice } from "@/services/invoiceService";
import type { User } from "@/types/models";

interface Props {
  invoices: Invoice[];
  loading: boolean;
  userMap: Record<string, User>;
  updatingId: string | null;
  currentPage: number;
  totalPages: number;
  rangeStart: number;
  rangeEnd: number;
  count: number;
  canPaginate: { next: boolean; prev: boolean };
  fmt: (n: number) => string;
  onView: (inv: Invoice) => void;
  onMarkPaid: (id: string) => void;
  onNextPage: () => void;
  onPrevPage: () => void;
}

const statusLabel = (s: string) =>
  s === "paid" ? "مدفوعة" : s === "overdue" ? "متأخرة" : "قيد الانتظار";

const statusColor = (s: string) =>
  s === "paid" ? "text-green-600" : s === "overdue" ? "text-red-600" : "text-gray-600";

const InvoicesTable: React.FC<Props> = ({
  invoices, loading, userMap, updatingId,
  currentPage, totalPages, rangeStart, rangeEnd, count, canPaginate,
  fmt, onView, onMarkPaid, onNextPage, onPrevPage,
}) => (
  <div className="space-y-3">
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-auto">
      <table className="min-w-full text-left">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th className="px-4 py-2 text-center">رقم الفاتورة</th>
            <th className="px-4 py-2 text-center">المستخدم</th>
            <th className="px-4 py-2 text-center">المبلغ</th>
            <th className="px-4 py-2 text-center">تاريخ الإصدار</th>
            <th className="px-4 py-2 text-center">تاريخ الاستحقاق</th>
            <th className="px-4 py-2 text-center">الحالة</th>
            <th className="px-4 py-2 text-right">إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => {
            const user = userMap[inv.userId];
            return (
              <tr key={inv._id} className="border-t border-gray-200 dark:border-gray-700">
                <td className="px-4 py-2 font-medium text-center">{inv.invoiceNumber}</td>
                <td className="px-4 py-2 text-sm text-center">
                  {user ? (
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs">
                        {user.phone ? `📞 ${user.phone}` : "📞 لا يوجد رقم هاتف"}
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-400 dark:text-gray-500">
                      <div>مستخدم غير موجود</div>
                      <div className="text-xs">ID: {inv.userId}</div>
                    </div>
                  )}
                </td>
                <td className="px-4 py-2 text-center">ج.م{fmt(inv.amount)}</td>
                <td className="px-4 py-2 text-sm text-center">{String(inv.issueDate).slice(0, 10)}</td>
                <td className="px-4 py-2 text-sm text-center">
                  {inv.dueDate ? String(inv.dueDate).slice(0, 10) : "-"}
                </td>
                <td className="px-4 py-2 text-center">
                  <span className={statusColor(inv.status)}>{statusLabel(inv.status)}</span>
                </td>
                <td className="px-4 py-2 text-right space-x-2">
                  <button
                    className="px-3 py-1 rounded bg-gray-600 text-white text-sm"
                    onClick={() => onView(inv)}
                  >
                    عرض
                  </button>
                  {inv.status !== "paid" && (
                    <button
                      className="px-3 py-1 rounded bg-green-600 text-white text-sm disabled:opacity-60"
                      onClick={() => onMarkPaid(inv._id)}
                      disabled={updatingId === inv._id}
                    >
                      {updatingId === inv._id ? "جارِ الحفظ..." : "تحديد كمدفوعة"}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
          {invoices.length === 0 && !loading && (
            <tr>
              <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                لا توجد فواتير
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    {/* Pagination */}
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-700 dark:text-gray-300">
      <div>
        عرض {rangeStart} إلى {rangeEnd} من {fmt(count)} نتيجة • صفحة {currentPage} من {totalPages}
      </div>
      <div className="flex items-center gap-2">
        <button
          className="px-3 py-1 rounded border dark:border-gray-700 disabled:opacity-50"
          disabled={!canPaginate.prev}
          onClick={onPrevPage}
        >
          السابق
        </button>
        <button
          className="px-3 py-1 rounded border dark:border-gray-700 disabled:opacity-50"
          disabled={!canPaginate.next}
          onClick={onNextPage}
        >
          التالي
        </button>
      </div>
    </div>
  </div>
);

export default InvoicesTable;