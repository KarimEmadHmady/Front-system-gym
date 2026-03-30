'use client';

import React, { useState, useEffect } from 'react';
import { getAllFeedback } from '@/services/feedbackService';
import { SessionScheduleService } from '@/services/sessionScheduleService';
import { UserService } from '@/services/userService';
import { workoutService, dietService, messageService, invoiceService } from '@/services';
import { useAuth } from '@/hooks/useAuth';

const ManagerRecentActivity = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const userService = new UserService();
  const sessionScheduleService = new SessionScheduleService();

  useEffect(() => {
    loadRecentActivities();
    // eslint-disable-next-line
  }, [user?.id]);

  const loadRecentActivities = async () => {
    setLoading(true);
    setError(null);
    try {
      const [feedbacks, sessions, users, workoutPlans, dietPlans, messages, invoicesRes] = await Promise.all([
        getAllFeedback(),
        sessionScheduleService.getAllSessions(),
        userService.getUsers({ limit: 20 }),
        workoutService.getAllWorkoutPlans({ limit: 10, sortOrder: 'desc' }),
        dietService.getDietPlans({ limit: 10, sortOrder: 'desc' }),
        messageService.getAllMessages(),
        invoiceService.getInvoices({ limit: 5, sort: 'desc' })
      ]);

      const realActivities: any[] = [];

      // التقييمات الجديدة (آخر أسبوع)
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

      // الجلسات المكتملة (آخر أسبوع)
      const completedSessions = sessions
        .filter((s: any) => s.status === 'مكتملة')
        .filter((s: any) => {
          const sessionDate = new Date(s.date);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return sessionDate > weekAgo;
        })
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

      // الأعضاء الجدد (آخر أسبوع)
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

      // الخطط الجديدة (تمرين/غذائي) آخر أسبوع
      const workoutArr = Array.isArray((workoutPlans as any)?.results)
        ? (workoutPlans as any).results
        : Array.isArray(workoutPlans) ? workoutPlans : [];
      const dietArr = Array.isArray((dietPlans as any)?.results)
        ? (dietPlans as any).results
        : Array.isArray(dietPlans) ? dietPlans : [];
      const allPlans = [...workoutArr, ...dietArr]
        .filter((plan: any) => {
          const planDate = new Date(plan.createdAt);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return planDate > weekAgo;
        })
        .slice(0, 3);
      allPlans.forEach((plan: any) => {
        realActivities.push({
          id: `plan_${plan._id}`,
          type: 'plan_created',
          title: 'خطة جديدة',
          description: `تم إنشاء خطة ${plan.planName || 'بدون اسم'}`,
          time: getTimeAgo(plan.createdAt),
          icon: '📋',
          color: 'blue',
          date: new Date(plan.createdAt)
        });
      });

      // الرسائل الأخيرة (آخر أسبوع)
      let recentMessages: any[] = [];
      if (Array.isArray(messages)) {
        recentMessages = messages
          .filter((msg: any) => {
            const msgDate = new Date(msg.createdAt);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return msgDate > weekAgo;
          })
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3);
      }
      recentMessages.forEach((msg: any) => {
        realActivities.push({
          id: `msg_${msg._id}`,
          type: 'message',
          title: 'رسالة جديدة',
          description: `${msg.subject ? msg.subject + ' - ' : ''}${msg.message?.slice(0, 40) || ''}`,
          time: getTimeAgo(msg.createdAt),
          icon: '✉️',
          color: 'yellow',
          date: new Date(msg.createdAt)
        });
      });

      // الفواتير الجديدة (آخر أسبوع)
      let invoiceArr = Array.isArray((invoicesRes as any)?.results)
        ? (invoicesRes as any).results
        : Array.isArray(invoicesRes) ? invoicesRes : [];
      const recentInvoices = invoiceArr
        .filter((inv: any) => {
          const invDate = new Date(inv.createdAt);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return invDate > weekAgo;
        })
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3);
      recentInvoices.forEach((inv: any) => {
        realActivities.push({
          id: `invoice_${inv._id}`,
          type: 'invoice_created',
          title: 'فاتورة جديدة',
          description: `فاتورة #${inv.invoiceNumber || inv._id} - ج.م${(inv.amount || 0).toLocaleString()}`,
          time: getTimeAgo(inv.createdAt),
          icon: '🧾',
          color: 'indigo',
          date: new Date(inv.createdAt)
        });
      });

      // ترتيب حسب التاريخ (الأحدث أولاً)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      realActivities.sort((a: any, b: any) => b.date.getTime() - a.date.getTime());
      setActivities(realActivities.slice(0, 8));
    } catch (e: any) {
      setError(e?.message || 'فشل في تحميل النشاطات');
      setActivities([]);
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
      purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      pink: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
    };
    return colors[color as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          النشاط الأخير
        </h3>
        <button onClick={loadRecentActivities} disabled={loading} className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50">
          {loading ? 'جارِ التحديث...' : 'تحديث'}
        </button>
      </div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
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

export default ManagerRecentActivity;
