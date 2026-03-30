'use client';

import React from 'react';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/hooks/useAuth';

const managerTabs = [
  { id: 'users', title: 'الأعضاء', description: 'إدارة الأعضاء وتسجيل عضو جديد', icon: '👥', color: 'blue' },
  { id: 'trainers', title: 'المدربون', description: 'إدارة المدربين وتسجيل مدرب جديد', icon: '🧑‍🏫', color: 'green' },
  { id: 'sessions', title: 'الحصص', description: 'جدولة وإدارة الحصص التدريبية', icon: '🏋️', color: 'indigo' },
  { id: 'plans', title: 'الخطط', description: 'إنشاء وإدارة الخطط التدريبية والغذائية', icon: '📋', color: 'purple' },
  { id: 'reports', title: 'التقارير', description: 'عرض تقارير مفصلة وإحصائيات', icon: '📈', color: 'pink' },
  { id: 'attendance', title: 'الحضور', description: 'تسجيل وعرض الحضور', icon: '📝', color: 'indigo' },
  { id: 'payments', title: 'مدفوعات', description: 'إدارة المدفوعات', icon: '💵', color: 'green' },
  { id: 'invoices', title: 'الفواتير', description: 'إدارة الفواتير وإنشاء فاتورة جديدة', icon: '🧾', color: 'red' },
  { id: 'add-expense', title: 'إضافة مصروف', description: 'تسجيل مصروف جديد', icon: '💸', color: 'red' },
  { id: 'add-revenue', title: 'إضافة دخل', description: 'تسجيل دخل جديد', icon: '💰', color: 'green' },
  { id: 'purchases', title: 'مشتريات', description: 'إدارة المشتريات', icon: '🛒', color: 'orange' },
  { id: 'messages', title: 'رسائل', description: 'عرض وإرسال الرسائل', icon: '✉️', color: 'blue' },
  { id: 'progress', title: 'تقدم العملاء', description: 'متابعة تقدم العملاء', icon: '📈', color: 'pink' },
  { id: 'feedback', title: 'التقييمات', description: 'إدارة التقييمات', icon: '⭐', color: 'yellow' },
  { id: 'loyalty', title: 'نقاط الولاء', description: 'إدارة نقاط الولاء', icon: '🎯', color: 'red' },
  // { id: 'membership-cards', title: 'بطاقات العضوية', description: 'توليد وإدارة بطاقات العضوية', icon: '🪪', color: 'green' },
  { id: 'attendance-log', title: 'قارئ QR', description: 'فتح ماسح QR لتسجيل الحضور', icon: '📷', color: 'purple' },
  { id: 'search', title: 'بحث', description: 'البحث في النظام', icon: '🔎', color: 'gray' },
  { id: 'settings', title: 'الإعدادات', description: 'تعديل إعدادات النظام', icon: '⚙️', color: 'gray' },
];

const ManagerQuickActions = () => {
  const router = useRouter();
  const { user } = useAuth();

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
      purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      orange: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
      yellow: 'from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700',
      indigo: 'from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700',
      red: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
      pink: 'from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700',
      gray: 'from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700'
    };
    return colors[color as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
        الإجراءات السريعة
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
        {managerTabs.map((tab, index) => (
          <button
            key={tab.id}
            onClick={() => {
              if (!user || !user.id) return;
              if (tab.id === 'qr-scanner') {
                router.push(`/admin/attendance-scanner/${user.id}`);
              } else {
                router.push(`/manager/dashboard/${user.id}?tab=${tab.id}`);
              }
            }}
            className={`bg-gradient-to-r ${getColorClasses(tab.color)} text-white rounded-md p-2 text-left hover:shadow-lg transform hover:scale-105 transition-all duration-200 min-h-[70px]`}
          >
            <div className="flex items-center mb-1">
              <span className="text-lg mr-2">{tab.icon}</span>
              <h4 className="font-semibold text-xs">{tab.title}</h4>
            </div>
            <p className="text-[10px] opacity-90">{tab.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ManagerQuickActions;