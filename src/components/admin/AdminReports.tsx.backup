'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { SessionScheduleService } from '@/services/sessionScheduleService';
import { WorkoutService } from '@/services/workoutService';
import { DietService } from '@/services/dietService';
import { AttendanceService } from '@/services/attendanceService';
import { useLoyaltyStats } from '@/hooks/useLoyaltyStats';
import { UserService } from '@/services/userService';
import { expenseService, payrollService, revenueService } from '@/services';
import * as XLSX from 'xlsx';
import CustomAlert from '@/components/ui/CustomAlert';
import { useCustomAlert } from '@/hooks/useCustomAlert';
import VideoTutorial from '../VideoTutorial';

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
  // المالية: سنعرض ملخص الشهر الحالي فقط (يمكنك تطويره لاحقاً)
  let financialData = null;
  if (financialSummary && financialSummary.monthly && financialSummary.monthly.length > 0) {
    const latest = financialSummary.monthly[financialSummary.monthly.length - 1];
    const prev = financialSummary.monthly.length > 1 ? financialSummary.monthly[financialSummary.monthly.length - 2] : null;
    const growth = prev ? (((latest.revenue - prev.revenue) / (prev.revenue || 1)) * 100).toFixed(1) : '0';
    financialData = {
      monthly: {
        revenue: latest.revenue || 0,
        expenses: latest.expense || 0,
        profit: latest.netProfit || 0,
        payroll: latest.payroll || 0,
        growth: growth,
      },
      // يمكنك إضافة weekly/daily لو backend يدعم
    };
  }

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

  // دالة تصدير حسب التاب النشط
  const exportCurrentTabToExcel = () => {
    try {
      let exportData = [];
      let fileName = '';
      switch (activeReport) {
        case 'financial':
          if (financialSummary && financialSummary.monthly) {
            exportData = financialSummary.monthly.map((m: any) => ({
              'الشهر': m.month,
              'السنة': m.year,
              'الإيرادات': m.revenue,
              'المصروفات': m.expense,
              'الربح الصافي': m.netProfit,
              'الرواتب': m.payroll
            }));
            fileName = 'تقرير_المالية.xlsx';
          }
          break;
        case 'users':
          exportData = users.map((u: any) => ({
            'الاسم': u.name,
            'البريد الإلكتروني': u.email,
            'رقم الهاتف': u.phone,
            'الحالة': u.status === 'active' ? 'نشط' : 'غير نشط',
            'تاريخ التسجيل': u.createdAt ? new Date(u.createdAt).toLocaleDateString('ar-EG') : '',
            'الدور': u.role || '',
          }));
          fileName = 'تقرير_المستخدمين.xlsx';
          break;
        case 'sessions':
          exportData = sessions.map((s: any) => ({
            'نوع الحصة': s.sessionType || '',
            'المستخدم': getUserInfo(s.userId).name,
            'المدرب': getUserInfo(s.trainerId).name,
            'التاريخ': s.date ? new Date(s.date).toLocaleDateString('ar-EG') : '',
            'وقت البداية': s.startTime || '',
            'وقت النهاية': s.endTime || '',
            'المدة (دقيقة)': s.duration || 0,
            'السعر (ج.م)': s.price || 0,
            'الموقع': s.location || '',
            'الحالة': s.status || '',
            'الوصف': s.description || '',
          }));
          fileName = 'تقرير_الحصص.xlsx';
          break;
        case 'plans':
          exportData = [
            ...workoutPlans.map((plan: any) => ({
              'نوع الخطة': 'تمرين',
              'اسم الخطة': plan.planName,
              'المستخدم': getUserInfo(plan.userId).name,
              'تاريخ البداية': plan.startDate ? new Date(plan.startDate).toLocaleDateString('ar-EG') : '',
              'تاريخ النهاية': plan.endDate ? new Date(plan.endDate).toLocaleDateString('ar-EG') : '',
            })),
            ...dietPlans.map((plan: any) => ({
              'نوع الخطة': 'غذائية',
              'اسم الخطة': plan.planName,
              'المستخدم': getUserInfo(plan.userId).name,
              'تاريخ البداية': plan.startDate ? new Date(plan.startDate).toLocaleDateString('ar-EG') : '',
              'تاريخ النهاية': plan.endDate ? new Date(plan.endDate).toLocaleDateString('ar-EG') : '',
            })),
          ];
          fileName = 'تقرير_الخطط.xlsx';
          break;
        case 'attendance':
          exportData = attendanceRecords.map((a: any) => ({
            'الاسم': getUserInfo(a.userId).name,
            'رقم الهاتف': getUserInfo(a.userId).phone,
            'التاريخ': a.date ? new Date(a.date).toLocaleDateString('ar-EG') : '',
            'الحالة': a.status === 'present' ? 'حضور' : a.status === 'absent' ? 'غياب' : 'إعفاء',
          }));
          fileName = 'تقرير_الحضور.xlsx';
          break;
        case 'loyalty':
          if (loyaltyStats && loyaltyStats.topUsers) {
            exportData = loyaltyStats.topUsers.map((u: any) => ({
              'الاسم': u.name,
              'رقم الهاتف': u.phone,
              'نقاط الولاء': u.loyaltyPoints,
              'مستوى العضوية': u.membershipLevel,
            }));
            fileName = 'تقرير_الولاء.xlsx';
          }
          break;
        default:
          showWarning('تنبيه', 'يرجى اختيار تقرير صالح');
          return;
      }
      if (!exportData || exportData.length === 0) {
        showWarning('تنبيه', 'لا توجد بيانات متاحة للتصدير');
        return;
      }
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'تقرير');
      worksheet['!cols'] = Object.keys(exportData[0]).map(() => ({ wch: 20 }));
      XLSX.writeFile(workbook, fileName);
      showSuccess('تم التصدير بنجاح', `تم تصدير ${exportData.length} سجل بنجاح`);
    } catch (error) {
      console.error('خطأ في التصدير:', error);
      showError('خطأ في التصدير', 'حدث خطأ أثناء تصدير التقرير');
    }
  };

  return (
    <div className="space-y-6">
            <VideoTutorial 
              videoId="2Ph0t1ONWak"
              title="تابع كل تقارير الجيم من مكان واحد" 
              position="bottom-right"
              buttonText="شرح"
            />
      {/* Report Categories */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">أنواع التقارير</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report) => (
            <button
              key={report.id}
              onClick={() => setActiveReport(report.id)}
              className={`p-4 rounded-lg border-2 text-right transition-all ${activeReport === report.id ? 'border-gray-500 bg-gray-50 dark:bg-gray-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
            >
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-3">{report.icon}</span>
                <h4 className="font-medium text-gray-900 dark:text-white">{report.name}</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{report.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Report Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        {/* المالية */}
        {activeReport === 'financial' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">التقارير المالية</h3>
            {financialLoading ? (
              <div className="text-center py-8 text-gray-600">جاري التحميل...</div>
            ) : financialError ? (
              <div className="text-center py-8 text-red-600">{financialError}</div>
            ) : !financialData ? (
              <div className="text-center py-8 text-gray-500">لا توجد بيانات مالية متاحة</div>
            ) : (
              <>
                {/* Financial Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">الإيرادات</h4>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      ج.م{financialData.monthly.revenue.toLocaleString()}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      +{financialData.monthly.growth}% من الشهر الماضي
                    </p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                    <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">المصروفات</h4>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      ج.م{financialData.monthly.expenses.toLocaleString()}
                    </p>
                    {/* لا يوجد نمو المصروفات في الداتا الحقيقية هنا */}
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">الربح الصافي</h4>
                    <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                      ج.م{financialData.monthly.profit.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">الرواتب</h4>
                    <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                      ج.م{(payrollData?.totalPayroll || 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      إجمالي رواتب الموظفين
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* المستخدمين */}
        {activeReport === 'users' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">تقارير المستخدمين</h3>
            {usersLoading ? (
              <div className="text-center py-8 text-gray-600">جاري التحميل...</div>
            ) : usersError ? (
              <div className="text-center py-8 text-red-600">{usersError}</div>
            ) : !usersLoaded ? (
              <div className="text-center py-8 text-gray-500">جاري تحميل بيانات المستخدمين...</div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">لا توجد بيانات مستخدمين متاحة</div>
            ) : !userStats ? (
              <div className="text-center py-8 text-gray-500">جاري حساب الإحصائيات...</div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg flex flex-col items-center">
                    <span className="text-3xl mb-2">👥</span>
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">إجمالي المستخدمين</h4>
                    <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{userStats.total}</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg flex flex-col items-center">
                    <span className="text-3xl mb-2">✅</span>
                    <h4 className="font-medium text-green-800 dark:text-green-200 mb-1">النشطين</h4>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{userStats.active}</p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg flex flex-col items-center">
                    <span className="text-3xl mb-2">🚫</span>
                    <h4 className="font-medium text-red-800 dark:text-red-200 mb-1">غير النشطين</h4>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">{userStats.inactive}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg flex flex-col items-center">
                    <span className="text-3xl mb-2">🆕</span>
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">جدد هذا الشهر</h4>
                    <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{userStats.newThisMonth}</p>
                  </div>
                </div>
                {/* جدول أحدث الأعضاء */}
                <div className="overflow-x-auto rounded-lg shadow border border-gray-200 dark:border-gray-700">
                  <table className="min-w-full bg-white dark:bg-gray-800">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm">
                        <th className="py-2 px-4 text-center">الاسم</th>
                        <th className="py-2 px-4 text-center">الإيميل</th>
                        <th className="py-2 px-4 text-center">رقم الهاتف</th>
                        <th className="py-2 px-4 text-center">الحالة</th>
                        <th className="py-2 px-4 text-center">تاريخ التسجيل</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users
                        .slice()
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .slice(0, 8)
                        .map((user) => (
                          <tr key={user._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                            <td className="py-2 px-4 font-medium text-center">{user.name}</td>
                            <td className="py-2 px-4 text-center">{user.email}</td>
                            <td className="py-2 px-4 text-center">{user.phone || '-'}</td>
                            <td className="py-2 px-4 text-center">
                              <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {user.status === 'active' ? 'نشط' : 'غير نشط'}
                              </span>
                            </td>
                            <td className="py-2 px-4 text-center">{new Date(user.createdAt).toLocaleDateString('ar-EG')}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* الحصص */}
        {activeReport === 'sessions' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">تقارير الحصص</h3>
            {sessionsLoading ? (
              <div className="text-center py-8 text-gray-600">جاري التحميل...</div>
            ) : sessionsError ? (
              <div className="text-center py-8 text-red-600">{sessionsError}</div>
            ) : !sessionStats ? (
              <div className="text-center py-8 text-gray-500">لا توجد بيانات حصص متاحة</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">إجمالي الحصص</h4>
                  <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{sessionStats.total}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">المكتملة</h4>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{sessionStats.completed}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">القادمة</h4>
                  <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{sessionStats.upcoming}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">إيرادات الحصص</h4>
                  <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">ج.م{sessionStats.revenue}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* الخطط */}
        {activeReport === 'plans' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">تقارير الخطط</h3>
            {plansLoading ? (
              <div className="text-center py-8 text-gray-600">جاري التحميل...</div>
            ) : plansError ? (
              <div className="text-center py-8 text-red-600">{plansError}</div>
            ) : !plansStats ? (
              <div className="text-center py-8 text-gray-500">لا توجد بيانات خطط متاحة</div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg flex flex-col items-center">
                    <span className="text-3xl mb-2">🏋️</span>
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">إجمالي خطط التمرين</h4>
                    <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{plansStats.totalWorkout}</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg flex flex-col items-center">
                    <span className="text-3xl mb-2">✅</span>
                    <h4 className="font-medium text-green-800 dark:text-green-200 mb-1">الخطط النشطة (تمرين)</h4>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{plansStats.activeWorkout}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg flex flex-col items-center">
                    <span className="text-3xl mb-2">⏰</span>
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">الخطط المنتهية (تمرين)</h4>
                    <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{plansStats.endedWorkout}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg flex flex-col items-center">
                    <span className="text-3xl mb-2">🥗</span>
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">إجمالي خطط التغذية</h4>
                    <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{plansStats.totalDiet}</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg flex flex-col items-center">
                    <span className="text-3xl mb-2">✅</span>
                    <h4 className="font-medium text-green-800 dark:text-green-200 mb-1">الخطط النشطة (غذائية)</h4>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{plansStats.activeDiet}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg flex flex-col items-center">
                    <span className="text-3xl mb-2">⏰</span>
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">الخطط المنتهية (غذائية)</h4>
                    <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{plansStats.endedDiet}</p>
                  </div>
                </div>
                {/* أحدث الخطط */}
                <div className="mt-6 space-y-6">
                  {/* أحدث خطط التمرين */}
                  <div className="overflow-x-auto rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-4 p-4 bg-gray-50 dark:bg-gray-700">أحدث خطط التمرين</h4>
                    <table className="min-w-full bg-white dark:bg-gray-800">
                      <thead>
                        <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm">
                          <th className="py-2 px-4 text-center">اسم الخطة</th>
                          <th className="py-2 px-4 text-center">المستخدم</th>
                          <th className="py-2 px-4 text-center">رقم الهاتف</th>
                          <th className="py-2 px-4 text-center">تاريخ البداية</th>
                          <th className="py-2 px-4 text-center">تاريخ النهاية</th>
                        </tr>
                      </thead>
                      <tbody>
                        {plansStats.latestWorkout.map((plan: any) => {
                          const info = getUserInfo(plan.userId);
                          return (
                            <tr key={plan._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                              <td className="py-2 px-4 font-medium text-center">{plan.planName}</td>
                              <td className="py-2 px-4 text-center">{info.name}</td>
                              <td className="py-2 px-4 text-center">{info.phone || '-'}</td>
                              <td className="py-2 px-4 text-center">{plan.startDate ? new Date(plan.startDate).toLocaleDateString('ar-EG') : '-'}</td>
                              <td className="py-2 px-4 text-center">{plan.endDate ? new Date(plan.endDate).toLocaleDateString('ar-EG') : '-'}</td>
                            </tr>
                          );
                        })}
                        {plansStats.latestWorkout.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-6 text-center text-gray-500">لا توجد خطط تمرين</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* أحدث خطط التغذية */}
                  <div className="overflow-x-auto rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-4 p-4 bg-gray-50 dark:bg-gray-700">أحدث خطط التغذية</h4>
                    <table className="min-w-full bg-white dark:bg-gray-800">
                      <thead>
                        <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm">
                          <th className="py-2 px-4 text-center">اسم الخطة</th>
                          <th className="py-2 px-4 text-center">المستخدم</th>
                          <th className="py-2 px-4 text-center">رقم الهاتف</th>
                          <th className="py-2 px-4 text-center">تاريخ البداية</th>
                          <th className="py-2 px-4 text-center">تاريخ النهاية</th>
                        </tr>
                      </thead>
                      <tbody>
                        {plansStats.latestDiet.map((plan: any) => {
                          const info = getUserInfo(plan.userId);
                          return (
                            <tr key={plan._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                              <td className="py-2 px-4 font-medium text-center">{plan.planName}</td>
                              <td className="py-2 px-4 text-center">{info.name}</td>
                              <td className="py-2 px-4 text-center">{info.phone || '-'}</td>
                              <td className="py-2 px-4 text-center">{plan.startDate ? new Date(plan.startDate).toLocaleDateString('ar-EG') : '-'}</td>
                              <td className="py-2 px-4 text-center">{plan.endDate ? new Date(plan.endDate).toLocaleDateString('ar-EG') : '-'}</td>
                            </tr>
                          );
                        })}
                        {plansStats.latestDiet.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-6 text-center text-gray-500">لا توجد خطط تغذية</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        {/* الحضور */}
        {activeReport === 'attendance' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">تقارير الحضور</h3>
            {attendanceLoading ? (
              <div className="text-center py-8 text-gray-600">جاري التحميل...</div>
            ) : attendanceError ? (
              <div className="text-center py-8 text-red-600">{attendanceError}</div>
            ) : !attendanceStats ? (
              <div className="text-center py-8 text-gray-500">لا توجد بيانات حضور متاحة</div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg flex flex-col items-center">
                    <span className="text-3xl mb-2">📅</span>
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">إجمالي السجلات</h4>
                    <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{attendanceStats.total}</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg flex flex-col items-center">
                    <span className="text-3xl mb-2">✅</span>
                    <h4 className="font-medium text-green-800 dark:text-green-200 mb-1">الحضور</h4>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{attendanceStats.present}</p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg flex flex-col items-center">
                    <span className="text-3xl mb-2">🚫</span>
                    <h4 className="font-medium text-red-800 dark:text-red-200 mb-1">الغياب</h4>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">{attendanceStats.absent}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg flex flex-col items-center">
                    <span className="text-3xl mb-2">📝</span>
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">إعفاءات</h4>
                    <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{attendanceStats.excused}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg flex flex-col items-center">
                    <span className="text-3xl mb-2">📈</span>
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">نسبة الالتزام</h4>
                    <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{attendanceStats.attendanceRate}%</p>
                  </div>
                </div>
                {/* Top members */}
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-center bg-gray-500 py-2">الأعضاء الأكثر التزامًا</h4>
                  <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm">
                        <th className="py-2 px-4">الاسم</th>
                        <th className="py-2 px-4">رقم الهاتف</th>
                        <th className="py-2 px-4">عدد الحضور</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceStats.topMembers.map((m: any) => {
                        const info = getUserInfo(m.userId);
                        return (
                          <tr key={m.userId} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-center">
                            <td className="py-2 px-4 font-medium text-center">{info.name}</td>
                            <td className="py-2 px-4 text-center">{info.phone || '-'}</td>
                            <td className="py-2 px-4 text-center">{m.count}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <h4 className="font-medium text-gray-900 dark:text-white mt-4 mb-2 text-center bg-gray-500 py-2">أحدث سجلات الحضور</h4>
                  <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm">
                        <th className="py-2 px-4">الاسم</th>
                        <th className="py-2 px-4">رقم الهاتف</th>
                        <th className="py-2 px-4">الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceStats.latest.map((a: any) => {
                        const info = getUserInfo(a.userId);
                        return (
                          <tr key={a._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-center">
                            <td className="py-2 px-4 font-medium text-center">{info.name}</td>
                            <td className="py-2 px-4 text-center">{info.phone || '-'}</td>
                            <td className="py-2 px-4 text-center">{a.status === 'present' ? 'حضور' : a.status === 'absent' ? 'غياب' : 'إعفاء'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
        {/* الولاء */}
        {activeReport === 'loyalty' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">تقارير نقاط الولاء</h3>
            {loyaltyLoading ? (
              <div className="text-center py-8 text-gray-600">جاري التحميل...</div>
            ) : !loyaltyStats ? (
              <div className="text-center py-8 text-gray-500">لا توجد بيانات ولاء متاحة</div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">إجمالي النقاط</h4>
                    <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{loyaltyStats.stats.totalPoints}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">عدد المستخدمين</h4>
                    <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{loyaltyStats.stats.totalUsers}</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">متوسط النقاط</h4>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{loyaltyStats.stats.avgPoints}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">أعلى نقاط</h4>
                    <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{loyaltyStats.stats.maxPoints}</p>
                  </div>
                </div>
                {/* Top users */}
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">أعلى المستخدمين بالنقاط</h4>
                  <div className="overflow-x-auto rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full bg-white dark:bg-gray-800">
                      <thead>
                        <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm">
                          <th className="py-2 px-4 text-center">الترتيب</th>
                          <th className="py-2 px-4 text-center">اسم المستخدم</th>
                          <th className="py-2 px-4 text-center">رقم الهاتف</th>
                          <th className="py-2 px-4 text-center">نقاط الولاء</th>
                          <th className="py-2 px-4 text-center">مستوى العضوية</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loyaltyStats.topUsers?.slice(0, 5).map((u: any, index: number) => (
                          <tr key={u._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                            <td className="py-2 px-4 text-center">
                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                                index === 0 ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' :
                                index === 1 ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' :
                                index === 2 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                                'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                              }`}>
                                {index + 1}
                              </span>
                            </td>
                            <td className="py-2 px-4 font-medium text-center">{u.name}</td>
                            <td className="py-2 px-4 text-center">{u.phone || '-'}</td>
                            <td className="py-2 px-4 text-center">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                                {u.loyaltyPoints} نقطة
                              </span>
                            </td>
                            <td className="py-2 px-4 text-center">
                              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                                u.membershipLevel === 'premium' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' :
                                u.membershipLevel === 'gold' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' :
                                'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                              }`}>
                                {u.membershipLevel === 'premium' ? 'مميز' :
                                 u.membershipLevel === 'gold' ? 'ذهبي' :
                                 u.membershipLevel === 'silver' ? 'فضي' : 'أساسي'}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {(!loyaltyStats.topUsers || loyaltyStats.topUsers.length === 0) && (
                          <tr>
                            <td colSpan={5} className="py-6 text-center text-gray-500">لا توجد بيانات مستخدمين</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Export Options */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-gray-900 dark:text-white mb-4">تصدير التقرير</h4>
          <div className="flex space-x-4">
            <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition-colors" onClick={exportCurrentTabToExcel}>
              تصدير Excel
            </button>
          </div>
        </div>
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
