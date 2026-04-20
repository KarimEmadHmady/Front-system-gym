import React, { useState, useRef } from 'react';
import type { User as UserModel } from '@/types/models';
import type { CreateUserModalProps } from './types';
import { formatDateTime } from './utils';

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  isSubmitting,
  formError,
  newUser,
  handleCreateChange,
  handleCreateSubmit,
  trainers,
  loadingTrainers,
  avatarFile,
  setAvatarFile,
  isAvatarUploading,
  avatarPreviewUrl,
  fileInputRef,
}) => {
  const [uploadSuccess, setUploadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setUploadSuccess(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCreateSubmit(e);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6 z-10 overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-3 left-3 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">إضافة مستخدم جديد</h4>
        
        {formError && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">خطأ في إضافة المستخدم</p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{formError}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">الاسم *</label>
            <input
              name="name"
              value={newUser.name}
              onChange={handleCreateChange}
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="أدخل الاسم الكامل"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">البريد الإلكتروني *</label>
            <input
              name="email"
              type="email"
              value={newUser.email}
              onChange={handleCreateChange}
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="أدخل البريد الإلكتروني"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">رقم الهاتف *</label>
            <input
              name="phone"
              value={newUser.phone}
              onChange={handleCreateChange}
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="أدخل رقم الهاتف"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">كلمة المرور *</label>
            <input
              name="password"
              type="password"
              value={newUser.password}
              onChange={handleCreateChange}
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="أدخل كلمة المرور"
              required
              minLength={4}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">على الأقل 4 أحرف</p>
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">الدور *</label>
            <select
              name="role"
              value={newUser.role}
              onChange={handleCreateChange}
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
            >
              <option value="">اختر الدور</option>
              <option value="admin">إدارة</option>
              <option value="manager">مدير</option>
              <option value="trainer">مدرب</option>
              <option value="member">عضو</option>
            </select>
          </div>

          {(newUser.role === 'member' || newUser.role === 'trainer') && (
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                {newUser.role === 'member' ? 'Trainer' : 'Supervisor'}
              </label>
              <select
                name="trainerId"
                value={newUser.trainerId}
                onChange={handleCreateChange}
                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={loadingTrainers}
              >
                <option value="">
                  {loadingTrainers ? 'جارٍ التحميل...' : `اختر ${newUser.role === 'member' ? 'المدرب' : 'المشرف'}`}
                </option>
                {trainers.map((trainer) => (
                  <option key={trainer._id} value={trainer._id}>
                    {trainer.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'جارٍ الإضافة...' : 'إضافة المستخدم'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
