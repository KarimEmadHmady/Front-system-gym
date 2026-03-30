'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { attendanceService, sessionScheduleService, workoutService, dietService, messageService, loyaltyService } from '@/services';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from 'recharts';

const MemberStatsCards = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [sessionsCount, setSessionsCount] = useState(0);
  const [trainingHours, setTrainingHours] = useState(0);
  const [workoutPlansCount, setWorkoutPlansCount] = useState(0);
  const [dietPlansCount, setDietPlansCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);

  useEffect(() => {
    const userId = (user as any)?.id || (user as any)?._id;
    if (!userId) return;

    setLoading(true);

    (async () => {
      try {
        // Fetch in parallel where possible
        const [
          attendanceRes,
          sessionsRes,
          workoutRes,
          dietRes,
          unreadCount,
          myPointsRes
        ] = await Promise.all([
          attendanceService.getUserAttendance(userId, { page: 1, limit: 1000 } as any).catch(() => ({ data: [] } as any)),
          sessionScheduleService.getSessionsByUser(userId).catch(() => []),
          workoutService.getUserWorkoutPlans(userId, { page: 1, limit: 1000 } as any).catch(() => ({ data: [] } as any)),
          dietService.getUserDietPlans(userId, { page: 1, limit: 1000 } as any).catch(() => ({ data: [] } as any)),
          messageService.getUnreadCount(userId).catch(() => 0),
          loyaltyService.getMyPointsWithLevel().catch(() => null)
        ]);

        const attendanceList: any[] = Array.isArray(attendanceRes) ? (attendanceRes as any) : ((attendanceRes as any)?.data || []);
        const sessionsList: any[] = Array.isArray(sessionsRes) ? (sessionsRes as any) : [];
        const workoutList: any[] = Array.isArray((workoutRes as any)?.data) ? (workoutRes as any).data : (Array.isArray(workoutRes) ? (workoutRes as any) : []);
        const dietList: any[] = Array.isArray((dietRes as any)?.data) ? (dietRes as any).data : (Array.isArray(dietRes) ? (dietRes as any) : []);

        setAttendanceCount(attendanceList.length || 0);
        setSessionsCount(sessionsList.length || 0);

        // Sum durations for completed sessions to get training hours
        const totalMinutes = (sessionsList || [])
          .filter((s: any) => ['مكتملة', 'completed'].includes(String(s?.status || '').toLowerCase()) || String(s?.status || '') === 'مكتملة')
          .reduce((sum: number, s: any) => sum + (Number(s?.duration) || 0), 0);
        setTrainingHours(Math.round(totalMinutes / 60));

        setWorkoutPlansCount(workoutList.length || 0);
        setDietPlansCount(dietList.length || 0);
        setUnreadMessages(Number(unreadCount) || 0);
        setLoyaltyPoints(Number((myPointsRes as any)?.user?.loyaltyPoints || 0));
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const attendancePercentage = useMemo(() => {
    if (!sessionsCount) return 0;
    const ratio = (attendanceCount / sessionsCount) * 100;
    return Math.round(ratio);
  }, [attendanceCount, sessionsCount]);

  const activePlansTotal = (workoutPlansCount || 0) + (dietPlansCount || 0);

  // Chart data
  const attendanceChartData = [
    { name: 'حضور', value: attendanceCount },
    { name: 'غياب', value: Math.max(sessionsCount - attendanceCount, 0) }
  ];

  const plansChartData = [
    { name: 'تمرين', value: workoutPlansCount },
    { name: 'غذائي', value: dietPlansCount }
  ];

  const barsData = [
    { name: 'ساعات التدريب', value: trainingHours },
    { name: 'رسائل غير مقروء', value: unreadMessages },
    { name: 'نقاط الولاء', value: loyaltyPoints }
  ];

  const PIE_COLORS = ['#10B981', '#EF4444'];
  const PIE_COLORS_PLANS = ['#6366F1', '#F59E0B'];
  const BAR_COLORS = ['#8B5CF6', '#F97316', '#10B981'];
  const METRIC_UNITS: Record<string, string> = {
    'ساعات التدريب': 'ساعة',
    'رسائل غير مقروء': 'رسالة',
    'نقاط الولاء': 'نقطة'
  };

  // Skeleton loader for main cards/charts
  const ChartSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
      <div className="flex items-center justify-between mb-2">
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-3 w-12 bg-gray-100 dark:bg-gray-800 rounded" />
      </div>
      <div className="h-48 flex items-center justify-center">
        <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-full" />
      </div>
      <div className="mt-2 mx-auto h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  );

  const BarChartSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
      <div className="flex items-center justify-between mb-2">
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-3 w-32 bg-gray-100 dark:bg-gray-800 rounded" />
      </div>
      <div className="h-48 flex items-center justify-center w-full">
        <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );

  const DetailSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 animate-pulse">
      <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
      <div className="h-6 w-10 bg-gray-300 dark:bg-gray-600 rounded" />
    </div>
  );

  const LoyaltySkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 col-span-3 xl:col-span-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <div className="h-3 w-10 bg-gray-100 dark:bg-gray-800 rounded mb-2" />
      </div>
      <div className="h-7 w-20 bg-gray-300 dark:bg-gray-600 rounded mt-2" />
    </div>
  );

  // Skeleton loader for details grid card (covers whole card)
  const DetailsCardSkeleton = () => (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 animate-pulse flex flex-col justify-between min-h-[64px]">
      <div className="h-3 w-20 bg-gray-300 dark:bg-gray-700 rounded mb-2" />
      <div className="h-6 w-14 bg-gray-200 dark:bg-gray-600 rounded" />
    </div>
  );
  const LoyaltyCardSkeleton = () => (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 col-span-3 xl:col-span-6 animate-pulse min-h-[64px]">
      <div className="flex items-center justify-between mb-2">
        <div className="h-3 w-20 bg-gray-300 dark:bg-gray-700 rounded" />
        <div className="h-3 w-10 bg-gray-200 dark:bg-gray-800 rounded" />
      </div>
      <div className="h-7 w-24 bg-gray-200 dark:bg-gray-600 rounded mt-2" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {loading ? (
          <>
            <ChartSkeleton />
            <ChartSkeleton />
            <BarChartSkeleton />
          </>
        ) : (
          <>
            {/* Attendance Donut */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">نسبة الحضور</h4>
                <span className="text-xs text-gray-500 dark:text-gray-400">{loading ? '...' : `${attendanceCount} / ${sessionsCount}`}</span>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={attendanceChartData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {attendanceChartData.map((entry, index) => (
                        <Cell key={`att-cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val: any, name: any) => [`${val}`, name]} />
                    <Legend verticalAlign="bottom" height={24} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 text-center text-lg font-extrabold text-gray-900 dark:text-white">
                {loading ? '...' : `${attendancePercentage}%`}
              </div>
            </div>
            {/* Plans Donut */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">الخطط النشطة</h4>
                <span className="text-xs text-gray-500 dark:text-gray-400">{loading ? '...' : activePlansTotal}</span>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={plansChartData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {plansChartData.map((entry, index) => (
                        <Cell key={`plan-cell-${index}`} fill={PIE_COLORS_PLANS[index % PIE_COLORS_PLANS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val: any, name: any) => [`${val}`, name]} />
                    <Legend verticalAlign="bottom" height={24} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 text-center text-xs text-gray-600 dark:text-gray-300">
                {loading ? '' : `تمرين: ${workoutPlansCount} • غذائي: ${dietPlansCount}`}
              </div>
            </div>
            {/* Bars: Training Hours, Unread Messages, Loyalty Points */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">نظرة عامة</h4>
                <span className="text-xs text-gray-500 dark:text-gray-400">ساعات التدريب • الرسائل غير المقروءة • نقاط الولاء</span>
              </div>
              <div className="flex items-center flex-wrap gap-3 mb-2">
                {barsData.map((m, idx) => (
                  <div key={m.name} className="flex items-center text-xs text-gray-600 dark:text-gray-300">
                    <span className="inline-block w-3 h-3 rounded-sm mr-1" style={{ backgroundColor: BAR_COLORS[idx % BAR_COLORS.length] }} />
                    <span>{m.name}</span>
                  </div>
                ))}
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barsData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(107,114,128,0.2)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(v: any, _name: any, item: any) => {
                        const metricName = item?.payload?.name as string;
                        const unit = METRIC_UNITS[metricName] || metricName || '';
                        return [`${v}`, unit];
                      }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {barsData.map((entry, index) => (
                        <Cell key={`bar-cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                      ))}
                      <LabelList dataKey="value" position="top" style={{ fontSize: 11 }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
      {/* Details Grid Under Charts */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {loading ? (
          <>
            <DetailsCardSkeleton />
            <DetailsCardSkeleton />
            <DetailsCardSkeleton />
            <DetailsCardSkeleton />
            <DetailsCardSkeleton />
            <DetailsCardSkeleton />
            <LoyaltyCardSkeleton />
          </>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 flex flex-col justify-between min-h-[64px]">
              <p className="text-[11px] text-gray-500 dark:text-gray-400">إجمالي الحصص</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">{sessionsCount}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 flex flex-col justify-between min-h-[64px]">
              <p className="text-[11px] text-gray-500 dark:text-gray-400">الحصص المكتملة</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">{attendanceCount}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 flex flex-col justify-between min-h-[64px]">
              <p className="text-[11px] text-gray-500 dark:text-gray-400">خطط التمرين</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">{workoutPlansCount}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 flex flex-col justify-between min-h-[64px]">
              <p className="text-[11px] text-gray-500 dark:text-gray-400">الخطط الغذائية</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">{dietPlansCount}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 flex flex-col justify-between min-h-[64px]">
              <p className="text-[11px] text-gray-500 dark:text-gray-400">ساعات التدريب</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">{trainingHours}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 flex flex-col justify-between min-h-[64px]">
              <p className="text-[11px] text-gray-500 dark:text-gray-400">رسائل غير مقروءة</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">{unreadMessages}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 col-span-3 xl:col-span-6 min-h-[64px]">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] text-gray-500 dark:text-gray-400">نقاط الولاء</p>
                <span className="text-[11px] text-gray-500 dark:text-gray-400">إجمالي</span>
              </div>
              <p className="text-xl font-extrabold text-gray-900 dark:text-white mt-0.5">{new Intl.NumberFormat().format(loyaltyPoints)}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MemberStatsCards;
