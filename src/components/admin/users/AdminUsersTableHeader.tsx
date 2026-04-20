import React, { useState, useCallback } from 'react';
import { useUsers } from '@/hooks/useUsers';

interface AdminUsersTableHeaderProps {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  filterRole: string;
  setFilterRole: (v: string) => void;
  onOpenCreate?: () => void;
  hideCreateButton?: boolean;
  onExportData?: () => void;
  onSearchResults?: (results: any[]) => void;
  onSearchLoading?: (loading: boolean) => void;
}

const AdminUsersTableHeader: React.FC<AdminUsersTableHeaderProps> = ({
  searchTerm,
  setSearchTerm,
  filterRole,
  setFilterRole,
  onOpenCreate,
  hideCreateButton,
  onExportData,
  onSearchResults,
  onSearchLoading,
}) => {
  const { search, isLoading: searchLoading } = useUsers();
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Handle search with debounce
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // If search is empty, clear results
    if (!value.trim()) {
      onSearchResults?.([]);
      onSearchLoading?.(false);
      return;
    }
    
    // Set loading state
    onSearchLoading?.(true);
    
    // Debounce search
    const timeout = setTimeout(async () => {
      try {
        const params: any = { search: value.trim() };
        if (filterRole && filterRole !== 'all') {
          params.role = filterRole;
        }
        
        const results = await search(params);
        onSearchResults?.(results.data || []);
      } catch (error) {
        console.error('Search error:', error);
        onSearchResults?.([]);
      } finally {
        onSearchLoading?.(false);
      }
    }, 500); // 500ms debounce
    
    setSearchTimeout(timeout);
  }, [searchTerm, filterRole, search, searchTimeout, onSearchResults, onSearchLoading]);

  return (
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
          onChange={handleSearchChange}
          className={`px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-white ${
            searchLoading ? 'opacity-70' : ''
          }`}
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
};

export default AdminUsersTableHeader;
