'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { sessionScheduleService, messageService } from '@/services';
import { getFeedbackForUser } from '@/services/feedbackService';
import { ProgressService } from '@/services/progressService';
import type { SessionSchedule, Feedback, ClientProgress, Message } from '@/types';

// دالة لحساب الوقت النسبي بالعربي
function getRelativeTime(date: Date | string) {
  const now = new Date();
  const d = new Date(date);
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return 'الآن';
  if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
  if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
  if (diff < 604800) return `منذ ${Math.floor(diff / 86400)} يوم`;
  return d.toLocaleDateString('ar-EG');
}

const TrainerRecentActivity = () => {
  const { user } = useAuth();
  const trainerId = (user as any)?._id ?? user?.id ?? '';

  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!trainerId) return;
    setLoading(true);
    const progressService = new ProgressService();
    Promise.all([
      sessionScheduleService.getSessionsByUser(trainerId),
      getFeedbackForUser(trainerId),
      progressService.getTrainerProgress(trainerId),
      messageService.getMessagesForUser(trainerId),
    ]).then(([sessions, feedbacks, progresses, messages]) => {
      const acts: any[] = [];
      // آخر حصة مكتملة أو مجدولة
      const latestSession = (sessions || [])
        .filter((s: SessionSchedule) => s.status === 'مكتملة' || s.status === 'مجدولة')
        .sort((a: SessionSchedule, b: SessionSchedule) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      if (latestSession) {
        acts.push({
          id: 'session',
          type: latestSession.status === 'مكتملة' ? 'session_completed' : 'session_scheduled',
          title: latestSession.status === 'مكتملة' ? 'حصة مكتملة' : 'حصة مجدولة',
          description: latestSession.description || `حصة ${latestSession.sessionType} مع متدرب`,
          time: getRelativeTime(latestSession.date),
          icon: latestSession.status === 'مكتملة' ? '🏋️' : '📅',
          color: latestSession.status === 'مكتملة' ? 'green' : 'indigo',
        });
      }
      // آخر تقييم
      const latestFeedback = (feedbacks || []).sort((a: Feedback, b: Feedback) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      if (latestFeedback) {
        acts.push({
          id: 'feedback',
          type: 'client_feedback',
          title: 'تقييم جديد',
          description: `${latestFeedback.rating} نجوم${latestFeedback.comment ? ' - ' + latestFeedback.comment : ''}`,
          time: getRelativeTime(latestFeedback.date),
          icon: '⭐',
          color: 'yellow',
        });
      }
      // آخر تقدم عميل
      const latestProgress = (progresses || []).sort((a: ClientProgress, b: ClientProgress) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      if (latestProgress) {
        acts.push({
          id: 'progress',
          type: 'client_progress',
          title: 'تقدم عميل',
          description: latestProgress.notes || 'تم تسجيل تقدم جديد لأحد العملاء',
          time: getRelativeTime(latestProgress.date),
          icon: '📈',
          color: 'blue',
        });
      }
      // آخر رسالة غير مقروءة
      const unreadMessages = (messages || []).filter((m: Message) => !m.read && m.userId === trainerId);
      const latestUnread = unreadMessages.sort((a: Message, b: Message) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      if (latestUnread) {
        acts.push({
          id: 'unread_message',
          type: 'message_unread',
          title: 'رسالة غير مقروءة',
          description: latestUnread.subject ? latestUnread.subject : (latestUnread.message?.slice(0, 30) + '...'),
          time: getRelativeTime(latestUnread.date),
          icon: '💬',
          color: 'pink',
        });
      }
      setActivities(acts);
    }).finally(() => setLoading(false));
  }, [trainerId]);

  const getColorClasses = (color: string) => {
    const colors = {
      green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      pink: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
    };
    return colors[color as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          نشاطي الأخير
        </h3>
        <button className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
          عرض الكل
        </button>
      </div>
      {loading ? (
        <div className="text-center text-gray-500 py-8">جاري التحميل...</div>
      ) : (
        <div className="space-y-4">
          {activities.length === 0 && (
            <div className="text-center text-gray-400">لا يوجد نشاط حديث</div>
          )}
          {activities.map((activity) => (
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
          ))}
        </div>
      )}
    </div>
  );
};

export default TrainerRecentActivity;
