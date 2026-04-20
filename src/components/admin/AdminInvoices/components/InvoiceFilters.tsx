import React from "react";
import type { GetInvoicesFilters } from "@/services/invoiceService";
import type { User } from "@/types/models";

interface Props {
  filters: GetInvoicesFilters;
  users: User[];
  loading: boolean;
  onChangeFilter: (k: keyof GetInvoicesFilters, v: any) => void;
  onRefresh: () => void;
  onExport: () => void;
  invoicesCount: number;
}

const InvoiceFilters: React.FC<Props> = ({
  filters, users, loading, onChangeFilter, onRefresh, onExport, invoicesCount,
}) => {
  const [userSearch, setUserSearch] = React.useState("");

  const filteredUsers = React.useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phone && u.phone.toLowerCase().includes(q)) ||
        (u._id && u._id.toLowerCase().includes(q))
    );
  }, [users, userSearch]);

  const inputClass = "px-1.5 py-0.5 rounded border dark:bg-gray-900 text-xs w-full h-8 min-w-[110px] sm:max-w-[160px]";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3">

        <div className="flex flex-col">
          <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">
            المستخدم ({users.length} مستخدم)
          </label>
          <select
            className={inputClass}
            value={filters.userId || ""}
            onChange={(e) => onChangeFilter("userId", e.target.value)}
          >
            <option value="">الكل</option>
            {filteredUsers.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name} ({u.email}){u.phone ? ` - ${u.phone}` : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">بحث عن مستخدم</label>
          <input
            className={inputClass}
            placeholder="اكتب اسم/بريد/ID للبحث"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">بحث برقم الفاتورة</label>
          <input
            className={inputClass}
            placeholder="مثال: INV-1001"
            value={filters.invoiceNumber || ""}
            onChange={(e) => onChangeFilter("invoiceNumber", e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">الحالة</label>
          <select
            className={inputClass}
            value={filters.status || ""}
            onChange={(e) => onChangeFilter("status", e.target.value as any)}
          >
            <option value="">الكل</option>
            <option value="pending">قيد الانتظار</option>
            <option value="paid">مدفوعة</option>
            <option value="overdue">متأخرة</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">من تاريخ</label>
          <input
            type="date"
            className={`${inputClass} cursor-pointer`}
            value={filters.from || ""}
            onChange={(e) => onChangeFilter("from", e.target.value)}
            onClick={(e) => (e.currentTarget as HTMLInputElement).showPicker?.()}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">إلى تاريخ</label>
          <input
            type="date"
            className={`${inputClass} cursor-pointer`}
            value={filters.to || ""}
            onChange={(e) => onChangeFilter("to", e.target.value)}
            onClick={(e) => (e.currentTarget as HTMLInputElement).showPicker?.()}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">الترتيب</label>
          <select
            className={inputClass}
            value={filters.sort || "desc"}
            onChange={(e) => onChangeFilter("sort", e.target.value as any)}
          >
            <option value="desc">الأحدث</option>
            <option value="asc">الأقدم</option>
          </select>
        </div>

        <div className="flex items-end space-x-2">
          <button
            onClick={onExport}
            disabled={invoicesCount === 0}
            className="px-1.5 py-0.5 rounded bg-green-600 text-white text-xs h-8 min-w-[110px] max-w-[160px] disabled:opacity-50"
          >
            تصدير البيانات
          </button>
          <button
            className="w-full px-1.5 py-0.5 rounded bg-gray-600 text-white text-xs h-8 min-w-[110px] max-w-[160px]"
            onClick={onRefresh}
          >
            {loading ? "جارِ التحميل..." : "تحديث"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceFilters;