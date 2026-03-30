import React from 'react';

interface AdminUsersTableHeaderProps {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  filterRole: string;
  setFilterRole: (v: string) => void;
  onOpenCreate?: () => void;
  hideCreateButton?: boolean;
  onExportData?: () => void;
}

const AdminUsersTableHeader: React.FC<AdminUsersTableHeaderProps> = ({
  searchTerm,
  setSearchTerm,
  filterRole,
  setFilterRole,
  onOpenCreate,
  hideCreateButton,
  onExportData,
}) => (
  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-0">
        إدارة المستخدمين
      </h3>
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
        {!hideCreateButton && (
          <button
            onClick={onOpenCreate}
            className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm"
          >
            إضافة مستخدم
          </button>
        )}
        {onExportData && (
          <button
            onClick={onExportData}
            className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm"
          >
            تصدير البيانات
          </button>
        )}
        <input
          type="text"
          placeholder="البحث عن مستخدم..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-white"
        />
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="all">جميع الأدوار</option>
          <option value="member">عضو</option>
          <option value="trainer">مدرب</option>
          <option value="manager">مدير</option>
          <option value="admin">إدارة</option>
        </select>
      </div>
    </div>
  </div>
);

export default AdminUsersTableHeader;
