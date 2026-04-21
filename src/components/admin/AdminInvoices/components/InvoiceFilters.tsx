import React from "react";
import type { GetInvoicesFilters } from "@/services/invoiceService";
import type { User } from "@/types/models";
import { useUsers } from "@/hooks/useUsers";

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
  const { search: searchUsers, isLoading: usersLoading } = useUsers();
  const [searchResults, setSearchResults] = React.useState<User[]>([]);

  React.useEffect(() => {
    if (userSearch.trim()) {
      searchUsers({ search: userSearch.trim() }).then(result => {
        const results = result.data || [];
        setSearchResults(results);
        
        // Auto-select user if exactly one result found
        if (results.length === 1) {
          const selectedUser = results[0];
          onChangeFilter("userId", selectedUser._id);
        }
      }).catch(error => {
        setSearchResults([]);
      });
    } else {
      setSearchResults([]);
    }
  }, [userSearch, searchUsers, onChangeFilter]);

  const displayUsers: User[] = userSearch.trim() ? searchResults : users;
  
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
            {displayUsers.map((u: User) => (
              <option key={u._id} value={u._id}>
                {u.name} ({u.email}){u.phone ? ` - ${u.phone}` : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-gray-600 dark:text-gray-300 mb-1"> recherche d'utilisateur</label>
          <div className="relative">
            <input
              className={inputClass}
              placeholder="Write name/email/ID to search"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />
            {usersLoading && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          {userSearch.trim() && searchResults.length === 0 && !usersLoading && (
            <p className="text-xs text-red-500 mt-1">No users found</p>
          )}
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