import { useEffect, useRef } from 'react';
import { getSubscriptionAlertService } from '@/services/subscriptionAlertService';

export const useSoundManager = (activeTab: string, hasAlerts: boolean) => {
  const lastTabRef = useRef<string>('');
  const soundPlayedRef = useRef<boolean>(false);

  useEffect(() => {
    // إعادة تعيين حالة الصوت عند تغيير التبويب
    if (activeTab !== lastTabRef.current) {
      getSubscriptionAlertService().resetSoundState();
      soundPlayedRef.current = false;
      lastTabRef.current = activeTab;
    }

    // تشغيل الصوت مرة واحدة فقط عند وجود تحذيرات
    if (activeTab === 'users' && hasAlerts && !soundPlayedRef.current) {
      const isSoundEnabled = localStorage.getItem('subscription-alert-sound') !== 'false';
      if (isSoundEnabled && getSubscriptionAlertService().canPlaySound()) {
        getSubscriptionAlertService().playAlertSound();
        soundPlayedRef.current = true;
      }
    }
  }, [activeTab, hasAlerts]);

  return {
    resetSound: () => {
      getSubscriptionAlertService().resetSoundState();
      soundPlayedRef.current = false;
    }
  };
};
