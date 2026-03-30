'use client';

import React from 'react';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/hooks/useAuth';

const TrainerQuickActions = () => {
  const router = useRouter();
  const { user } = useAuth();
  const trainerId = ((user as any)?._id ?? (user as any)?.id ?? '') as string;

  const actions = [
    { id: 'clients', title: 'عملائي', description: 'إدارة العملاء المرتبطين بك', icon: '👥', color: 'blue' },
    { id: 'plans', title: 'الخطط', description: 'إدارة خطط التمرين والغذاء', icon: '📋', color: 'green' },
    { id: 'progress', title: 'التقدم', description: 'متابعة تقدم عملائك', icon: '📈', color: 'indigo' },
    { id: 'attendance', title: 'حضوري', description: 'سجل حضورك وحضور العملاء', icon: '📝', color: 'purple' },
    { id: 'clientSessions', title: 'حصص العملاء', description: 'إدارة وجدولة حصص عملائك', icon: '📅', color: 'orange' },
    { id: 'feedback', title: 'التقييمات', description: 'عرض تقييماتك وملاحظات العملاء', icon: '⭐', color: 'yellow' },
    { id: 'messages', title: 'الرسائل', description: 'تواصل مع عملائك', icon: '✉️', color: 'pink' },
    { id: 'loyalty', title: 'نقاط الولاء', description: 'مكافآت ونقاط ولاء العملاء', icon: '🎁', color: 'gray' },
    { id: 'schedule', title: 'الجدول', description: 'عرض جدولك الزمني', icon: '📅', color: 'blue' },
    { id: 'profile', title: 'الملف الشخصى', description: 'تحديث بيانات ملفك', icon: '👤', color: 'green' },
  ].map(a => ({
    ...a,
    action: () => {
      if (trainerId) {
        router.push(`/trainer/dashboard/${trainerId}?tab=${a.id}`);
      } else {
        router.push(`/trainer/dashboard?tab=${a.id}`);
      }
    }
  }));

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
      orange: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
      purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      indigo: 'from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700',
      yellow: 'from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700',
      pink: 'from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700',
      gray: 'from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700'
    };
    return colors[color as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
        الإجراءات السريعة - المدرب
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className={`bg-gradient-to-r ${getColorClasses(action.color)} text-white rounded-lg p-3 text-left hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200`}
          >
            <div className="flex items-center mb-1.5">
              <span className="text-xl mr-2">{action.icon}</span>
              <h4 className="font-semibold text-xs">{action.title}</h4>
            </div>
            <p className="text-[11px] opacity-90">{action.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TrainerQuickActions;
