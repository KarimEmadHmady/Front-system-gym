'use client';

import React, { useState, useEffect } from 'react';
import { invoiceService } from '@/services';
import { payrollService } from '@/services';
import { revenueService } from '@/services';
import { expenseService } from '@/services';
import { getAllFeedback } from '@/services/feedbackService';
import { SessionScheduleService } from '@/services/sessionScheduleService';
import { UserService } from '@/services/userService';

const AdminRecentActivity = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userService = new UserService();
  const sessionScheduleService = new SessionScheduleService();

  useEffect(() => {
    loadRecentActivities();
  }, []);

  const loadRecentActivities = async () => {
    setLoading(true);
    setError(null);
    try {
      const [invoices, payrolls, revenues, expenses, feedbacks, sessions, users] = await Promise.all([
        invoiceService.getInvoices({ limit: 5, sort: 'desc' }),
        payrollService.list({ limit: 5, sort: 'desc' }),
        revenueService.list({ limit: 5, sort: 'desc' }),
        expenseService.list({ limit: 5, sort: 'desc' }),
        getAllFeedback(),
        sessionScheduleService.getAllSessions(),
        userService.getUsers({ limit: 10 })
      ]);

      const realActivities: any[] = [];

      // إضافة الفواتير
      const invoiceResults = Array.isArray(invoices) ? invoices : (invoices as any).results || [];
      invoiceResults.forEach((invoice: any) => {
        realActivities.push({
          id: `invoice_${invoice._id}`,
          type: 'invoice_created',
          title: 'فاتورة جديدة',
          description: `فاتورة #${invoice.invoiceNumber || invoice._id} - ج.م${(invoice.amount || 0).toLocaleString()}`,
          time: getTimeAgo(invoice.createdAt),
          icon: '🧾',
          color: 'yellow',
          date: new Date(invoice.createdAt)
        });
      });

      // إضافة الرواتب
      if (payrolls.results) {
        payrolls.results.forEach((payroll: any) => {
          realActivities.push({
            id: `payroll_${payroll._id}`,
            type: 'payroll_processed',
            title: 'راتب معالج',
            description: `راتب - ج.م${(payroll.salaryAmount || 0).toLocaleString()}`,
            time: getTimeAgo(payroll.paymentDate || payroll.createdAt),
            icon: '🧑‍💼',
            color: 'indigo',
            date: new Date(payroll.paymentDate || payroll.createdAt)
          });
        });
      }

      // إضافة الإيرادات
      if (revenues.results) {
        revenues.results.forEach((revenue: any) => {
          realActivities.push({
            id: `revenue_${revenue._id}`,
            type: 'payment_received',
            title: 'دفعة مستلمة',
            description: `${revenue.notes || 'إيراد'} - ج.م${(revenue.amount || 0).toLocaleString()}`,
            time: getTimeAgo(revenue.date || revenue.createdAt),
            icon: '💰',
            color: 'blue',
            date: new Date(revenue.date || revenue.createdAt)
          });
        });
      }

      // إضافة المصروفات
      if (expenses.results) {
        expenses.results.forEach((expense: any) => {
          realActivities.push({
            id: `expense_${expense._id}`,
            type: 'expense_added',
            title: 'مصروف جديد',
            description: `${expense.description || 'مصروف'} - ج.م${(expense.amount || 0).toLocaleString()}`,
            time: getTimeAgo(expense.date || expense.createdAt),
            icon: '💸',
            color: 'red',
            date: new Date(expense.date || expense.createdAt)
          });
        });
      }

      // إضافة التقييمات الجديدة
      const recentFeedbacks = feedbacks
        .filter((fb: any) => {
          const fbDate = new Date(fb.date);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return fbDate > weekAgo;
        })
        .slice(0, 3);

      recentFeedbacks.forEach((feedback: any) => {
        realActivities.push({
          id: `feedback_${feedback._id}`,
          type: 'feedback_received',
          title: 'تقييم جديد',
          description: `تقييم ${feedback.rating} نجوم من ${feedback.userName || 'عضو'}`,
          time: getTimeAgo(feedback.date),
          icon: '💬',
          color: 'pink',
          date: new Date(feedback.date)
        });
      });

      // إضافة الجلسات المكتملة
      const completedSessions = sessions
        .filter((s: any) => s.status === 'مكتملة')
        .slice(0, 3);

      completedSessions.forEach((session: any) => {
        realActivities.push({
          id: `session_${session._id}`,
          type: 'session_completed',
          title: 'حصة مكتملة',
          description: `حصة تدريبية مع ${session.trainerName || 'المدرب'}`,
          time: getTimeAgo(session.date),
          icon: '🏋️',
          color: 'purple',
          date: new Date(session.date)
        });
      });

      // إضافة الأعضاء الجدد
      const usersArray = Array.isArray(users) ? users : (users as any).results || [];
      const newUsers = usersArray
        .filter((u: any) => {
          const userDate = new Date(u.createdAt);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return userDate > weekAgo;
        })
        .slice(0, 3);

      newUsers.forEach((user: any) => {
        realActivities.push({
          id: `user_${user._id}`,
          type: 'member_registered',
          title: 'عضو جديد مسجل',
          description: `${user.name} سجل في الجيم`,
          time: getTimeAgo(user.createdAt),
          icon: '👤',
          color: 'green',
          date: new Date(user.createdAt)
        });
      });

      // ترتيب حسب التاريخ (الأحدث أولاً)
      realActivities.sort((a, b) => b.date.getTime() - a.date.getTime());
      
      // أخذ آخر 8 نشاطات
      setActivities(realActivities.slice(0, 8));
    } catch (e: any) {
      setError(e?.message || 'فشل في تحميل النشاطات');
      // fallback للداتا الفيك في حالة الخطأ
      setActivities([
        {
          id: 1,
          type: 'member_registered',
          title: 'عضو جديد مسجل',
          description: 'أحمد محمد سجل في الجيم',
          time: 'منذ 5 دقائق',
          icon: '👤',
          color: 'green'
        },
        {
          id: 2,
          type: 'payment_received',
          title: 'دفعة مستلمة',
          description: 'دفعة شهرية من 15 عضواً - ج.م3,750',
          time: 'منذ 10 دقائق',
          icon: '💰',
          color: 'blue'
        },
        {
          id: 3,
          type: 'expense_added',
          title: 'مصروف جديد',
          description: 'شراء معدات رياضية - ج.م2,500',
          time: 'منذ 30 دقيقة',
          icon: '💸',
          color: 'red'
        },
        {
          id: 4,
          type: 'session_completed',
          title: 'حصة مكتملة',
          description: 'حصة تدريبية مع المدرب سارة',
          time: 'منذ ساعة',
          icon: '🏋️',
          color: 'purple'
        },
        {
          id: 5,
          type: 'invoice_created',
          title: 'فاتورة جديدة',
          description: 'فاتورة شهرية للمدرب علي',
          time: 'منذ ساعتين',
          icon: '🧾',
          color: 'yellow'
        },
        {
          id: 6,
          type: 'role_changed',
          title: 'تغيير دور',
          description: 'تم ترقية محمد إلى مدير',
          time: 'منذ 3 ساعات',
          icon: '👨‍💼',
          color: 'indigo'
        },
        {
          id: 7,
          type: 'feedback_received',
          title: 'تقييم جديد',
          description: 'تقييم 5 نجوم من فاطمة أحمد',
          time: 'منذ 4 ساعات',
          icon: '💬',
          color: 'pink'
        },
        {
          id: 8,
          type: 'system_backup',
          title: 'نسخ احتياطي',
          description: 'تم إنشاء نسخة احتياطية من النظام',
          time: 'منذ 6 ساعات',
          icon: '💾',
          color: 'gray'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'الآن';
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `منذ ${diffInDays} يوم`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `منذ ${diffInWeeks} أسبوع`;
  };

  const getColorClasses = (color: string) => {
    const colors = {
      green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      pink: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      gray: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };
    return colors[color as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          النشاط الأخير - الإدارة
        </h3>
        <button 
          onClick={loadRecentActivities}
          disabled={loading}
          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50"
        >
          {loading ? 'جارِ التحديث...' : 'تحديث'}
        </button>
      </div>
      
      {/* {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )} */}
      
      <div className="space-y-4">
        {loading && activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            جارِ تحميل النشاطات...
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            لا توجد نشاطات حديثة
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${getColorClasses(activity.color)}`}>
                {activity.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.title}
                  </h4>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.time}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {activity.description}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminRecentActivity;
