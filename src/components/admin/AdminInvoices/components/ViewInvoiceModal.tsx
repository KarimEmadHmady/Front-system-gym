import React from "react";
import type { Invoice } from "@/services/invoiceService";
import type { User } from "@/types/models";

interface Props {
  open: boolean;
  invoice: Invoice | null;
  userMap: Record<string, User>;
  updatingId: string | null;
  fmt: (n: number) => string;
  onClose: () => void;
  onEdit: (inv: Invoice) => void;
  onDelete: (id: string) => void;
  onPrint: (inv: Invoice) => void;
}

const ViewInvoiceModal: React.FC<Props> = ({
  open, invoice, userMap, updatingId, fmt,
  onClose, onEdit, onDelete, onPrint,
}) => {
  if (!open || !invoice) return null;

  const statusStyle = invoice.status === "paid"
    ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-200"
    : invoice.status === "overdue"
    ? "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-200"
    : "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-200";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-3xl w-full mx-4 p-6 relative animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 dark:bg-gray-900/30 text-gray-700 dark:text-gray-200 text-xs font-bold">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 3h9a2 2 0 0 1 2 2v3h-2V5H6v14h9v-3h2v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" stroke="#2563eb" strokeWidth="2"/></svg>
              فاتورة #{invoice.invoiceNumber}
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusStyle}`}>
              {invoice.status}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/40">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" stroke="#64748b" strokeWidth="2"/><path d="M20 22a8 8 0 1 0-16 0" stroke="#64748b" strokeWidth="2"/></svg>
              بيانات العميل
            </div>
            <div className="space-y-1">
              <div><span className="text-gray-500">الاسم:</span> <span className="font-medium">{userMap[invoice.userId]?.name || invoice.userId}</span></div>
              <div><span className="text-gray-500">الهاتف:</span> <span className="font-medium">{userMap[invoice.userId]?.phone || "-"}</span></div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/40">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 5h18M3 12h18M3 19h18" stroke="#64748b" strokeWidth="2"/></svg>
              تفاصيل الفاتورة
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              {[
                ["القيمة", fmt(invoice.amount)],
                ["مدفوع", fmt(invoice.paidAmount || 0)],
                ["الإصدار", String(invoice.issueDate).slice(0, 10)],
                ["الاستحقاق", invoice.dueDate ? String(invoice.dueDate).slice(0, 10) : "-"],
              ].map(([label, val]) => (
                <React.Fragment key={label}>
                  <div className="text-gray-500">{label}</div>
                  <div className="font-medium text-right md:text-left">{val}</div>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Items table */}
          <div className="md:col-span-2 rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/40">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="#64748b" strokeWidth="2"/></svg>
              العناصر
            </div>
            <div className="overflow-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-100 dark:bg-gray-800/60">
                  <tr>
                    <th className="px-3 py-2">الوصف</th>
                    <th className="px-3 py-2">الكمية</th>
                    <th className="px-3 py-2">السعر</th>
                    <th className="px-3 py-2">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {(invoice.items || []).map((it, i) => (
                    <tr key={i} className="border-t border-gray-200 dark:border-gray-700">
                      <td className="px-3 py-2">{it.description}</td>
                      <td className="px-3 py-2">{it.quantity}</td>
                      <td className="px-3 py-2">{fmt(it.price)}</td>
                      <td className="px-3 py-2">{fmt((it.quantity || 0) * (it.price || 0))}</td>
                    </tr>
                  ))}
                  {(!invoice.items || invoice.items.length === 0) && (
                    <tr><td className="px-3 py-3 text-center text-gray-500" colSpan={4}>لا توجد عناصر</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          <div className="md:col-span-2 rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/40">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h16" stroke="#64748b" strokeWidth="2"/></svg>
              ملاحظات
            </div>
            <div className="font-medium">{invoice.notes || "-"}</div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex flex-wrap justify-end gap-2 mt-6">
          <button className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600" onClick={() => onPrint(invoice)}>
            <span className="inline-flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 9V2h12v7" stroke="#fff" strokeWidth="2"/><path d="M6 18h12v4H6z" stroke="#fff" strokeWidth="2"/><path d="M6 14h12" stroke="#fff" strokeWidth="2"/></svg>
              طباعة الفاتورة
            </span>
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            disabled={updatingId === invoice._id}
            onClick={() => onDelete(invoice._id)}
          >
            {updatingId === invoice._id ? "جارٍ الحذف..." : "حذف الفاتورة"}
          </button>
          <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700" onClick={() => onEdit(invoice)}>
            تعديل الفاتورة
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewInvoiceModal;