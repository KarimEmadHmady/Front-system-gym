'use client';

import React, { useState, useEffect } from 'react';
import { getSubscriptionAlertService } from '@/services/subscriptionAlertService';

interface SubscriptionAlertSettingsProps {
  className?: string;
}

const SubscriptionAlertSettings: React.FC<SubscriptionAlertSettingsProps> = ({ className = '' }) => {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);
  const [alertThreshold, setAlertThreshold] = useState(3);
  const [reminderThreshold, setReminderThreshold] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // تحميل الإعدادات المحفوظة
    const savedSoundEnabled = localStorage.getItem('subscription-alert-sound') !== 'false';
    const savedNotificationEnabled = localStorage.getItem('subscription-alert-notification') === 'true';
    const savedAlertThreshold = parseInt(localStorage.getItem('subscription-alert-threshold') || '3');
    const savedReminderThreshold = parseInt(localStorage.getItem('subscription-alert-reminder-threshold') || '1');

    setIsSoundEnabled(savedSoundEnabled);
    setIsNotificationEnabled(savedNotificationEnabled);
    setAlertThreshold(savedAlertThreshold);
    setReminderThreshold(savedReminderThreshold);
    setIsInitialized(true);
  }, []);

  // حفظ الإعدادات تلقائياً عند التغيير (بعد التهيئة)
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('subscription-alert-sound', isSoundEnabled.toString());
    }
  }, [isSoundEnabled, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('subscription-alert-notification', isNotificationEnabled.toString());
    }
  }, [isNotificationEnabled, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('subscription-alert-threshold', alertThreshold.toString());
    }
  }, [alertThreshold, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('subscription-alert-reminder-threshold', reminderThreshold.toString());
    }
  }, [reminderThreshold, isInitialized]);

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // حفظ الإعدادات في localStorage
      localStorage.setItem('subscription-alert-sound', isSoundEnabled.toString());
      localStorage.setItem('subscription-alert-notification', isNotificationEnabled.toString());
      localStorage.setItem('subscription-alert-threshold', alertThreshold.toString());
      localStorage.setItem('subscription-alert-reminder-threshold', reminderThreshold.toString());

      // طلب إذن الإشعارات إذا كان مفعلاً
      if (isNotificationEnabled) {
        await getSubscriptionAlertService().requestNotificationPermission();
      }

      // إظهار رسالة نجاح
      window.dispatchEvent(new CustomEvent('toast', { 
        detail: { type: 'success', message: 'تم حفظ الإعدادات بنجاح' } 
      }));
    } catch (error) {
      console.error('Error saving settings:', error);
      window.dispatchEvent(new CustomEvent('toast', { 
        detail: { type: 'error', message: 'حدث خطأ أثناء حفظ الإعدادات' } 
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const testSound = () => {
    getSubscriptionAlertService().playAlertSound();
  };

  const testNotification = async () => {
    try {
      const hasPermission = await getSubscriptionAlertService().requestNotificationPermission();
      if (hasPermission) {
        // إنشاء تحذير تجريبي
        const testAlert = {
          userId: 'test',
          userName: 'مستخدم تجريبي',
          userEmail: 'test@example.com',
          subscriptionEndDate: new Date(),
          renewalReminderDate: new Date(),
          daysUntilExpiry: 2,
          daysUntilReminder: 1,
          alertType: 'expiry' as const,
          severity: 'critical' as const
        };
        await getSubscriptionAlertService().showBrowserNotification(testAlert);
      } else {
        window.dispatchEvent(new CustomEvent('toast', { 
          detail: { type: 'warning', message: 'لم يتم منح إذن الإشعارات' } 
        }));
      }
    } catch (error) {
      console.error('Error testing notification:', error);
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          إعدادات تحذيرات الاشتراكات
        </h3>
        
        <div className="space-y-6">
          {/* إعدادات الصوت */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                التحذير الصوتي
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                تشغيل صوت تحذير عند وجود اشتراكات قريبة من الانتهاء
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={testSound}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                اختبار الصوت
              </button>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSoundEnabled}
                  onChange={(e) => setIsSoundEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 dark:peer-focus:ring-gray-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-gray-600"></div>
              </label>
            </div>
          </div>

          {/* إعدادات الإشعارات */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                إشعارات المتصفح
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                إرسال إشعارات المتصفح للتحذيرات الضرورية
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={testNotification}
                className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
              >
                اختبار الإشعار
              </button>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isNotificationEnabled}
                  onChange={(e) => setIsNotificationEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 dark:peer-focus:ring-gray-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-gray-600"></div>
              </label>
            </div>
          </div>

          {/* عتبة التحذير */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              عتبة التحذير (أيام قبل انتهاء الاشتراك)
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              سيتم إظهار تحذير عندما يتبقى هذا العدد من الأيام أو أقل
            </p>
          </div>

          {/* عتبة التذكير */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              عتبة التذكير (أيام قبل إرسال تذكير التجديد)
            </label>
            <input
              type="number"
              min="1"
              max="7"
              value={reminderThreshold}
              onChange={(e) => setReminderThreshold(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              سيتم إظهار تحذير عندما يتبقى هذا العدد من الأيام أو أقل لإرسال التذكير
            </p>
          </div>

          {/* زر الحفظ */}
          <div className="flex justify-end">
            <button
              onClick={handleSaveSettings}
              disabled={isLoading}
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {isLoading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionAlertSettings;
