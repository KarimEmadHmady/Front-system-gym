
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { UserService } from '@/services/userService';
import { useLoyaltyStats } from '@/hooks/useLoyaltyStats';
import { expenseService, revenueService } from '@/services';
import { getAllFeedback } from '@/services/feedbackService';
import { SessionScheduleService } from '@/services/sessionScheduleService';
import { messageService, invoiceService, workoutService, dietService } from '@/services';
import type { Feedback } from '@/types/models';
import type { SessionSchedule } from '@/types/models';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import MemberCrowdLevel from '../member/MemberCrowdLevel';

const userService = new UserService();
const sessionScheduleService = new SessionScheduleService();

// Tooltip مخصص لعرض عنوان الشهر بلون أسود
const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any;
  label?: string | number;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded shadow p-2 border border-gray-200">
        <div style={{ color: '#111', fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
          الشهر: {label}
        </div>
        {payload.map((entry: any, idx: number) => (
          <div key={idx} style={{ color: entry.color, fontSize: 13 }}>
            {entry.name}: ج.م{Number(entry.value).toLocaleString()}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Skeleton loader for stats cards
const StatsCardSkeleton = () => (
  <div
    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow animate-pulse"
  >
    <div className="flex items-center justify-between">
      <div className="w-full">
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <div className="h-7 w-20 bg-gray-300 dark:bg-gray-600 rounded mb-3 mt-2" />
        <div className="flex items-center mt-2">
          <div className="h-4 w-10 bg-gray-200 dark:bg-gray-700 rounded mr-2" />
          <div className="h-4 w-16 bg-gray-100 dark:bg-gray-800 rounded" />
        </div>
      </div>
      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-white text-xl" />
    </div>
  </div>
);

const ManagerStatsCards = () => {
  const t = useTranslations('AdminDashboard.Stats');
  const { loyaltyStats, loading: loyaltyLoading } = useLoyaltyStats();
  const [usersCount, setUsersCount] = useState<number>(0);
  const [trainersCount, setTrainersCount] = useState<number>(0);
  const [sessionsToday, setSessionsToday] = useState<number>(0);
  const [usersLoading, setUsersLoading] = useState(true);
  const [revMonth, setRevMonth] = useState<number>(0);
  const [expMonth, setExpMonth] = useState<number>(0);
  const [profitMonth, setProfitMonth] = useState<number>(0);
  const [monthlySeries, setMonthlySeries] = useState<Array<{ month: string; revenue: number; expense: number }>>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [newReviewsCount, setNewReviewsCount] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState<number>(0);
  const [invoicesCount, setInvoicesCount] = useState<number>(0);
  const [plansCount, setPlansCount] = useState<number>(0);
  const [newSubscriptionsSeries, setNewSubscriptionsSeries] = useState<Array<{ month: string; count: number }>>([]);
  const [usersList, setUsersList] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        // Users and trainers
        const usersRes = await userService.getUsers({ limit: 1000 });
        const usersArr = Array.isArray(usersRes) ? usersRes as any[] : (usersRes as any)?.data || [];
        setUsersList(usersArr);
        setUsersCount(usersArr.length || 0);
        setTrainersCount(usersArr.filter((u: any) => u.role === 'trainer').length || 0);

        // جلب ملخص الإيرادات والمصروفات الشهرية من الخدمات مباشرة
        const now = new Date();
        const from = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString().slice(0,10); // 6 شهور للخلف
        const to = new Date(now.getFullYear(), now.getMonth()+1, 0, 23,59,59,999).toISOString().slice(0,10);
        const [revSum, expSum] = await Promise.all([
          revenueService.summary({ from, to, sort: 'asc' }),
          expenseService.summary({ from, to, sort: 'asc' })
        ]);
        setRevMonth((revSum?.totals?.revenue) || 0);
        setExpMonth((expSum?.totals?.expense) || 0);
        setProfitMonth(((revSum?.totals?.revenue) || 0) - ((expSum?.totals?.expense) || 0));

        // بناء monthlySeries من البيانات الشهرية
        const monthsBack = 6;
        const monthly: Array<{ month: string; revenue: number; expense: number }> = [];
        for (let i = monthsBack-1; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const year = d.getFullYear();
          const month = d.getMonth() + 1;
          const label = `${String(month).padStart(2,'0')}/${String(year).slice(2)}`;
          // دعم كل الأشكال الممكنة للبيانات
          const revObj = (revSum?.monthly || []).find((m:any) => m.year === year && m.month === month);
          const expObj = (expSum?.monthly || []).find((m:any) => m.year === year && m.month === month);
          // @ts-ignore: backend may return .total instead of .revenue/.expense
          const rev = revObj?.revenue ?? (revObj as any)?.total ?? 0;
          // @ts-ignore: backend may return .total instead of .expense
          const exp = expObj?.expense ?? (expObj as any)?.total ?? 0;
          monthly.push({ month: label, revenue: rev, expense: exp });
        }
        // إذا لم توجد بيانات، استخدم بيانات الشهر الحالي فقط إذا وجدت
        const hasData = monthly.some(m => m.revenue > 0 || m.expense > 0);
        if (!hasData) {
          // جرب الشهر الحالي فقط
          const d = new Date(now.getFullYear(), now.getMonth(), 1);
          const year = d.getFullYear();
          const month = d.getMonth() + 1;
          const label = `${String(month).padStart(2,'0')}/${String(year).slice(2)}`;
          // ابحث عن أي بيانات في الشهر الحالي من أي مصدر
          const revObj = (revSum?.monthly || []).find((m:any) => m.year === year && m.month === month);
          const expObj = (expSum?.monthly || []).find((m:any) => m.year === year && m.month === month);
          const rev = revObj?.revenue ?? (revObj as any)?.total ?? 0;
          const exp = expObj?.expense ?? (expObj as any)?.total ?? 0;
          if (rev > 0 || exp > 0) {
            setMonthlySeries([{ month: label, revenue: rev, expense: exp }]);
          } else {
            // fallback: بيانات فيك للتجربة
            setMonthlySeries([
              { month: label, revenue: 12000, expense: 8000 }
            ]);
          }
        } else {
          // إذا لم توجد بيانات حقيقية في آخر 3 شهور، اعرض بيانات فيك
          const last3 = monthly.slice(-3);
          const hasRecentData = last3.some(m => m.revenue > 0 || m.expense > 0);
          if (!hasRecentData) {
            // fallback: بيانات فيك للتجربة
            setMonthlySeries([
              { month: '11/24', revenue: 12000, expense: 8000 },
              { month: '12/24', revenue: 15000, expense: 9000 },
              { month: '01/25', revenue: 18000, expense: 11000 },
              { month: '02/25', revenue: 17000, expense: 9500 },
              { month: '03/25', revenue: 21000, expense: 12000 },
              { month: '04/25', revenue: 25000, expense: 14000 },
            ]);
          } else {
            setMonthlySeries(monthly);
          }
        }
      } catch (error) {
        setMonthlySeries([
          { month: '11/24', revenue: 12000, expense: 8000 },
          { month: '12/24', revenue: 15000, expense: 9000 },
          { month: '01/25', revenue: 18000, expense: 11000 },
          { month: '02/25', revenue: 17000, expense: 9500 },
          { month: '03/25', revenue: 21000, expense: 12000 },
          { month: '04/25', revenue: 25000, expense: 14000 },
        ]);
      } finally {
        setUsersLoading(false);
      }
    })();
  }, []);

  // جلب التقييمات الجديدة ومتوسط التقييمات
  useEffect(() => {
    (async () => {
      setFeedbackLoading(true);
      try {
        const feedbackList = await getAllFeedback();
        setFeedbacks(feedbackList);
        // تقييمات الشهر الحالي
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();
        const newReviews = feedbackList.filter(fb => {
          const d = new Date(fb.date);
          return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
        });
        setNewReviewsCount(newReviews.length);
        // متوسط التقييمات
        const avg = feedbackList.length
          ? feedbackList.reduce((sum, fb) => sum + (fb.rating || 0), 0) / feedbackList.length
          : 0;
        setAvgRating(avg);
      } catch (e) {
        setNewReviewsCount(0);
        setAvgRating(0);
      } finally {
        setFeedbackLoading(false);
      }
    })();
  }, []);

  // جلب عدد الحصص اليومية
  useEffect(() => {
    (async () => {
      setSessionsLoading(true);
      try {
        const allSessions: SessionSchedule[] = await sessionScheduleService.getAllSessions();
        const todayStr = new Date().toISOString().split('T')[0];
        const todaySessions = allSessions.filter(s => {
          const sessionDate = new Date(s.date).toISOString().split('T')[0];
          return sessionDate === todayStr;
        });
        setSessionsToday(todaySessions.length);
      } catch (e) {
        setSessionsToday(0);
      } finally {
        setSessionsLoading(false);
      }
    })();
  }, []);

  // --- New: حساب عدد الاشتراكات الجديدة لكل شهر ---
  useEffect(() => {
    const now = new Date();
    const monthsBack = 6;
    const monthlySubs: Array<{ month: string; count: number }> = [];
    for (let i = monthsBack - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const label = `${String(month).padStart(2, '0')}/${String(year).slice(2)}`;
      const count = usersList.filter((u: any) => {
        if (!u.subscriptionStartDate) return false;
        const subDate = new Date(u.subscriptionStartDate);
        return subDate.getFullYear() === year && subDate.getMonth() + 1 === month;
      }).length;
      monthlySubs.push({ month: label, count });
    }
    setNewSubscriptionsSeries(monthlySubs);
  }, [usersList]);

  // --- New: الرسائل غير المقروءة ---
  useEffect(() => {
    let currentUserId = usersList[0]?._id; // مؤقتاً أول مستخدم (يجب استبداله بالمدير الحالي)
    if (currentUserId) {
      messageService.getUnreadCount(currentUserId).then(unread => setUnreadMessages(unread));
    }
  }, [usersList]);

  // --- New: عدد الفواتير ---
  useEffect(() => {
    (async () => {
      const invoicesRes = await invoiceService.getInvoices({ limit: 1 });
      setInvoicesCount((invoicesRes as any)?.count || (Array.isArray((invoicesRes as any)?.results) ? (invoicesRes as any)?.results.length : 0));
    })();
  }, []);

  // --- New: عدد الخطط (رياضية + غذائية) ---
  useEffect(() => {
    (async () => {
      const workoutPlansRes = await workoutService.getAllWorkoutPlans();
      const dietPlansRes = await dietService.getDietPlans();
      const workoutCount = Array.isArray((workoutPlansRes as any)?.results)
        ? (workoutPlansRes as any)?.results.length
        : (Array.isArray(workoutPlansRes) ? workoutPlansRes.length : 0);
      const dietCount = Array.isArray((dietPlansRes as any)?.results)
        ? (dietPlansRes as any)?.results.length
        : (Array.isArray(dietPlansRes) ? dietPlansRes.length : 0);
      setPlansCount(workoutCount + dietCount);
    })();
  }, []);

  const stats = [
    {
      title: t('totalMembers'),
      value: usersLoading ? '...' : usersCount.toLocaleString(),
      change: '+12%',
      changeType: 'positive',
      icon: '👥',
      color: 'blue'
    },
    {
      title: t('activeTrainers'),
      value: usersLoading ? '...' : trainersCount.toLocaleString(),
      change: '+3',
      changeType: 'positive',
      icon: '🏋️',
      color: 'green'
    },
    {
      title: t('dailySessions'),
      value: sessionsLoading ? '...' : sessionsToday.toLocaleString(),
      change: '+15%',
      changeType: 'positive',
      icon: '📅',
      color: 'purple'
    },


    {
      title: t('loyaltyPoints'),
      value: loyaltyLoading ? '...' : (loyaltyStats?.stats?.totalPoints || 0).toLocaleString(),
      change: '+8%',
      changeType: 'positive',
      icon: '⭐',
      color: 'indigo'
    },
    {
      title: t('newReviews'),
      value: feedbackLoading ? '...' : newReviewsCount.toLocaleString(),
      change: avgRating ? `${avgRating.toFixed(1)} ★` : '',
      changeType: 'positive',
      icon: '💬',
      color: 'pink'
    },
    {
      title: 'الرسائل غير المقروءة',
      value: usersLoading ? '...' : unreadMessages.toLocaleString(),
      change: '',
      changeType: 'positive',
      icon: '📩',
      color: 'yellow',
    },
    {
      title: 'عدد الفواتير',
      value: usersLoading ? '...' : invoicesCount.toLocaleString(),
      change: '',
      changeType: 'positive',
      icon: '🧾',
      color: 'red',
    },
    {
      title: 'عدد الخطط',
      value: usersLoading ? '...' : plansCount.toLocaleString(),
      change: '',
      changeType: 'positive',
      icon: '📋',
      color: 'purple',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      yellow: 'from-yellow-500 to-yellow-600',
      red: 'from-red-500 to-red-600',
      indigo: 'from-indigo-500 to-indigo-600',
      pink: 'from-pink-500 to-pink-600'
    };
    return colors[color as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {usersLoading
          ? Array.from({ length: stats.length }).map((_, idx) => <StatsCardSkeleton key={idx} />)
          : stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                      {stat.value}
                    </p>
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
                        {t('sinceLastMonth')}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`w-12 h-12 bg-gradient-to-r ${getColorClasses(stat.color)} rounded-lg flex items-center justify-center text-white text-xl`}
                  >
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
      </div>



      {/* Mini charts: New Subscriptions last 6 months */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
      <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-900 dark:text-white">الاشتراكات الجديدة (آخر 6 أشهر)</h4>
        </div>
        <div className="w-full overflow-x-auto">
          {(() => {
            const filtered = newSubscriptionsSeries.filter(m => m.count > 0);
            if (filtered.length === 0) {
              return (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  لا توجد بيانات اشتراكات متاحة لهذا الشهر أو الأشهر السابقة.
                </div>
              );
            }
            return (
              <div className="min-w-[420px]" style={{ direction: 'ltr' }}>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={filtered} margin={{ top: 16, right: 24, left: 8, bottom: 24 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#888' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#888' }} tickFormatter={(v: string | number) => v === 0 ? '' : v.toLocaleString()} />
                    <Tooltip content={({ active, payload, label }) => active && payload && payload.length ? (
                      <div className="bg-white rounded shadow p-2 border border-gray-200">
                        <div style={{ color: '#111', fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                          الشهر: {label}
                        </div>
                        {payload.map((entry: any, idx: number) => (
                          <div key={idx} style={{ color: entry.color, fontSize: 13 }}>
                            اشتراكات جديدة: {Number(entry.value).toLocaleString()}
                          </div>
                        ))}
                      </div>
                    ) : null} />
                    <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: 13 }} />
                    <Bar dataKey="count" name="اشتراكات جديدة" fill="#2563eb" radius={[6,6,0,0]} barSize={22} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            );
          })()}
        </div>
      </div>
      <div className="lg:col-span-1 mr-[10px]">
          <MemberCrowdLevel />
        </div>
      </div>

    </div>
  );
};

export default ManagerStatsCards;
