'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { SessionScheduleService } from '@/services/sessionScheduleService';
import { WorkoutService } from '@/services/workoutService';
import { DietService } from '@/services/dietService';
import { AttendanceService } from '@/services/attendanceService';
import { useLoyaltyStats } from '@/hooks/useLoyaltyStats';
import { UserService } from '@/services/userService';
import { expenseService, payrollService, revenueService } from '@/services';
import CustomAlert from '@/components/ui/CustomAlert';
import { useCustomAlert } from '@/hooks/useCustomAlert';
import VideoTutorial from '../../VideoTutorial';

import ReportCategories from './ReportCategories';
import FinancialReport from './FinancialReport';
import UsersReport from './UsersReport';
import SessionsReport from './SessionsReport';
import PlansReport from './PlansReport';
import AttendanceReport from './AttendanceReport';
import LoyaltyReport from './LoyaltyReport';
import ExportOptions from './ExportOptions';

const AdminReports = () => {
  const [activeReport, setActiveReport] = useState('financial');

  // --- المالية ---
  const [financialSummary, setFinancialSummary] = useState<any>(null);
  const [financialLoading, setFinancialLoading] = useState(true);
  const [financialError, setFinancialError] = useState<string | null>(null);

  // --- الرواتب ---
  const [payrollData, setPayrollData] = useState<any>(null);
  const [payrollLoading, setPayrollLoading] = useState(false);
  const [payrollError, setPayrollError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFinancial = async () => {
      setFinancialLoading(true);
      setFinancialError(null);
      try {
        const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
        const toISODate = (d: Date) => d.toISOString().split('T')[0];

        const now = new Date();
        const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const from = toISODate(startOfMonth(prev));
        const to = toISODate(endOfMonth(now));

        const [revSummary, expSummary] = await Promise.all([
          revenueService.summary({ from, to, sort: 'asc' } as any),
          expenseService.summary({ from, to, sort: 'asc' } as any),
        ]);

        const getMonthlyArray = (summary: any): any[] => {
          if (!summary || typeof summary !== 'object') return [];
          if (Array.isArray(summary.monthly)) return summary.monthly;
          if (Array.isArray(summary.data?.monthly)) return summary.data.monthly;
          if (Array.isArray(summary.results?.monthly)) return summary.results.monthly;
          if (Array.isArray(summary.stats?.monthly)) return summary.stats.monthly;
          return [];
        };

        const normalizeYearMonth = (i: any) => {
          const yRaw = i?.year ?? i?._id?.year;
          const mRaw = i?.month ?? i?._id?.month;
          const yNum = Number(yRaw);
          let mNum = Number(mRaw);

          if (Number.isNaN(yNum) || Number.isNaN(mNum)) {
            const id = i?._id;
            if (typeof id === 'string') {
              const m = id.match(/(\d{4})\D+(\d{1,2})/);
              if (m) return { y: Number(m[1]), m: Number(m[2]) };
            }
          }

          if (!Number.isNaN(mNum) && mNum >= 0 && mNum <= 11) mNum = mNum + 1;
          return { y: yNum, m: mNum };
        };

        const getValue = (item: any, key: 'revenue' | 'expense') => {
          if (!item) return 0;
          const direct = item[key];
          if (typeof direct === 'number') return direct;
          const maybeKeyTotal =
            key === 'revenue'
              ? (item.totalRevenue ?? item.revenueTotal ?? item.total_revenue)
              : (item.totalExpense ?? item.expenseTotal ?? item.total_expense);
          if (typeof maybeKeyTotal === 'number') return maybeKeyTotal;
          const maybeTotal = item.total ?? item.amount ?? item.value ?? item.sum;
          return typeof maybeTotal === 'number' ? maybeTotal : 0;
        };

        const revMonthly = getMonthlyArray(revSummary);
        const expMonthly = getMonthlyArray(expSummary);

        const merged = new Map<string, any>();
        for (const it of revMonthly) {
          const nm = normalizeYearMonth(it);
          const k = `${nm.y}-${nm.m}`;
          const prevVal = merged.get(k) || { year: nm.y, month: nm.m, revenue: 0, expense: 0, payroll: 0, netProfit: 0 };
          prevVal.revenue = getValue(it, 'revenue');
          merged.set(k, prevVal);
        }
        for (const it of expMonthly) {
          const nm = normalizeYearMonth(it);
          const k = `${nm.y}-${nm.m}`;
          const prevVal = merged.get(k) || { year: nm.y, month: nm.m, revenue: 0, expense: 0, payroll: 0, netProfit: 0 };
          prevVal.expense = getValue(it, 'expense');
          merged.set(k, prevVal);
        }
        const monthly = Array.from(merged.values())
          .map((m) => ({ ...m, netProfit: (m.revenue || 0) - (m.expense || 0) }))
          .sort((a, b) => (a.year - b.year) || (a.month - b.month));

        setFinancialSummary({ monthly });
      } catch (e: any) {
        console.error('Failed to load financial report summaries', e);
        setFinancialError(e?.message || 'فشل تحميل البيانات المالية');
      } finally {
        setFinancialLoading(false);
      }
    };
    if (activeReport === 'financial') fetchFinancial();
  }, [activeReport]);

  // --- المستخدمين ---
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const userService = new UserService();

  // جلب المستخدمين
  const fetchUsers = async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const res = await userService.getUsers({});
      let usersArr: any[] = [];
      if (Array.isArray(res)) {
        usersArr = res;
      } else if (Array.isArray(res.data)) {
        usersArr = res.data;
      }
      setUsers(usersArr);
      setUsersLoaded(true);
    } catch (err: any) {
      setUsersError(err?.message || 'فشل تحميل بيانات المستخدمين');
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  // جلب المستخدمين عند تحميل الصفحة
  useEffect(() => {
    fetchUsers();
  }, []);

  // جلب بيانات المستخدمين عند فتح تاب المستخدمين
  useEffect(() => {
    if (activeReport === 'users' && !usersLoaded) {
      fetchUsers();
    }
  }, [activeReport]);

  // جلب بيانات الرواتب
  useEffect(() => {
    const fetchPayroll = async () => {
      setPayrollLoading(true);
      setPayrollError(null);
      try {
        // استخدام payrollService للحصول على إجمالي الرواتب
        const summary = await payrollService.summary();
        setPayrollData({ totalPayroll: summary.totals.payroll || 0 });
      } catch (e: any) {
        setPayrollError('فشل تحميل بيانات الرواتب');
        // في حالة عدم وجود endpoint، نحسب من بيانات المستخدمين
        const totalPayroll = users
          .filter(u => u.role === 'trainer' || u.role === 'manager')
          .reduce((sum, user) => sum + (user.salary || 0), 0);
        setPayrollData({ totalPayroll });
      } finally {
        setPayrollLoading(false);
      }
    };
    if (activeReport === 'financial') fetchPayroll();
  }, [activeReport]);

  // --- الحصص ---
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  useEffect(() => {
    if (activeReport !== 'sessions') return;
    setSessionsLoading(true);
    setSessionsError(null);
    const service = new SessionScheduleService();
    service.getSessions({ limit: 100 }) // Use getSessions with limit instead of getAllSessions
      .then((data) => {
        const sessionsArray = Array.isArray(data) ? data : (data?.data || []);
        setSessions(sessionsArray);
      })
      .catch(() => setSessionsError('فشل تحميل بيانات الحصص'))
      .finally(() => setSessionsLoading(false));
  }, [activeReport]);

  // --- الخطط ---
  const [workoutPlans, setWorkoutPlans] = useState<any[]>([]);
  const [dietPlans, setDietPlans] = useState<any[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState<string | null>(null);
  useEffect(() => {
    if (activeReport !== 'plans') return;
    setPlansLoading(true);
    setPlansError(null);
    const workoutService = new WorkoutService();
    const dietService = new DietService();
    Promise.all([
      workoutService.getAllWorkoutPlans({ limit: 100 }),
      dietService.getDietPlans({ limit: 100 })
    ])
      .then(([workoutRes, dietRes]) => {
        const workoutArr = Array.isArray(workoutRes) ? workoutRes : (workoutRes?.data || []);
        const dietArr = Array.isArray(dietRes) ? dietRes : (dietRes?.data || []);
        console.log('Workout plans fetched:', workoutArr);
        console.log('Diet plans fetched:', dietArr);
        setWorkoutPlans(workoutArr);
        setDietPlans(dietArr);
      })
      .catch(() => setPlansError('فشل تحميل بيانات الخطط'))
      .finally(() => setPlansLoading(false));
  }, [activeReport]);

  const plansStats = useMemo(() => {
    if (!workoutPlans && !dietPlans) return null;
    const totalWorkout = workoutPlans.length;
    const totalDiet = dietPlans.length;
    const activeWorkout = workoutPlans.filter((p) => new Date(p.endDate) > new Date()).length;
    const activeDiet = dietPlans.filter((p) => !p.endDate || new Date(p.endDate) > new Date()).length;
    const endedWorkout = totalWorkout - activeWorkout;
    const endedDiet = totalDiet - activeDiet;
    return {
      totalWorkout,
      totalDiet,
      activeWorkout,
      activeDiet,
      endedWorkout,
      endedDiet,
      latestWorkout: workoutPlans.slice(0, 3),
      latestDiet: dietPlans.slice(0, 3)
    };
  }, [workoutPlans, dietPlans]);

  // --- الحضور ---
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);
  useEffect(() => {
    if (activeReport !== 'attendance') return;
    setAttendanceLoading(true);
    setAttendanceError(null);
    const attendanceService = new AttendanceService();
    attendanceService.getAttendanceRecords({ limit: 100 })
      .then((res) => {
        const arr = Array.isArray(res) ? res : (res?.data || []);
        setAttendanceRecords(arr);
      })
      .catch(() => setAttendanceError('فشل تحميل بيانات الحضور'))
      .finally(() => setAttendanceLoading(false));
  }, [activeReport]);

  // جلب بيانات المستخدمين المفقودين في الحضور
  useEffect(() => {
    if (!attendanceRecords || attendanceRecords.length === 0) return;
    const userService = new UserService();
    // استخرج كل userId غير الموجود في users
    const missingUserIds = Array.from(new Set(
      attendanceRecords
        .map((a) => a.userId)
        .filter((id) => id && !users.some((u) => u._id === id))
    ));
    if (missingUserIds.length === 0) return;
    Promise.all(
      missingUserIds.map((id) =>
        userService.getUser(id).catch(() => null)
      )
    ).then((fetched) => {
      // فلتر أكثر أماناً
      const validUsers = fetched.filter((u): u is any => !!u && !!u._id);
      if (validUsers.length > 0) {
        setUsers((prev) => ([...prev, ...validUsers.filter((u) => !prev.some((p) => p._id === u._id))]));
      }
    });
  }, [attendanceRecords, users]);

  const attendanceStats = useMemo(() => {
    if (!attendanceRecords || attendanceRecords.length === 0) return null;
    const total = attendanceRecords.length;
    const present = attendanceRecords.filter((a) => a.status === 'present').length;
    const absent = attendanceRecords.filter((a) => a.status === 'absent').length;
    const excused = attendanceRecords.filter((a) => a.status === 'excused').length;
    const attendanceRate = ((present / total) * 100).toFixed(1);
    // Top members by attendance
    const memberAttendance: Record<string, number> = {};
    attendanceRecords.forEach((a) => {
      memberAttendance[a.userId] = (memberAttendance[a.userId] || 0) + (a.status === 'present' ? 1 : 0);
    });
    const topMembers = Object.entries(memberAttendance)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([userId, count]) => ({ userId, count }));
    return { total, present, absent, excused, attendanceRate, topMembers, latest: attendanceRecords.slice(0, 3) };
  }, [attendanceRecords]);

  // --- الولاء ---
  const { loyaltyStats, loading: loyaltyLoading } = useLoyaltyStats();

  // --- حساب الإحصائيات ---
  // المستخدمين
  const userStats = useMemo(() => {
    if (!users || users.length === 0) return null;
    
    const total = users.length;
    const active = users.filter((u) => u.status === 'active').length;
    const inactive = users.filter((u) => u.status === 'inactive').length;
    
    // حساب المستخدمين الجدد هذا الشهر
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const newThisMonth = users.filter((u) => {
      if (!u.createdAt) return false;
      const created = new Date(u.createdAt);
      return created.getMonth() === currentMonth && created.getFullYear() === currentYear;
    }).length;
    
    // حساب النمو
    const growth = total > 0 ? ((newThisMonth / total) * 100).toFixed(1) : '0';
    
    return { 
      total, 
      active, 
      inactive, 
      newThisMonth, 
      growth 
    };
  }, [users]);

  // الحصص
  const sessionStats = useMemo(() => {
    if (!sessions || sessions.length === 0) return null;
    const total = sessions.length;
    const completed = sessions.filter((s) => s.status === 'مكتملة').length;
    const upcoming = sessions.filter((s) => s.status === 'مجدولة').length;
    const cancelled = sessions.filter((s) => s.status === 'ملغاة').length;
    const revenue = sessions.reduce((sum, s) => sum + (s.price || 0), 0);
    return { total, completed, upcoming, cancelled, revenue };
  }, [sessions]);

  // Helper: get user info by id
  const getUserInfo = (userId: string) => {
    const user = users.find((u) => u._id === userId);
    if (!user) return { name: `غير معروف (${userId})`, phone: '' };
    return { name: user.name, phone: user.phone || '' };
  };

  // --- التقارير ---
  const reports = [
    { id: 'financial', name: 'التقارير المالية', icon: '💰', description: 'تقارير شاملة عن الإيرادات والمصروفات والأرباح' },
    { id: 'users', name: 'تقارير المستخدمين', icon: '👥', description: 'إحصائيات مفصلة عن الأعضاء والمدربين' },
    { id: 'sessions', name: 'تقارير الحصص', icon: '🏋️', description: 'تحليل شامل للحصص التدريبية والإيرادات' },
    { id: 'plans', name: 'تقارير الخطط', icon: '📋', description: 'تقييم أداء خطط التمرين والغذائية' },
    { id: 'attendance', name: 'تقارير الحضور', icon: '📅', description: 'متابعة حضور الأعضاء وتقييم الالتزام' },
    { id: 'loyalty', name: 'تقارير نقاط الولاء', icon: '⭐', description: 'تحليل نظام نقاط الولاء والاسترداد' },
  ];

  const { alertState, showSuccess, showError, showWarning, hideAlert } = useCustomAlert();

  return (
    <div className="space-y-6">
      <VideoTutorial 
        videoId="2Ph0t1ONWak"
        title="تابع كل تقارير الجيم من مكان واحد" 
        position="bottom-right"
        buttonText="شرح"
      />

      {/* Report Categories */}
      <ReportCategories
        reports={reports}
        activeReport={activeReport}
        onSetActiveReport={setActiveReport}
      />

      {/* Report Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        {/* المالية */}
        {activeReport === 'financial' && (
          <FinancialReport
            financialSummary={financialSummary}
            financialLoading={financialLoading}
            financialError={financialError}
            payrollData={payrollData}
          />
        )}

        {/* المستخدمين */}
        {activeReport === 'users' && (
          <UsersReport
            users={users}
            usersLoading={usersLoading}
            usersError={usersError}
            usersLoaded={usersLoaded}
            userStats={userStats}
          />
        )}

        {/* الحصص */}
        {activeReport === 'sessions' && (
          <SessionsReport
            sessionsLoading={sessionsLoading}
            sessionsError={sessionsError}
            sessionStats={sessionStats}
          />
        )}

        {/* الخطط */}
        {activeReport === 'plans' && (
          <PlansReport
            plansLoading={plansLoading}
            plansError={plansError}
            plansStats={plansStats}
            getUserInfo={getUserInfo}
          />
        )}

        {/* الحضور */}
        {activeReport === 'attendance' && (
          <AttendanceReport
            attendanceLoading={attendanceLoading}
            attendanceError={attendanceError}
            attendanceStats={attendanceStats}
            getUserInfo={getUserInfo}
          />
        )}

        {/* الولاء */}
        {activeReport === 'loyalty' && (
          <LoyaltyReport
            loyaltyLoading={loyaltyLoading}
            loyaltyStats={loyaltyStats}
          />
        )}

        {/* Export Options */}
        <ExportOptions
          activeReport={activeReport}
          financialSummary={financialSummary}
          users={users}
          sessions={sessions}
          workoutPlans={workoutPlans}
          dietPlans={dietPlans}
          attendanceRecords={attendanceRecords}
          loyaltyStats={loyaltyStats}
          getUserInfo={getUserInfo}
          showSuccess={showSuccess}
          showWarning={showWarning}
          showError={showError}
        />
      </div>

      <CustomAlert
        isOpen={alertState.isOpen}
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
        onClose={hideAlert}
      />
    </div>
  );
};

export default AdminReports;
