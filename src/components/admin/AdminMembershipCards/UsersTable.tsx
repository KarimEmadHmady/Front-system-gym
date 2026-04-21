'use client';

import React from 'react';
import { User, FileText } from 'lucide-react';
import { Input, Checkbox, Badge } from './ui-primitives';
import { Select, SelectItem } from './ui-primitives';
import { Pagination } from './Pagination';
import type { User as UserType } from './types';

interface Props {
  users: UserType[];
  selectedUsers: string[];
  searchTerm: string;
  roleFilter: string;
  isGenerating: boolean;
  currentPage: number;
  pageSize: number;
  onSearchChange: (value: string) => void;
  onRoleFilterChange: (value: string) => void;
  onSelectUser: (userId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onPageChange: (page: number) => void;
  onGenerateSingle: (userId: string) => void;
  onGenerateDouble: (userId: string) => void;
}

const roleLabel = (role: string) => {
  const map: Record<string, string> = {
    admin: 'إدارة',
    manager: 'مدير',
    trainer: 'مدرب',
    member: 'عضو',
  };
  return map[role] ?? role;
};

export const UsersTable: React.FC<Props> = ({
  users,
  selectedUsers,
  searchTerm,
  roleFilter,
  isGenerating,
  currentPage,
  pageSize,
  onSearchChange,
  onRoleFilterChange,
  onSelectUser,
  onSelectAll,
  onPageChange,
  onGenerateSingle,
  onGenerateDouble,
}) => {
  const filtered = users.filter((user) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      term === '' ||
      [user.name, user.email, user.barcode, user.phone,
        user.userNumber != null ? String(user.userNumber) : '']
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term));
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="dark:text-gray-100 text-gray-900 space-y-4">
      {/* Filters */}
      <div className="flex space-x-4 rtl:space-x-reverse">
        <Input
          placeholder="بحث عن مستخدم..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-sm dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700 bg-white text-gray-900 border-gray-300"
        />
        <div className="w-48">
          <Select value={roleFilter} onValueChange={onRoleFilterChange}>
            <SelectItem value="all">كل الأدوار</SelectItem>
            <SelectItem value="member">الأعضاء</SelectItem>
            <SelectItem value="trainer">المدربين</SelectItem>
            <SelectItem value="manager">المديرين</SelectItem>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-100 w-12">
                <Checkbox
                  checked={selectedUsers.length === filtered.length && filtered.length > 0}
                  onCheckedChange={onSelectAll}
                />
              </th>
              {['الاسم', 'البريد الإلكتروني', 'الباركود', 'الدور', 'الحالة', 'إجراءات'].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-100">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
            {paginated.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-6 py-4">
                  <Checkbox
                    checked={selectedUsers.includes(user._id)}
                    onCheckedChange={(checked) => onSelectUser(user._id, checked as boolean)}
                  />
                </td>
                <td className="px-6 py-4 text-sm font-medium dark:text-gray-100 text-gray-900">
                  <div>{user.name}</div>
                  {user.userNumber && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      رقم المستخدم: {user.userNumber}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm dark:text-gray-100 text-gray-900">{user.email}</td>
                <td className="px-6 py-4 text-sm">
                  {user.barcode ? (
                    <Badge variant="outline" className="font-mono dark:bg-gray-700 dark:text-gray-100 dark:border-gray-500 bg-gray-100 text-gray-900 border-gray-300">
                      {user.barcode}
                    </Badge>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500">لا يوجد باركود</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm">
                  <Badge variant="secondary" className="dark:bg-gray-700 dark:text-gray-100 bg-gray-200 text-gray-900">
                    {roleLabel(user.role)}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-sm">
                  <Badge
                    variant={user.status === 'active' ? 'default' : 'destructive'}
                    className={
                      user.status === 'active'
                        ? 'dark:bg-green-700 dark:text-white bg-green-100 text-green-800'
                        : 'dark:bg-red-700 dark:text-white bg-red-100 text-red-800'
                    }
                  >
                    {user.status === 'active' ? 'نشط' : user.status === 'inactive' ? 'غير نشط' : 'محظور'}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onGenerateSingle(user._id)}
                      disabled={isGenerating || !user.barcode}
                      title="توليد الكارت (الظهر فقط)"
                      className="px-2 py-1 text-sm dark:bg-gray-700 dark:hover:bg-gray-800 dark:text-white bg-gray-600 text-white hover:bg-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <User className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onGenerateDouble(user._id)}
                      disabled={isGenerating || !user.barcode}
                      title="توليد الكارت المزدوج (وجه + ظهر)"
                      className="px-2 py-1 text-sm dark:bg-green-700 dark:hover:bg-green-800 dark:text-white bg-green-600 text-white hover:bg-green-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filtered.length}
        pageSize={pageSize}
        visibleCount={paginated.length}
        onPageChange={onPageChange}
      />
    </div>
  );
};