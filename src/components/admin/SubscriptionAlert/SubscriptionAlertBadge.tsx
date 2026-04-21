'use client';

import React, { useState, useEffect } from 'react';
import { getSubscriptionAlertService, type SubscriptionAlert } from '@/services/subscriptionAlertService';

interface SubscriptionAlertBadgeProps {
  className?: string;
}

const SubscriptionAlertBadge: React.FC<SubscriptionAlertBadgeProps> = ({ className = '' }) => {
  const [alertCount, setAlertCount] = useState(0);
  const [criticalCount, setCriticalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAlertCount = async () => {
      try {
        const [totalCount, criticalCount] = await Promise.all([
          getSubscriptionAlertService().getAlertCount(),
          getSubscriptionAlertService().getCriticalAlertCount()
        ]);
        
        setAlertCount(totalCount);
        setCriticalCount(criticalCount);
      } catch (error) {
        console.error('Error fetching alert count:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlertCount();
    // no polling here; indicator handles periodic refresh
  }, []);

  if (isLoading || alertCount === 0) {
    return null;
  }

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {/* النقطة الحمراء المتحركة */}
      <div className="relative">
        <div className={`w-3 h-3 rounded-full ${
          criticalCount > 0 ? 'bg-red-500' : 'bg-gray-500'
        } animate-pulse`}></div>
        <div className={`absolute inset-0 w-3 h-3 rounded-full ${
          criticalCount > 0 ? 'bg-red-500' : 'bg-gray-500'
        } animate-ping opacity-75`}></div>
      </div>
      
      {/* العداد */}
      <div className={`ml-2 px-2 py-[2px] rounded-full text-xs font-bold ${
        criticalCount > 0 
          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      }`}>
        {alertCount}
      </div>
    </div>
  );
};

export default SubscriptionAlertBadge;
