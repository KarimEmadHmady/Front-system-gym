'use client';

import React from 'react';
import type { User as UserModel } from '@/types/models';

interface UserSubscriptionAlertProps {
  user: UserModel;
  size?: 'sm' | 'md' | 'lg';
  dismissible?: boolean;
  onDismiss?: () => void;
}

const UserSubscriptionAlert: React.FC<UserSubscriptionAlertProps> = ({ 
  user, 
  size = 'sm',
  dismissible = false,
  onDismiss
}) => {
  const now = new Date();
  const subscriptionEndDate = user.subscriptionEndDate ? new Date(user.subscriptionEndDate) : null;
  const renewalReminderDate = user.subscriptionRenewalReminderSent ? new Date(user.subscriptionRenewalReminderSent) : null;
  
  if (!subscriptionEndDate) return null;
  
  const daysUntilExpiry = Math.ceil((subscriptionEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const daysUntilReminder = renewalReminderDate ? 
    Math.ceil((renewalReminderDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
  
  // تحديد مستوى التحذير
  let alertLevel: 'none' | 'warning' | 'critical' = 'none';
  let alertMessage = '';
  
  if (daysUntilExpiry <= 0) {
    alertLevel = 'critical';
    alertMessage = 'انتهى الاشتراك';
  } else if (daysUntilExpiry <= 3) {
    alertLevel = 'critical';
    alertMessage = `ينتهي خلال ${daysUntilExpiry} أيام`;
  } else if (daysUntilExpiry <= 7) {
    alertLevel = 'warning';
    alertMessage = `ينتهي خلال ${daysUntilExpiry} أيام`;
  }
  
  // فحص التذكير
  if (renewalReminderDate && daysUntilReminder !== null && daysUntilReminder <= 1) {
    if (alertLevel === 'none') {
      alertLevel = 'warning';
      alertMessage = `تذكير خلال ${daysUntilReminder} أيام`;
    } else {
      alertMessage += ` + تذكير خلال ${daysUntilReminder} أيام`;
    }
  }
  
  if (alertLevel === 'none') return null;
  
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };
  
  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };
  
  return (
    <div className="flex items-center space-x-1" title={alertMessage}>
      {/* النقطة المتحركة */}
      <div className="relative">
        <div className={`${sizeClasses[size]} rounded-full ${
          alertLevel === 'critical' ? 'bg-red-500' : 'bg-gray-500'
        } animate-pulse`}></div>
        <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full ${
          alertLevel === 'critical' ? 'bg-red-500' : 'bg-gray-500'
        } animate-ping opacity-75`}></div>
      </div>
      
      {/* النص (اختياري) */}
      {size !== 'sm' && (
        <span className={`${textSizeClasses[size]} font-medium ${
          alertLevel === 'critical' 
            ? 'text-red-600 dark:text-red-400' 
            : 'text-gray-600 dark:text-gray-400'
        }`}>
          {alertMessage}
        </span>
      )}
      
      {/* زر الإغلاق */}
      {dismissible && onDismiss && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="ml-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          title="إغلاق التحذير"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default UserSubscriptionAlert;
