'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { userService, workoutService, dietService, messageService } from '@/services';
import { getFeedbackForUser } from '@/services/feedbackService';
import { SessionScheduleService } from '@/services/sessionScheduleService';
import { AttendanceService } from '@/services/attendanceService';

const TrainerStatsCards = () => {
  const { user } = useAuth();
  const currentTrainerId = useMemo(() => ((user as any)?._id ?? (user as any)?.id ?? ''), [user]);

  const [clientsCount, setClientsCount] = useState(0);
  const [plansCount, setPlansCount] = useState(0);
  const [workoutPlansCount, setWorkoutPlansCount] = useState(0);
  const [dietPlansCount, setDietPlansCount] = useState(0);
  const [sessionsCount, setSessionsCount] = useState(0);
  const [sessionsThisWeek, setSessionsThisWeek] = useState(0);
  const [trainingHours, setTrainingHours] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentTrainerId) return;
    let isMounted = true;
    setLoading(true);

    const sessionSvc = new SessionScheduleService();
    const attendanceSvc = new AttendanceService();

    const normalizeId = (val: any): string => {
      if (!val) return '';
      if (typeof val === 'string') return val;
      if (typeof val === 'object') return (val._id || val.id || '') as string;
      return String(val);
    };

    const startOfWeek = () => {
      const d = new Date();
      const day = d.getDay(); // 0 Sun .. 6 Sat
      const diff = (day === 0 ? -6 : 1) - day; // make Monday start
      const monday = new Date(d);
      monday.setDate(d.getDate() + diff);
      monday.setHours(0, 0, 0, 0);
      return monday;
    };

    const load = async () => {
      // Clients of this trainer
      try {
        const membersRes: any = await userService.getUsersByRole('member', { page: 1, limit: 1000 });
        const arr = Array.isArray(membersRes) ? membersRes : (membersRes?.data || []);
        const me = normalizeId(currentTrainerId);
        const myClients = (arr || []).filter((m: any) => normalizeId(m?.trainerId) === me);
        if (isMounted) setClientsCount(myClients.length);
      } catch {
        if (isMounted) setClientsCount(0);
      }

      // Plans (workout + diet) for this trainer
      try {
        const [workoutRes, dietRes] = await Promise.all([
          workoutService.getAllWorkoutPlans({ trainerId: currentTrainerId }),
          dietService.getDietPlans({ trainerId: currentTrainerId })
        ]);
        const workoutPlans: any[] = (workoutRes as any)?.data || (workoutRes as any) || [];
        const dietPlans: any[] = (dietRes as any)?.data || (dietRes as any) || [];
        const wCount = workoutPlans?.length || 0;
        const dCount = dietPlans?.length || 0;
        if (isMounted) {
          setWorkoutPlansCount(wCount);
          setDietPlansCount(dCount);
          setPlansCount(wCount + dCount);
        }
      } catch {
        if (isMounted) {
          setPlansCount(0);
          setWorkoutPlansCount(0);
          setDietPlansCount(0);
        }
      }

      // Sessions for this trainer
      try {
        const sessions: any[] = await sessionSvc.getSessionsByUser(currentTrainerId);
        if (isMounted) setSessionsCount(sessions?.length || 0);

        const weekStart = startOfWeek().getTime();
        const inWeek = (sessions || []).filter((s) => {
          const t = new Date(s.date).getTime();
          return t >= weekStart;
        });
        if (isMounted) setSessionsThisWeek(inWeek.length);

        const totalMinutes = (sessions || [])
          .filter((s) => s.status === 'مكتملة' || s.status === 'completed')
          .reduce((sum, s) => sum + (Number(s.duration) || 0), 0);
        if (isMounted) setTrainingHours(Math.round(totalMinutes / 60));
      } catch {
        if (isMounted) {
          setSessionsCount(0);
          setSessionsThisWeek(0);
          setTrainingHours(0);
        }
      }

      // Unread messages for this trainer
      try {
        const msgs: any[] = await messageService.getMessagesForUser(currentTrainerId);
        const unread = (msgs || []).filter((m) => !m.read && normalizeId(m.userId) === normalizeId(currentTrainerId));
        if (isMounted) setUnreadMessages(unread.length);
      } catch {
        if (isMounted) setUnreadMessages(0);
      }

      // Attendance records count for trainer
      try {
        const res: any = await attendanceSvc.getUserAttendance(currentTrainerId, { page: 1, limit: 1000 } as any);
        const records = Array.isArray(res) ? res : (res?.data || []);
        if (isMounted) setAttendanceCount(records.length || 0);
      } catch {
        if (isMounted) setAttendanceCount(0);
      }

      // Feedback: reviews count and average rating
      try {
        const feedbacks: any[] = await getFeedbackForUser(currentTrainerId);
        const cnt = feedbacks?.length || 0;
        if (isMounted) setReviewsCount(cnt);
        if (cnt > 0) {
          const avg = feedbacks.reduce((sum, f: any) => sum + (Number(f.rating) || 0), 0) / cnt;
          if (isMounted) setAverageRating(Number(avg.toFixed(2)));
        } else {
          if (isMounted) setAverageRating(0);
        }
      } catch {
        if (isMounted) {
          setReviewsCount(0);
          setAverageRating(0);
        }
      }
      
      if (isMounted) setLoading(false);
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [currentTrainerId]);

  const stats = [
    { title: 'عملائي', value: String(clientsCount), change: '', changeType: 'positive', icon: '👥', color: 'blue' },
    { title: 'الحصص هذا الأسبوع', value: String(sessionsThisWeek), change: '', changeType: 'positive', icon: '🏋️', color: 'green' },
    { title: 'ساعات التدريب', value: String(trainingHours), change: '', changeType: 'positive', icon: '⏰', color: 'purple' },
    { title: 'الرسائل غير المقروءة', value: String(unreadMessages), change: '', changeType: unreadMessages > 0 ? 'negative' : 'positive', icon: '📨', color: 'yellow' },
    { title: 'خطط التمرين', value: String(workoutPlansCount), change: '', changeType: 'positive', icon: '🏋️‍♂️', color: 'indigo' },
    { title: 'الخطط الغذائية', value: String(dietPlansCount), change: '', changeType: 'positive', icon: '🍎', color: 'green' },
    { title: 'إجمالي الحصص', value: String(sessionsCount), change: '', changeType: 'positive', icon: '🗓️', color: 'green' },
    { title: 'سجلات الحضور', value: String(attendanceCount), change: '', changeType: 'positive', icon: '✅', color: 'blue' },
    { title: 'عدد التقييمات', value: String(reviewsCount), subtitle: `متوسط التقييم: ${reviewsCount ? averageRating : 0} ⭐`, change: '', changeType: 'positive', icon: '⭐', color: 'yellow' },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      yellow: 'from-yellow-500 to-yellow-600',
      indigo: 'from-indigo-500 to-indigo-600'
    };
    return colors[color as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  // Skeleton loader for stats cards
  const StatsCardSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow animate-pulse">
      <div className="flex items-center justify-between">
        <div className="w-full">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          <div className="h-7 w-20 bg-gray-300 dark:bg-gray-600 rounded mb-3 mt-2" />
          <div className="h-4 w-16 bg-gray-100 dark:bg-gray-800 rounded mb-2" />
          <div className="flex items-center mt-2">
            <div className="h-4 w-10 bg-gray-200 dark:bg-gray-700 rounded mr-2" />
            <div className="h-4 w-16 bg-gray-100 dark:bg-gray-800 rounded" />
          </div>
        </div>
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-white text-lg" />
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {loading
        ? Array.from({ length: stats.length }).map((_, idx) => <StatsCardSkeleton key={idx} />)
        : stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-2">
                    {stat.value}
                  </p>
                  {Boolean((stat as any).subtitle) && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {(stat as any).subtitle}
                    </p>
                  )}
                  <div className="flex items-center mt-2">
                    <span
                      className={`text-sm font-medium ${
                        stat.changeType === 'positive'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                      من الأسبوع الماضي
                    </span>
                  </div>
                </div>
                <div
                  className={`w-10 h-10 bg-gradient-to-r ${getColorClasses(stat.color)} rounded-lg flex items-center justify-center text-white text-lg`}
                >
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
    </div>
  );
};

export default TrainerStatsCards;
