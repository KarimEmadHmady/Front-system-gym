'use client';

import React, { useEffect, useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import type { User as UserModel } from '@/types/models';
import { UserService } from '@/services/userService';
import { User, Mail, Phone, Info, Edit, Save, X } from 'lucide-react';
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
    {label && <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</label>}
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

const TrainerProfile = () => {
  const { user: authUser } = usePermissions();
  const [user, setUser] = useState<UserModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [uploadedAvatar, setUploadedAvatar] = useState<File | undefined>(undefined);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    avatarUrl: '',
  });
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState(''); // To verify old password
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
          bio: (me as any).healthNotes || '',
          avatarUrl: me.avatarUrl || '',
        });
      } catch {
        setError('تعذر جلب بيانات الحساب');
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      
      // Add form data
      formData.append('name', form.name);
      if (form.phone) formData.append('phone', form.phone);
      if (form.bio) formData.append('healthNotes', form.bio);
      
      // Add uploaded avatar if exists
      if (uploadedAvatar) {
        formData.append('avatar', uploadedAvatar);
      }

      const token = getAuthToken();

      let response: Response | undefined; // Initialize response as undefined or Response

      // Handle password change if fields are filled
      if (currentPassword || newPassword || confirmNewPassword) {
        if (!currentPassword) {
          throw new Error('الرجاء إدخال كلمة المرور الحالية لتغيير كلمة المرور.');
        }
        if (!newPassword) {
          throw new Error('الرجاء إدخال كلمة المرور الجديدة.');
        }
        if (newPassword.length < 8) {
          throw new Error('يجب أن تكون كلمة المرور الجديدة 8 أحرف على الأقل.');
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
            setIsEdit(false);
            return;
        }
      }

      // If other form data exists or avatar was uploaded, proceed with the main user update
      if (!formData.entries().next().done || uploadedAvatar) {
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users/${userId}`, {
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
      }

      if (response) { // Check if response is defined before proceeding
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
        setIsEdit(false);
        window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'success', message: 'تم حفظ التغييرات' } }));
      }
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setIsSubmitting(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    }
  };

  const handleCancel = () => {
    setIsEdit(false);
    setUploadedAvatar(undefined); // Clear uploaded file
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: (user as any).healthNotes || '',
        avatarUrl: user.avatarUrl || '',
      });
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 max-w-xl mx-auto">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <User className="w-6 h-6 text-gray-500" /> الملف الشخصي
      </h3>
      {loading ? (
        <div className="text-gray-500 dark:text-gray-400">جاري التحميل...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* عرض البيانات */}
          {!isEdit ? (
            <>
              {/* Avatar Display */}
              <div className="flex flex-col items-center gap-4 p-6 rounded-lg bg-gradient-to-br from-gray-50 to-gray-50 dark:from-gray-900/20 dark:to-gray-900/20">
                {user?.avatarUrl ? (
                  <img 
                    src={user.avatarUrl} 
                    alt={user.name} 
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg" 
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg">
                    {user?.name?.charAt(0) || '?'}
                  </div>
                )}
                <div className="text-center">
                  <div className="font-semibold text-lg text-gray-900 dark:text-white">{user?.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">مدرب</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                <Mail className="w-5 h-5 text-green-500" />
                <span className="text-gray-700 dark:text-gray-200">{user?.email}</span>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-900/20">
                <Phone className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700 dark:text-gray-200">{user?.phone || <span className="text-gray-400">غير محدد</span>}</span>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-900/20">
                <Info className="w-5 h-5 text-gray-500 mt-1" />
                <span className="text-gray-700 dark:text-gray-200 whitespace-pre-line">{(user as any)?.healthNotes || <span className="text-gray-400">لا يوجد نبذة</span>}</span>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setIsEdit(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm font-medium transition-colors"
                >
                  <Edit className="w-4 h-4" /> تعديل
                </button>
              </div>
            </>
          ) : (
            <>
              <div>
                <FileInput
                  label="صورة الملف الشخصي"
                  currentFile={uploadedAvatar}
                  currentUrl={form.avatarUrl}
                  onChange={(file) => setUploadedAvatar(file ?? undefined)}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1"><User className="w-4 h-4 text-gray-500" /> الاسم</label>
                <input name="name" value={form.name} onChange={handleChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-400" placeholder="اسم المدرب" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1"><Mail className="w-4 h-4 text-green-500" /> البريد</label>
                <input name="email" value={form.email} readOnly className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="email@example.com" />
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
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1"><Phone className="w-4 h-4 text-gray-500" /> الهاتف</label>
                <input name="phone" value={form.phone} onChange={handleChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-400" placeholder="+20.." />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1"><Info className="w-4 h-4 text-gray-500" /> النبذة</label>
                <textarea name="bio" value={form.bio} onChange={handleChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-400" placeholder="نبذة قصيرة" rows={3} />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md text-sm font-medium transition-colors"
                  disabled={isSubmitting}
                >
                  <X className="w-4 h-4" /> إلغاء
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors"
                  disabled={isSubmitting}
                >
                  <Save className="w-4 h-4" /> {isSubmitting ? 'جارٍ الحفظ...' : 'حفظ'}
                </button>
              </div>
            </>
          )}
        </form>
      )}
    </div>
  );
};

export default TrainerProfile;


