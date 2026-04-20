import React, { useState } from 'react';
import type { User as UserModel } from '@/types/models';
import type { EditUserModalProps } from './types';
import { formatDateTime } from './utils';
import { apiRequest } from '@/lib/api';

export const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  onClose,
  isSubmitting,
  editError,
  editUser,
  editForm,
  handleEditChange,
  handleEditSubmit,
  trainers,
  loadingTrainers,
  avatarFile,
  setAvatarFile,
  isAvatarUploading,
  setIsAvatarUploading,
  avatarPreviewUrl,
  setAvatarPreviewUrl,
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
    handleEditSubmit(e);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl p-6 z-10 overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-3 left-3 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">تعديل المستخدم</h4>
        
        {editError && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">خطأ في تحديث المستخدم</p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{editError}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* المعلومات الأساسية */}
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">الاسم</label>
            <input
              name="name"
              value={editForm.name}
              onChange={handleEditChange}
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">البريد الإلكتروني</label>
            <input
              name="email"
              type="email"
              value={editForm.email}
              onChange={handleEditChange}
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">🏷️ الباركود</label>
            <input
              name="barcode"
              value={editForm.barcode || ''}
              onChange={handleEditChange}
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">الدور</label>
            <select
              name="role"
              value={editForm.role}
              onChange={handleEditChange}
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="member">عضو</option>
              <option value="trainer">مدرب</option>
              <option value="manager">مدير</option>
              <option value="admin">إدارة</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">رقم الهاتف</label>
            <input
              name="phone"
              value={editForm.phone}
              onChange={handleEditChange}
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">تاريخ الميلاد</label>
            <input
              name="dob"
              type="date"
              value={editForm.dob}
              onClick={(e) => e.currentTarget.showPicker?.()}
              onChange={handleEditChange}
              className="cursor-pointer w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* صورة الملف الشخصي */}
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">صورة الملف الشخصي</label>
            <div
              className="cursor-pointer flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 hover:border-gray-400 transition"
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
              style={{ outline: 'none' }}
            >
              <svg className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1119 17H7z" />
              </svg>
              {avatarFile ? (
                <span className="text-sm text-green-700 dark:text-green-400">{avatarFile.name}</span>
              ) : (
                <span className="text-xs text-gray-600 dark:text-gray-300">اضغط هنا أو اسحب الصورة للرفع</span>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={e => {
                  const file = e.target.files?.[0] || null;
                  setAvatarFile(file);
                  if (file) {
                    const url = URL.createObjectURL(file);
                    setAvatarPreviewUrl(url);
                    setUploadSuccess(false);
                  }
                }}
                ref={fileInputRef}
                className="hidden"
              />
            </div>
            <div className="flex items-center gap-3 mt-2">
              <button
                type="button"
                disabled={!avatarFile || isAvatarUploading}
                onClick={async () => {
                  if (!editUser?._id || !avatarFile) return;
                  try {
                    setIsAvatarUploading(true);
                    
                    // Create FormData for file upload - use 'avatar' field name like backend expects
                    const formData = new FormData();
                    formData.append('avatar', avatarFile);
                    
                    // Add other user data to FormData (empty for now since we're only uploading avatar)
                    // Backend expects all fields in FormData when using PUT
                    formData.append('name', editForm.name || '');
                    formData.append('email', editForm.email || '');
                    formData.append('role', editForm.role || '');
                    formData.append('phone', editForm.phone || '');
                    formData.append('status', editForm.status || '');
                    
                    // Upload avatar using PUT method like backend expects
                    const response = await apiRequest(`/users/${editUser._id}`, {
                      method: 'PUT',
                      body: formData,
                    });
                    
                    const result = await response.json();
                    
                    if (!result) {
                      throw new Error('Upload failed');
                    }
                    
                    // Update the edit form with the new avatar URL
                    handleEditChange({
                      target: { name: 'avatarUrl', value: result.avatarUrl || result.avatar?.url || '' }
                    } as React.ChangeEvent<HTMLInputElement>);
                    
                    setUploadSuccess(true);
                    setAvatarFile(null);
                    setAvatarPreviewUrl(result.avatarUrl || result.avatar?.url || '');
                    
                    // Show success message
                    window.dispatchEvent(new CustomEvent('toast', {
                      detail: { type: 'success', message: 'Avatar uploaded successfully' }
                    }));
                  } catch (e) {
                    console.error('Avatar upload error:', e);
                    window.dispatchEvent(new CustomEvent('toast', {
                      detail: { type: 'error', message: 'Failed to upload avatar' }
                    }));
                  } finally {
                    setIsAvatarUploading(false);
                  }
                }}
                className="px-3 py-2 rounded-md bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white flex items-center gap-2"
              >
                {isAvatarUploading
                  ? 'جارٍ الرفع...'
                  : uploadSuccess
                  ? (<><span>تم الرفع</span><svg className="h-4 w-4 text-white inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></>)
                  : 'رفع الصورة'}
              </button>
              {avatarPreviewUrl && (
                <img
                  src={avatarPreviewUrl}
                  alt="preview"
                  className="w-10 h-10 rounded-full object-cover border border-gray-300 dark:border-gray-700"
                />
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">العنوان</label>
            <input
              name="address"
              value={editForm.address}
              onChange={handleEditChange}
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">الرصيد</label>
            <input
              name="balance"
              type="number"
              value={editForm.balance}
              onChange={handleEditChange}
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">الحالة</label>
            <select
              name="status"
              value={editForm.status}
              onChange={handleEditChange}
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
              <option value="banned">محظور</option>
            </select>
          </div>

          {/* معلومات الاشتراك */}
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">تاريخ بداية الاشتراك</label>
            <input
              name="subscriptionStartDate"
              type="date"
              value={editForm.subscriptionStartDate}
              onClick={(e) => e.currentTarget.showPicker?.()}
              onChange={handleEditChange}
              className="cursor-pointer w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">تاريخ نهاية الاشتراك</label>
            <input
              name="subscriptionEndDate"
              type="date"
              value={editForm.subscriptionEndDate}
              onClick={(e) => e.currentTarget.showPicker?.()}
              onChange={handleEditChange}
              className="cursor-pointer w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">أيام تجميد الاشتراك</label>
            <input
              name="subscriptionFreezeDays"
              type="number"
              value={editForm.subscriptionFreezeDays}
              onChange={handleEditChange}
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">أيام التجميد المستخدمة</label>
            <input
              name="subscriptionFreezeUsed"
              type="number"
              value={editForm.subscriptionFreezeUsed}
              onChange={handleEditChange}
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">حالة الاشتراك</label>
            <select
              name="subscriptionStatus"
              value={editForm.subscriptionStatus}
              onChange={handleEditChange}
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="active">نشط</option>
              <option value="frozen">مجمد</option>
              <option value="expired">منتهي</option>
              <option value="cancelled">ملغي</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">تاريخ إرسال تذكير التجديد</label>
            <input
              name="subscriptionRenewalReminderSent"
              type="datetime-local"
              value={editForm.subscriptionRenewalReminderSent || ''}
              onClick={(e) => e.currentTarget.showPicker?.()}
              onChange={handleEditChange}
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">تاريخ آخر دفع</label>
            <input
              name="lastPaymentDate"
              type="date"
              value={editForm.lastPaymentDate}
              onClick={(e) => e.currentTarget.showPicker?.()}
              onChange={handleEditChange}
              className="cursor-pointer w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">تاريخ استحقاق الدفع القادم</label>
            <input
              name="nextPaymentDueDate"
              type="date"
              value={editForm.nextPaymentDueDate}
              onClick={(e) => e.currentTarget.showPicker?.()}
              onChange={handleEditChange}
              className="cursor-pointer w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* النقاط والعضوية */}
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">نقاط الولاء</label>
            <input
              name="loyaltyPoints"
              type="number"
              value={editForm.loyaltyPoints}
              onChange={handleEditChange}
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">مستوى العضوية</label>
            <select
              name="membershipLevel"
              value={editForm.membershipLevel}
              onChange={handleEditChange}
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="basic">عادي</option>
              <option value="silver">فضي</option>
              <option value="gold">ذهبي</option>
              <option value="platinum">بلاتينيوم</option>
            </select>
          </div>

          {/* البيانات الجسدية */}
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">الطول (سم)</label>
            <input
              name="heightCm"
              value={editForm.heightCm || ''}
              onChange={handleEditChange}
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="الطول بالسنتيمتر"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">الوزن الابتدائي (كجم)</label>
            <input
              name="baselineWeightKg"
              value={editForm.baselineWeightKg || ''}
              onChange={handleEditChange}
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="الوزن الابتدائي"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">الوزن المستهدف (كجم)</label>
            <input
              name="targetWeightKg"
              value={editForm.targetWeightKg || ''}
              onChange={handleEditChange}
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="الوزن المستهدف"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">مستوى النشاط</label>
            <select
              name="activityLevel"
              value={editForm.activityLevel || ''}
              onChange={handleEditChange}
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">غير محدد</option>
              <option value="sedentary">قليل الحركة</option>
              <option value="light">نشاط خفيف</option>
              <option value="moderate">نشاط متوسط</option>
              <option value="active">نشاط عالٍ</option>
              <option value="very_active">نشاط شديد</option>
            </select>
          </div>

          {/* ملاحظات صحية */}
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">ملاحظات صحية</label>
            <textarea
              name="healthNotes"
              value={editForm.healthNotes || ''}
              onChange={handleEditChange}
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="أي ملاحظات صحية"
              rows={3}
            />
          </div>

          {/* حالة الحذف */}
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">حالة الحذف</label>
            <select
              name="isDeleted"
              value={editForm.isDeleted}
              onChange={handleEditChange}
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="false">غير محذوف</option>
              <option value="true">محذوف</option>
            </select>
          </div>

          {/* الأهداف */}
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">الأهداف</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="goals.weightLoss"
                  checked={editForm.goals?.weightLoss || false}
                  onChange={handleEditChange}
                  className="mr-2"
                />
                فقدان الوزن
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="goals.muscleGain"
                  checked={editForm.goals?.muscleGain || false}
                  onChange={handleEditChange}
                  className="mr-2"
                />
                بناء العضلات
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="goals.endurance"
                  checked={editForm.goals?.endurance || false}
                  onChange={handleEditChange}
                  className="mr-2"
                />
                تحسين التحمل
              </label>
            </div>
          </div>

          {/* ملاحظات */}
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">ملاحظات</label>
            <textarea
              name="metadata.notes"
              value={editForm.metadata?.notes || ''}
              onChange={handleEditChange}
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              rows={2}
            />
          </div>

          {/* تعيين المدرب */}
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">معرف المدرب</label>
            <select
              name="trainerId"
              value={editForm.trainerId || ''}
              onChange={handleEditChange}
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">بدون مدرب</option>
              {loadingTrainers ? (
                <option value="" disabled>جارٍ التحميل...</option>
              ) : (
                trainers.map((trainer) => (
                  <option key={trainer._id} value={trainer._id}>
                    {trainer.name} {trainer.phone ? `(${trainer.phone})` : ''}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* الطوابع الزمنية (للقراءة فقط) */}
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">تاريخ الإنشاء</label>
            <input
              name="createdAt"
              value={formatDateTime(editForm.createdAt)}
              readOnly
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">تاريخ التعديل</label>
            <input
              name="updatedAt"
              value={formatDateTime(editForm.updatedAt)}
              readOnly
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 md:col-span-2">
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
              {isSubmitting ? 'جارٍ التحديث...' : 'تحديث المستخدم'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
