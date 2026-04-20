import React from 'react';
import type { User as UserModel } from '@/types/models';
import type { ViewUserModalProps } from './types';
import { formatDateTime } from './utils';

export const ViewUserModal: React.FC<ViewUserModalProps> = ({
  isOpen,
  onClose,
  viewUser,
  viewLoading,
  userViewFields,
  resolvedTrainerName,
  trainers,
}) => {
  if (!isOpen) return null;

  const getTrainerName = () => {
    if (resolvedTrainerName) return resolvedTrainerName;
    if (viewUser?.trainerId && typeof viewUser.trainerId === 'object') {
      return (viewUser.trainerId as any).name || (viewUser.trainerId as any).fullName || (viewUser.trainerId as any).trainerName;
    }
    return 'غير محدد';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 dark:text-green-400';
      case 'inactive': return 'text-gray-600 dark:text-gray-400';
      case 'banned': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
      banned: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return colors[status as keyof typeof colors] || colors.inactive;
  };

  const getRoleText = (role: string) => {
    const roles = {
      admin: 'إدارة',
      manager: 'مدير',
      trainer: 'مدرب',
      member: 'عضو'
    };
    return roles[role as keyof typeof roles] || role;
  };

  const getStatusText = (status: string) => {
    const statuses = {
      active: 'نشط',
      inactive: 'غير نشط',
      banned: 'محظور'
    };
    return statuses[status as keyof typeof statuses] || status;
  };

  const getSubscriptionStatusText = (status: string) => {
    const statuses = {
      active: 'نشط',
      frozen: 'مجمد',
      expired: 'منتهي',
      cancelled: 'ملغي'
    };
    return statuses[status as keyof typeof statuses] || status;
  };

  const getMembershipLevelText = (level: string) => {
    const levels = {
      basic: 'عادي',
      silver: 'فضي',
      gold: 'ذهبي',
      platinum: 'بلاتينيوم'
    };
    return levels[level as keyof typeof levels] || level;
  };

  const getActivityLevelText = (level: string) => {
    const levels = {
      sedentary: 'قليل الحركة',
      light: 'نشاط خفيف',
      moderate: 'نشاط متوسط',
      active: 'نشاط عالٍ',
      very_active: 'نشاط شديد'
    };
    return levels[level as keyof typeof levels] || 'غير محدد';
  };

  if (viewLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6 z-10">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl p-6 z-10 overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-3 left-3 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">تفاصيل المستخدم</h4>
        
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
              {viewUser?.avatarUrl ? (
                <img src={viewUser.avatarUrl} alt={viewUser.name} className="w-full h-full object-cover" />
              ) : (
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
            <div>
              <h5 className="text-lg font-medium text-gray-900 dark:text-white">{viewUser?.name}</h5>
              <p className="text-sm text-gray-500 dark:text-gray-400">{viewUser?.email}</p>
              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${getStatusBadge(viewUser?.status || 'inactive')}`}>
                {getStatusText(viewUser?.status || 'inactive')}
              </span>
            </div>
          </div>

          {/* Basic Information */}
          <div>
            <h5 className="font-bold text-gray-700 dark:text-gray-300 mb-3">المعلومات الأساسية</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">الاسم</span>
                <span className="text-gray-900 dark:text-white">{viewUser?.name}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">البريد الإلكتروني</span>
                <span className="text-gray-900 dark:text-white">{viewUser?.email}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">رقم الهاتف</span>
                <span className="text-gray-900 dark:text-white">{viewUser?.phone}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">🏷️ الباركود</span>
                <span className="text-gray-900 dark:text-white">{viewUser?.barcode || '-'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">الدور</span>
                <span className="text-gray-900 dark:text-white">{getRoleText(viewUser?.role || '')}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">تاريخ الميلاد</span>
                <span className="text-gray-900 dark:text-white">{viewUser?.dob || '-'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">العنوان</span>
                <span className="text-gray-900 dark:text-white">{viewUser?.address || '-'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">الرصيد</span>
                <span className="text-gray-900 dark:text-white">{viewUser?.balance || 0}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">الحالة</span>
                <span className={`font-medium ${getStatusColor(viewUser?.status || 'inactive')}`}>
                  {getStatusText(viewUser?.status || 'inactive')}
                </span>
              </div>
              {(viewUser?.role === 'member' || viewUser?.role === 'trainer') && (
                <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">
                    {viewUser?.role === 'member' ? 'المدرب' : 'المشرف'}
                  </span>
                  <span className="text-gray-900 dark:text-white">{getTrainerName()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Subscription Information */}
          <div>
            <h5 className="font-bold text-gray-700 dark:text-gray-300 mb-3">معلومات الاشتراك</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">تاريخ بداية الاشتراك</span>
                <span className="text-gray-900 dark:text-white">{viewUser?.subscriptionStartDate || '-'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">تاريخ نهاية الاشتراك</span>
                <span className="text-gray-900 dark:text-white">{viewUser?.subscriptionEndDate || '-'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">أيام تجميد الاشتراك</span>
                <span className="text-gray-900 dark:text-white">{viewUser?.subscriptionFreezeDays || 0}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">أيام التجميد المستخدمة</span>
                <span className="text-gray-900 dark:text-white">{viewUser?.subscriptionFreezeUsed || 0}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">حالة الاشتراك</span>
                <span className="text-gray-900 dark:text-white">{getSubscriptionStatusText(viewUser?.subscriptionStatus || '')}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">تاريخ إرسال تذكير التجديد</span>
                <span className="text-gray-900 dark:text-white">{viewUser?.subscriptionRenewalReminderSent ? formatDateTime(viewUser.subscriptionRenewalReminderSent) : '-'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">تاريخ آخر دفع</span>
                <span className="text-gray-900 dark:text-white">{viewUser?.lastPaymentDate || '-'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">تاريخ استحقاق الدفع القادم</span>
                <span className="text-gray-900 dark:text-white">{viewUser?.nextPaymentDueDate || '-'}</span>
              </div>
            </div>
          </div>

          {/* Membership and Points */}
          <div>
            <h5 className="font-bold text-gray-700 dark:text-gray-300 mb-3">النقاط والعضوية</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">نقاط الولاء</span>
                <span className="text-gray-900 dark:text-white">{viewUser?.loyaltyPoints || 0}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">مستوى العضوية</span>
                <span className="text-gray-900 dark:text-white">{getMembershipLevelText(viewUser?.membershipLevel || '')}</span>
              </div>
            </div>
          </div>

          {/* Physical Data */}
          <div>
            <h5 className="font-bold text-gray-700 dark:text-gray-300 mb-3">البيانات الجسدية</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">الطول (سم)</span>
                <span className="text-gray-900 dark:text-white">{viewUser?.heightCm || '-'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">الوزن الابتدائي (كجم)</span>
                <span className="text-gray-900 dark:text-white">{viewUser?.baselineWeightKg || '-'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">الوزن المستهدف (كجم)</span>
                <span className="text-gray-900 dark:text-white">{viewUser?.targetWeightKg || '-'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">مستوى النشاط</span>
                <span className="text-gray-900 dark:text-white">{getActivityLevelText(viewUser?.activityLevel || '')}</span>
              </div>
            </div>
          </div>

          {/* Goals */}
          <div>
            <h5 className="font-bold text-gray-700 dark:text-gray-300 mb-3">الأهداف</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">فقدان الوزن</span>
                <span className="text-gray-900 dark:text-white">{viewUser?.goals?.weightLoss ? '✓' : '✗'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">بناء العضلات</span>
                <span className="text-gray-900 dark:text-white">{viewUser?.goals?.muscleGain ? '✓' : '✗'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">تحسين التحمل</span>
                <span className="text-gray-900 dark:text-white">{viewUser?.goals?.endurance ? '✓' : '✗'}</span>
              </div>
            </div>
          </div>

          {/* Health Notes */}
          {viewUser?.healthNotes && (
            <div>
              <h5 className="font-bold text-gray-700 dark:text-gray-300 mb-3">ملاحظات صحية</h5>
              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                <p className="text-gray-900 dark:text-white">{viewUser.healthNotes}</p>
              </div>
            </div>
          )}

          {/* Additional Information */}
          <div>
            <h5 className="font-bold text-gray-700 dark:text-gray-300 mb-3">معلومات إضافية</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {viewUser?.metadata?.emergencyContact && (
                <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">رقم الطوارئ</span>
                  <span className="text-gray-900 dark:text-white">{viewUser.metadata.emergencyContact}</span>
                </div>
              )}
              {viewUser?.metadata?.notes && (
                <div className="md:col-span-2">
                  <div className="flex flex-col py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400 mb-2">ملاحظات</span>
                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                      <p className="text-gray-900 dark:text-white">{viewUser.metadata.notes}</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">حالة الحذف</span>
                <span className="text-gray-900 dark:text-white">{viewUser?.isDeleted ? 'محذوف' : 'غير محذوف'}</span>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div>
            <h5 className="font-bold text-gray-700 dark:text-gray-300 mb-3">معلومات النظام</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400 mb-1">تاريخ الإنشاء</span>
                <span className="text-gray-900 dark:text-white">{formatDateTime(viewUser?.createdAt)}</span>
              </div>
              <div className="flex flex-col py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400 mb-1">تاريخ التعديل</span>
                <span className="text-gray-900 dark:text-white">{formatDateTime(viewUser?.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
