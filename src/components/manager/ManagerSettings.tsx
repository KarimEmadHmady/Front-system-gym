"use client";

import React, { useEffect, useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import type { User as UserModel } from '@/types/models';
import { UserService } from '@/services/userService';
import SubscriptionAlertSettings from '@/components/admin/SubscriptionAlert/SubscriptionAlertSettings';
import { getAuthToken } from '@/lib/api';

// FileInput component for image uploads
const FileInput = ({ 
  onChange, 
  accept = "image/*", 
  className = '', 
  label = '',
  currentFile,
  currentUrl
}: {
  onChange: (file: File | null) => void;
  accept?: string;
  className?: string;
  label?: string;
  currentFile?: File;
  currentUrl?: string;
}) => (
  <div className={`space-y-2 ${className}`}>
    {label && <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">{label}</label>}
    <div className="space-y-2">
      <input
        type="file"
        accept={accept}
        onChange={(e) => onChange(e.target.files?.[0] || null)}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 dark:file:bg-gray-700 dark:file:text-gray-300"
      />
      {(currentFile || currentUrl) && (
        <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
              {currentFile ? `تم اختيار: ${currentFile.name}` : ''}
            </span>
            {currentUrl && (
              <img 
                src={currentUrl} 
                alt="Preview" 
                className="w-8 h-8 object-cover rounded border border-gray-300"
              />
            )}
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-red-500 hover:text-red-700 text-sm font-medium"
          >
            إزالة
          </button>
        </div>
      )}
    </div>
  </div>
);

const ManagerSettings: React.FC = () => {
  const { user: authUser } = usePermissions();
  const [user, setUser] = useState<UserModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedAvatar, setUploadedAvatar] = useState<File | undefined>(undefined);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState(''); // To verify old password
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    avatarUrl: '',
    address: '',
  });
  const userService = new UserService();
  const userId = (authUser as any)?._id || (authUser as any)?.id || '';

  useEffect(() => {
    const fetchMe = async () => {
      if (!userId) return;
      setLoading(true);
      setError(null);
      try {
        const me = await userService.getUser(userId);
        setUser(me);
        setForm({
          name: me.name || '',
          email: me.email || '',
          phone: me.phone || '',
          dob: me.dob ? new Date(me.dob).toISOString().substring(0, 10) : '',
          avatarUrl: me.avatarUrl || '',
          address: me.address || '',
        });
      } catch {
        setError('تعذر جلب بيانات الحساب');
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, [userId]);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      
      // Add form data
      formData.append('name', form.name);
      if (form.phone) formData.append('phone', form.phone);
      if (form.address) formData.append('address', form.address);
      if (form.dob) formData.append('dob', new Date(form.dob).toISOString());
      
      // Add uploaded avatar if exists
      if (uploadedAvatar) {
        formData.append('avatar', uploadedAvatar);
      }

      const token = getAuthToken();

      
      // Handle password change if fields are filled
      if (currentPassword || newPassword || confirmNewPassword) {
        if (!currentPassword) {
          throw new Error('الرجاء إدخال كلمة المرور الحالية لتغيير كلمة المرور.');
        }
        if (!newPassword) {
          throw new Error('الرجاء إدخال كلمة المرور الجديدة.');
        }
        if (newPassword.length < 5) {
          throw new Error('يجب أن تكون كلمة المرور الجديدة 5 أحرف على الأقل.');
        }
        if (newPassword !== confirmNewPassword) {
          throw new Error('كلمة المرور الجديدة وتأكيدها غير متطابقين.');
        }

        // Create a separate payload for password change
        const passwordChangePayload = {
          currentPassword,
          newPassword,
        };
        
        // Send password change request using the dedicated service method
        await userService.changePassword(userId, passwordChangePayload);

        // Clear password fields after successful change
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');

        // If only password was changed, and no other form data, we're done here.
        if (formData.entries().next().done && !uploadedAvatar) {
            window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'success', message: 'تم تحديث كلمة المرور بنجاح' } }));
            setIsEditOpen(false);
            return;
        }
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users/${userId}`, {
        method: 'PUT',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'فشل تحديث البيانات');
      }

      const result = await response.json();
      const updated = result.user || result; // Handle both response formats
      
      // Update the user state with the new data
      setUser(updated);
      
      // Update the form state with the new avatar URL
      setForm(prev => ({
        ...prev,
        avatarUrl: updated.avatarUrl || prev.avatarUrl
      }));
      
      setUploadedAvatar(undefined); // Clear uploaded file after successful save
      setIsEditOpen(false);
      window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'success', message: 'تم تحديث بياناتك بنجاح' } }));
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setIsSubmitting(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-gray-600 dark:bg-gray-900/20 dark:text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M11.983 1.943a1 1 0 0 1 1.034 0l2.143 1.236a1 1 0 0 0 .9 0l2.143-1.236a1 1 0 0 1 1.5.866v2.472a1 1 0 0 0 .5.866l2.143 1.236a1 1 0 0 1 0 1.732l-2.143 1.236a1 1 0 0 0-.5.866v2.472a1 1 0 0 1-1.5.866l-2.143-1.236a1 1 0 0 0-.9 0l-2.143 1.236a1 1 0 0 1-1.5-.866V11.12a1 1 0 0 0-.5-.866L9.34 9.018a1 1 0 0 1 0-1.732l2.143-1.236a1 1 0 0 0 .5-.866V2.809a1 1 0 0 1 0-.866Z" clipRule="evenodd" />
            </svg>
          </span>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">إعدادات المدير</h3>
        </div>
        {loading ? (
          <div className="text-gray-500 dark:text-gray-400">جاري التحميل...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : user ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-16 h-16 rounded-full object-cover border" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 flex items-center justify-center text-white text-xl font-bold">
                  {user.name?.charAt(0) || '?'}
                </div>
              )}
              <div className="min-w-0">
                <div className="text-gray-900 dark:text-white font-medium truncate">{user.name}</div>
                <div className="mt-1 inline-flex items-center gap-2 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                    <path d="M1.5 8.67v6.63c0 .62.5 1.12 1.12 1.12h18.76c.62 0 1.12-.5 1.12-1.12V8.67L12 14.25 1.5 8.67z"/>
                    <path d="M21.38 6.5H2.62c-.33 0-.63.14-.84.36L12 12.75l10.22-5.89c-.21-.22-.51-.36-.84-.36z"/>
                  </svg>
                  <span className="truncate max-w-[180px]">{user.email}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center justify-between rounded-md border border-gray-200 dark:border-gray-700 px-3 py-2">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">📞</span>
                  <span>رقم الهاتف</span>
                </div>
                <span className="text-gray-900 dark:text-white">{user.phone || '-'}</span>
              </div>
              <div className="flex items-center justify-between rounded-md border border-gray-200 dark:border-gray-700 px-3 py-2">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">🎂</span>
                  <span>تاريخ الميلاد</span>
                </div>
                <span className="text-gray-900 dark:text-white">{user.dob ? new Date(user.dob).toLocaleDateString('ar-EG') : '-'}</span>
              </div>
              <div className="flex items-center justify-between rounded-md border border-gray-200 dark:border-gray-700 px-3 py-2 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">📍</span>
                  <span>العنوان</span>
                </div>
                <span className="text-gray-900 dark:text-white truncate max-w-[180px] sm:max-w-[240px] lg:max-w-[180px] text-right">{user.address || '-'}</span>
              </div>
            </div>
            <div className="pt-2">
              <button onClick={() => setIsEditOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M5 19h14v2H5z"/>
                  <path d="M17.7 3.3a1 1 0 0 1 1.4 0l1.6 1.6a1 1 0 0 1 0 1.4L10 16.7 7 17l.3-3 10.4-10.4z"/>
                </svg>
                تعديل
              </button>
            </div>
          </div>
        ) : (
          <div className="text-gray-500 dark:text-gray-400">لا توجد بيانات</div>
        )}
      </div>

      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsEditOpen(false)}></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full h-[95%] overflow-y-auto  max-w-md p-6 z-10">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">تعديل بياناتي</h4>
            {error && <div className="mb-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded px-3 py-2">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">الاسم</label>
                <input name="name" value={form.name} onChange={handleChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">رقم الهاتف</label>
                <input name="phone" value={form.phone} onChange={handleChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
              </div>
                {/* Current Password Field */}
                <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">كلمة المرور الحالية</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-400"
                  placeholder="ادخل كلمة المرور الحالية"
                />
              </div>
              {/* New Password Field */}
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">كلمة المرور الجديدة</label>
                <input
                  type="password"
                  name="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-400"
                  placeholder="ادخل كلمة المرور الجديدة"
                />
              </div>
              {/* Confirm New Password Field */}
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">تأكيد كلمة المرور الجديدة</label>
                <input
                  type="password"
                  name="confirmNewPassword"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-400"
                  placeholder="تأكيد كلمة المرور الجديدة"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">تاريخ الميلاد</label>
                <input type="date" name="dob" onClick={(e) => e.currentTarget.showPicker?.()} value={form.dob} onChange={handleChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
              </div>
              <div>
                <FileInput
                  label="صورة الملف الشخصي"
                  currentFile={uploadedAvatar}
                  currentUrl={form.avatarUrl}
                  onChange={file => setUploadedAvatar(file ?? undefined)}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">العنوان</label>
                <input name="address" value={form.address} onChange={handleChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200">إلغاء</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white">{isSubmitting ? 'جارٍ الحفظ...' : 'حفظ'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* إعدادات تحذيرات الاشتراكات */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <SubscriptionAlertSettings />
      </div>
    </div>
  );
};

export default ManagerSettings;
