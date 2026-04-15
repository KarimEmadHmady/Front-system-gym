"use client";

import React, { useEffect, useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import type { User as UserModel } from '@/types/models';
import { UserService } from '@/services/userService';
import { User as UserIcon, Mail, Phone, Calendar, MapPin, Ruler, Weight, FileText, Crown, Star, Edit3, X, Save } from 'lucide-react';
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

const MemberSettings: React.FC = () => {
  const { user: authUser } = usePermissions();
  const [user, setUser] = useState<UserModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedAvatar, setUploadedAvatar] = useState<File | undefined>(undefined);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    avatarUrl: '',
    address: '',
    heightCm: '',
    baselineWeightKg: '',
    healthNotes: '',
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
          dob: me.dob ? new Date(me.dob).toISOString().substring(0, 10) : '',
          avatarUrl: me.avatarUrl || '',
          address: me.address || '',
          heightCm: (me as any).heightCm?.toString?.() || (me as any).metadata?.heightCm?.toString?.() || '',
          baselineWeightKg: (me as any).baselineWeightKg?.toString?.() || '',
          healthNotes: (me as any).healthNotes || '',
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

  const handleCancel = () => {
    setIsEditOpen(false);
    setUploadedAvatar(undefined);
    setError(null);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
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
      if (form.address) formData.append('address', form.address);
      if (form.dob) formData.append('dob', new Date(form.dob).toISOString());
      if (form.heightCm) formData.append('heightCm', form.heightCm);
      if (form.baselineWeightKg) formData.append('baselineWeightKg', form.baselineWeightKg);
      if (form.healthNotes) formData.append('healthNotes', form.healthNotes);
      
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
            setIsEditOpen(false);
            return;
        }
      }

      // If other form data exists or avatar was uploaded, proceed with the main user update
      if (!formData.entries().next().done || uploadedAvatar) {
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users/${userId}`, {
          method: 'PUT',
          headers: {
            // For FormData, do not set 'Content-Type', browser handles it.
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
        setIsEditOpen(false);
        window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'success', message: 'تم تحديث بياناتك بنجاح' } }));
      } else {
          // This block is reached if no profile changes were submitted (formData empty, no avatar uploaded)
          // and either no password change was attempted, or password change was successful and returned early.
          // We should ensure a toast is shown if no actual data was submitted.
          window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'info', message: 'لم يتم إجراء أي تغييرات للحفظ.' } }));
          setIsEditOpen(false);
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

  const badgeForLevel = (level?: string) => {
    const map: Record<string, string> = {
      basic: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      silver: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
      gold: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      platinum: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };
    return map[(level || 'basic').toLowerCase()] || map.basic;
  };

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-gray-600" /> إعداداتي
          </h3>
          {!loading && user && (
            <button onClick={() => setIsEditOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm">
              <Edit3 className="w-4 h-4" /> تعديل
            </button>
          )}
        </div>
        {loading ? (
          <div className="text-gray-500 dark:text-gray-400">جاري التحميل...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : user ? (
          <div className="space-y-6">
            {/* Header card */}
            <div className="flex items-center gap-4">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-16 h-16 rounded-full object-cover border" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 flex items-center justify-center text-white text-xl font-bold">
                  {user.name?.charAt(0) || '?'}
                </div>
              )}
              <div>
                <div className="text-gray-900 dark:text-white font-medium flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-gray-500" /> {user.name}
                </div>
                <div className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-2">
                  <Mail className="w-4 h-4" /> {user.email}
                </div>
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400"><Phone className="w-4 h-4 text-emerald-600" /> رقم الهاتف</span>
                <span className="text-gray-900 dark:text-white">{user.phone || '-'}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400"><Calendar className="w-4 h-4 text-gray-600" /> تاريخ الميلاد</span>
                <span className="text-gray-900 dark:text-white">{user.dob ? new Date(user.dob).toLocaleDateString('ar-EG') : '-'}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400"><MapPin className="w-4 h-4 text-pink-600" /> العنوان</span>
                <span className="text-gray-900 dark:text-white">{user.address || '-'}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400"><Ruler className="w-4 h-4 text-orange-600" /> الطول (سم)</span>
                <span className="text-gray-900 dark:text-white">{(user as any).heightCm ?? (user as any).metadata?.heightCm ?? '-'}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400"><Weight className="w-4 h-4 text-rose-600" /> الوزن الابتدائي (كجم)</span>
                <span className="text-gray-900 dark:text-white">{(user as any).baselineWeightKg ?? '-'}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 md:col-span-2">
                <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400"><FileText className="w-4 h-4 text-gray-600" /> ملاحظات صحية</span>
                <span className="text-gray-900 dark:text-white">{(user as any).healthNotes || '-'}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400"><Crown className="w-4 h-4 text-gray-500" /> مستوى العضوية</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badgeForLevel(user.membershipLevel)}`}>{user.membershipLevel}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400"><Star className="w-4 h-4 text-amber-500" /> نقاط الولاء</span>
                <span className="text-gray-900 dark:text-white">{user.loyaltyPoints}</span>
              </div>
            </div>


          </div>
        ) : (
          <div className="text-gray-500 dark:text-gray-400">لا توجد بيانات</div>
        )}
      </div>

      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsEditOpen(false)}></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6 z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-gray-600" /> تعديل بياناتي
              </h4>
              <button onClick={() => setIsEditOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            {error && <div className="mb-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded px-3 py-2">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2"><UserIcon className="w-4 h-4 text-gray-600" /> الاسم</label>
                <input name="name" value={form.name} onChange={handleChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-400" />
              </div>
              {/* Current Password Field */} 
              <div> 
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">كلمة المرور الحالية</label> 
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
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">كلمة المرور الجديدة</label> 
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
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">تأكيد كلمة المرور الجديدة</label> 
                <input 
                  type="password" 
                  name="confirmNewPassword" 
                  value={confirmNewPassword} 
                  onChange={(e) => setConfirmNewPassword(e.target.value)} 
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-400" 
                  placeholder="تأكيد كلمة المرور الجديدة" 
                /> 
              </div>
              <FileInput
                label="صورة الملف الشخصي"
                onChange={(file) => setUploadedAvatar(file ?? undefined)}
                currentFile={uploadedAvatar}
                currentUrl={form.avatarUrl}
                className="w-full"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                يمكنك رفع صورة جديدة أو تركها فارغة للاحتفاظ بالصورة الحالية
              </p>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2"><Phone className="w-4 h-4 text-emerald-600" /> رقم الهاتف</label>
                <input name="phone" value={form.phone} onChange={handleChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-400" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-600" /> تاريخ الميلاد</label>
                <input 
                  type="date" 
                  name="dob" 
                  value={form.dob} 
                  onChange={handleChange} 
                  onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-400" 
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2"><MapPin className="w-4 h-4 text-pink-600" /> العنوان</label>
                <input name="address" value={form.address} onChange={handleChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-400" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2"><Ruler className="w-4 h-4 text-orange-600" /> الطول (سم)</label>
                  <input name="heightCm" value={form.heightCm} onChange={handleChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-400" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2"><Weight className="w-4 h-4 text-rose-600" /> الوزن الابتدائي (كجم)</label>
                  <input name="baselineWeightKg" value={form.baselineWeightKg} onChange={handleChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2"><FileText className="w-4 h-4 text-gray-600" /> ملاحظات صحية</label>
                <textarea name="healthNotes" value={form.healthNotes} onChange={handleChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-400" />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={handleCancel} className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200">
                  <X className="w-4 h-4" /> إلغاء
                </button>
                <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white">
                  <Save className="w-4 h-4" /> {isSubmitting ? 'جارٍ الحفظ...' : 'حفظ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberSettings;
