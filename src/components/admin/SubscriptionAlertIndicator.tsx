'use client';

import React, { useEffect, useRef, useState } from 'react';
import { getSubscriptionAlertService, type SubscriptionAlert } from '@/services/subscriptionAlertService';

interface SubscriptionAlertIndicatorProps {
  onAlertsChange?: (alerts: SubscriptionAlert[]) => void;
  playSound?: boolean;
  enabled?: boolean;
  refreshOnIntervalMs?: number | null;
}

const SubscriptionAlertIndicator: React.FC<SubscriptionAlertIndicatorProps> = ({ 
  onAlertsChange, 
  playSound = true,
  enabled = true,
  refreshOnIntervalMs = null,
}) => {
  const [alerts, setAlerts] = useState<SubscriptionAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const hasPlayedSoundRef = useRef(false);
  const onAlertsChangeRef = useRef<typeof onAlertsChange>(onAlertsChange);
  const playSoundRef = useRef(playSound);

  useEffect(() => {
    onAlertsChangeRef.current = onAlertsChange;
  }, [onAlertsChange]);

  useEffect(() => {
    playSoundRef.current = playSound;
  }, [playSound]);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    const fetchAlerts = async () => {
      setIsLoading(true);
      try {
        const subscriptionAlerts = await getSubscriptionAlertService().getSubscriptionAlerts();
        setAlerts(subscriptionAlerts);
        onAlertsChangeRef.current?.(subscriptionAlerts);
        
        // إرسال إشعارات المتصفح للتحذيرات الحرجة (بدون صوت)
        if (playSoundRef.current && subscriptionAlerts.length > 0 && !hasPlayedSoundRef.current) {
          const criticalAlerts = subscriptionAlerts.filter(alert => alert.severity === 'critical');
          if (criticalAlerts.length > 0) {
            hasPlayedSoundRef.current = true;
            
            // إرسال إشعارات المتصفح للتحذيرات الحرجة
            try {
              const isNotificationEnabled = localStorage.getItem('subscription-alert-notification') === 'true';
              if (isNotificationEnabled) {
                const hasPermission = await getSubscriptionAlertService().requestNotificationPermission();
                if (hasPermission) {
                  await getSubscriptionAlertService().sendAllAlertsAsNotifications();
                }
              }
            } catch (error) {
              console.error('Error sending notifications:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching subscription alerts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlerts();

    if (!refreshOnIntervalMs || refreshOnIntervalMs <= 0) {
      return;
    }

    const interval = setInterval(() => {
      // Force refresh when interval is explicitly enabled.
      getSubscriptionAlertService().clearCache();
      fetchAlerts();
    }, refreshOnIntervalMs);

    return () => clearInterval(interval);
  }, [enabled, refreshOnIntervalMs]);

  if (isLoading) {
    return null;
  }

  if (alerts.length === 0 || isDismissed) {
    return null;
  }

  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');
  const warningAlerts = alerts.filter(alert => alert.severity === 'warning');

  return (
    <div className="fixed bottom-[230px] sm:bottom-[240px] left-4 z-50 flex flex-col items-end gap-2 w-[255px]">
      {/* مؤشر التحذير الرئيسي */}
      <div className="relative w-full ">
        <div className="bg-red-500 text-white px-2 py-1 rounded-md shadow-lg flex items-center space-x-1 animate-pulse  text-xs min-w-[120px] min-h-[32px] mb-2">
          <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
          <span className="font-semibold text-xs w-full flex items-center justify-center">
            {alerts.length} تحذير اشتراك
          </span>
          <button
            onClick={() => setIsDismissed(true)}
            className="ml-1 text-white hover:text-gray-200 transition-colors p-1.5  "
            title="إغلاق التحذير"
            style={{ fontSize: '12px' }}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* تفاصيل التحذيرات */}
        <div className="absolute  right-0 mb-2 w-64 bg-white dark:bg-gray-800/80 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-72 overflow-y-auto text-xs">
          <div className="p-2">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-sm text-center">
              تحذيرات الاشتراكات
            </h3>
            {criticalAlerts.length > 0 && (
              <div className="mb-2">
                <h4 className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1.5 text-center">
                  تحذيرات ضرورية ({criticalAlerts.length})
                </h4>
                {criticalAlerts.map((alert, index) => (
                  <div key={index} className="bg-red-50 dark:bg-red-900/20 p-2 rounded-lg mb-1">
                    <div className="font-medium text-red-900 dark:text-gray-100 text-xs text-center">
                      {alert.userName}
                    </div>
                    <div className="text-xs text-red-700 dark:text-red-500 text-center">
                      {alert.alertType === 'expiry' && (
                        <span>
                          {alert.daysUntilExpiry <= 0 ? 'انتهى الاشتراك' : `الاشتراك سينتهي خلال ${alert.daysUntilExpiry} أيام`}
                        </span>
                      )}
                      {alert.alertType === 'reminder' && (
                        <span>
                          يجب إرسال تذكير خلال {alert.daysUntilReminder} أيام
                        </span>
                      )}
                      {alert.alertType === 'both' && (
                        <span>
                          انتهاء خلال {alert.daysUntilExpiry} أيام + تذكير خلال {alert.daysUntilReminder} أيام
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {warningAlerts.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  تحذيرات  ({warningAlerts.length})
                </h4>
                {warningAlerts.map((alert, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-900/20 p-2 rounded-lg mb-1">
                    <div className="font-medium text-gray-900 dark:text-gray-100 text-xs">
                      {alert.userName}
                    </div>
                    <div className="text-xs text-gray-700 dark:text-gray-300">
                      {alert.alertType === 'expiry' && (
                        <span>
                          {alert.daysUntilExpiry <= 0 ? 'انتهى الاشتراك' : `الاشتراك سينتهي خلال ${alert.daysUntilExpiry} أيام`}
                        </span>
                      )}
                      {alert.alertType === 'reminder' && (
                        <span>
                          يجب إرسال تذكير خلال {alert.daysUntilReminder} أيام
                        </span>
                      )}
                      {alert.alertType === 'both' && (
                        <span>
                          انتهاء خلال {alert.daysUntilExpiry} أيام + تذكير خلال {alert.daysUntilReminder} أيام
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionAlertIndicator;
