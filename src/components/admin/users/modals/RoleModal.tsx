import React from 'react';
import type { User as UserModel } from '@/types/models';
import type { RoleModalProps } from './types';

export const RoleModal: React.FC<RoleModalProps> = ({
  isOpen,
  onClose,
  roleUser,
  roleForm,
  setRoleForm,
  roleError,
  isRoleSubmitting,
  handleRoleSubmit,
}) => {
  const getRoleText = (role: string) => {
    const roles = {
      admin: 'إدارة',
      manager: 'مدير',
      trainer: 'مدرب',
      member: 'عضو'
    };
    return roles[role as keyof typeof roles] || role;
  };
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleRoleSubmit(e);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6 z-10">
        <button
          onClick={onClose}
          className="absolute top-3 left-3 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">تغيير دور المستخدم</h4>
        
        {roleError && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">خطأ في تغيير الدور</p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{roleError}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            المستخدم: <span className="font-medium text-gray-900 dark:text-white">{roleUser?.name}</span>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            الدور الحالي: <span className="font-medium text-gray-900 dark:text-white">{getRoleText(roleUser?.role || '')}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">الدور الجديد *</label>
            <select
              value={roleForm}
              onChange={(e) => setRoleForm(e.target.value)}
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
            >
              <option value="">اختر الدور الجديد</option>
              <option value="admin">إدارة</option>
              <option value="manager">مدير</option>
              <option value="trainer">مدرب</option>
              <option value="member">عضو</option>
            </select>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">تحذير</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  تغيير دور المستخدم سيؤثر على صلاحياته ووصوله إلى ميزات النظام.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isRoleSubmitting}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isRoleSubmitting}
              className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              {isRoleSubmitting ? 'جاري التغيير...' : 'تغيير الدور'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
