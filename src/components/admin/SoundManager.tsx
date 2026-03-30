'use client';

import React, { useState, useEffect } from 'react';
import { getSubscriptionAlertService } from '@/services/subscriptionAlertService';
import { useSoundManager } from '@/hooks/useSoundManager';

interface SoundManagerProps {
  activeTab: string;
}

const SoundManager: React.FC<SoundManagerProps> = ({ activeTab }) => {
  const [hasAlerts, setHasAlerts] = useState(false);
  
  // فحص وجود تحذيرات
  useEffect(() => {
    const checkAlerts = async () => {
      try {
        const alerts = await getSubscriptionAlertService().getSubscriptionAlerts();
        setHasAlerts(alerts.length > 0);
      } catch (error) {
        console.error('Error checking alerts:', error);
        setHasAlerts(false);
      }
    };

    if (activeTab === 'users') {
      checkAlerts();
    }
  }, [activeTab]);

  // استخدام hook إدارة الصوت
  useSoundManager(activeTab, hasAlerts);

  return null; // هذا المكون لا يعرض أي شيء، فقط يدير الصوت
};

export default SoundManager;
