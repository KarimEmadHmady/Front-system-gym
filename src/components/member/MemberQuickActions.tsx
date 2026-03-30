'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';

type QuickAction = {
  id: string;
  title: string;
  description?: string;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'yellow' | 'pink' | 'indigo' | 'gray';
};

const MemberQuickActions = () => {
  const t = useTranslations('MemberProfile');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const actions: QuickAction[] = [
    { id: 'attendance', title: 'الحضور', icon: '📝', color: 'green' },
    { id: 'payments', title: 'مدفوعات', icon: '💵', color: 'yellow' },
    { id: 'subscription', title: 'الاشتراك', icon: '📅', color: 'blue' },
    { id: 'purchases', title: 'مشتريات', icon: '🛒', color: 'orange' },
    { id: 'sessions', title: t('Tabs.sessions'), icon: '🏋️', color: 'purple' },
    { id: 'plans', title: t('Tabs.plans'), icon: '📋', color: 'pink' },
    { id: 'trainer', title: 'مدربي', icon: '👨‍🏫', color: 'indigo' },
    { id: 'messages', title: 'الرسائل', icon: '💬', color: 'blue' },
    { id: 'progress', title: t('Tabs.progress'), icon: '📈', color: 'orange' },
    { id: 'feedback', title: 'التقييمات', icon: '⭐', color: 'yellow' },
    { id: 'loyalty', title: t('Tabs.loyalty'), icon: '⭐', color: 'purple' },
    { id: 'settings', title: t('Tabs.settings'), icon: '⚙️', color: 'gray' }
  ];

  const getColorClasses = (color: QuickAction['color']) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
      purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      orange: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
      yellow: 'from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700',
      pink: 'from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700',
      indigo: 'from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700',
      gray: 'from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700'
    } as const;
    return colors[color] || 'from-gray-500 to-gray-600';
  };

  const navigateToTab = (tabId: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('tab', tabId);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
        الإجراءات السريعة
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => navigateToTab(action.id)}
            className={`bg-gradient-to-r ${getColorClasses(action.color)} text-white rounded-md p-3 text-right hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400`}
            aria-label={action.title}
          >
            <div className="flex items-center mb-1">
              <span className="text-xl ml-2">{action.icon}</span>
              <h4 className="font-semibold text-xs">{action.title}</h4>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MemberQuickActions;
