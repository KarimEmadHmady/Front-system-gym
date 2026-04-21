'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { SessionScheduleService } from '@/services/sessionScheduleService';
import { apiGet } from '@/lib/api';
import { WorkoutService } from '@/services/workoutService';
import { DietService } from '@/services/dietService';
import { AttendanceService } from '@/services/attendanceService';
import { useLoyaltyStats } from '@/hooks/useLoyaltyStats';
import { UserService } from '@/services/userService';
import { payrollService } from '@/services';
import CustomAlert from '@/components/ui/CustomAlert';
import { useCustomAlert } from '@/hooks/useCustomAlert';

// Import extracted components
import ReportCategories from './ReportCategories';
import UsersReport from './UsersReport';
import SessionsReport from './SessionsReport';
import PlansReport from './PlansReport';
import AttendanceReport from './AttendanceReport';
import LoyaltyReport from './LoyaltyReport';
import FinancialReport from './FinancialReport';
import ExportOptions from './ExportOptions';
import { setUsersCache, getUserInfo } from './userUtils';

const ManagerReports = () => {
  const [activeReport, setActiveReport] = useState('users');

  // --- المالية ---
  const [financialSummary, setFinancialSummary] = useState<any>(null);
  const [financialLoading, setFinancialLoading] = useState(true);
  const [financialError, setFinancialError] = useState<string | null>(null);

  // --- الرواتب ---
  const [payrollData, setPayrollData] = useState<any>(null);
  const [payrollLoading, setPayrollLoading] = useState(false);
  const [payrollError, setPayrollError] = useState<string | null>(null);

  // --- المستخدمين ---
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const userService = new UserService();

  // --- الحصص ---
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState<string | null>(null);

  // --- الخطط ---
  const [workoutPlans, setWorkoutPlans] = useState<any[]>([]);
  const [dietPlans, setDietPlans] = useState<any[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState<string | null>(null);

  // --- الحضور ---
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);

  // Data fetching functions
  const fetchFinancial = async () => {
    setFinancialLoading(true);
    setFinancialError(null);
    try {
      const data = await apiGet<any>('/financial/summary');
      setFinancialSummary(data);
    } catch (e: any) {
      setFinancialError('فشل تحميل البيانات المالية');
    } finally {
      setFinancialLoading(false);
    }
  };

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
      setUsersCache(usersArr);
    } catch (err: any) {
      setUsersError(err?.message || 'فشل تحميل بيانات المستخدمين');
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchPayroll = async () => {
    setPayrollLoading(true);
    setPayrollError(null);
    try {
      const summary = await payrollService.summary();
      setPayrollData({ totalPayroll: summary.totals.payroll || 0 });
    } catch (e: any) {
      setPayrollError('فشل تحميل بيانات الرواتب');
      const totalPayroll = users
        .filter(u => u.role === 'trainer' || u.role === 'manager')
        .reduce((sum, user) => sum + (user.salary || 0), 0);
      setPayrollData({ totalPayroll });
    } finally {
      setPayrollLoading(false);
    }
  };

  const fetchSessions = async () => {
    if (activeReport !== 'sessions') return;
    setSessionsLoading(true);
    setSessionsError(null);
    const service = new SessionScheduleService();
    service.getSessions({ limit: 100 })
      .then((data) => {
        const sessionsArray = Array.isArray(data) ? data : (data?.data || []);
        setSessions(sessionsArray);
      })
      .catch(() => setSessionsError('فشل تحميل بيانات الحصص'))
      .finally(() => setSessionsLoading(false));
  };

  const fetchPlans = async () => {
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
        setWorkoutPlans(workoutArr);
        setDietPlans(dietArr);
      })
      .catch(() => setPlansError('فشل تحميل بيانات الخطط'))
      .finally(() => setPlansLoading(false));
  };

  const fetchAttendance = async () => {
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
  };

  // Effects
  useEffect(() => {
    if (activeReport === 'financial') fetchFinancial();
    if (activeReport === 'financial') fetchPayroll();
  }, [activeReport]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (activeReport === 'users' && !usersLoaded) {
      fetchUsers();
    }
  }, [activeReport]);

  useEffect(() => {
    fetchSessions();
  }, [activeReport]);

  useEffect(() => {
    fetchPlans();
  }, [activeReport]);

  useEffect(() => {
    fetchAttendance();
  }, [activeReport]);

  // Fetch missing users for attendance
  useEffect(() => {
    if (!attendanceRecords || attendanceRecords.length === 0) return;
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
      const validUsers = fetched.filter((u): u is any => !!u && !!u._id);
      if (validUsers.length > 0) {
        setUsers((prev) => ([...prev, ...validUsers.filter((u) => !prev.some((p) => p._id === u._id))]));
      }
    });
  }, [attendanceRecords, users]);

  // Computed values
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

  const attendanceStats = useMemo(() => {
    if (!attendanceRecords || attendanceRecords.length === 0) return null;
    const total = attendanceRecords.length;
    const present = attendanceRecords.filter((a) => a.status === 'present').length;
    const absent = attendanceRecords.filter((a) => a.status === 'absent').length;
    const excused = attendanceRecords.filter((a) => a.status === 'excused').length;
    const attendanceRate = ((present / total) * 100).toFixed(1);
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

  const userStats = useMemo(() => {
    if (!users || users.length === 0) return null;
    
    const total = users.length;
    const active = users.filter((u) => u.status === 'active').length;
    const inactive = users.filter((u) => u.status === 'inactive').length;
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const newThisMonth = users.filter((u) => {
      if (!u.createdAt) return false;
      const created = new Date(u.createdAt);
      return created.getMonth() === currentMonth && created.getFullYear() === currentYear;
    }).length;
    
    const growth = total > 0 ? ((newThisMonth / total) * 100).toFixed(1) : '0';
    
    return { 
      total, 
      active, 
      inactive, 
      newThisMonth, 
      growth 
    };
  }, [users]);

  const sessionStats = useMemo(() => {
    if (!sessions || sessions.length === 0) return null;
    const total = sessions.length;
    const completed = sessions.filter((s) => s.status === 'مكتملة').length;
    const upcoming = sessions.filter((s) => s.status === 'مجدولة').length;
    const cancelled = sessions.filter((s) => s.status === 'ملغاة').length;
    const revenue = sessions.reduce((sum, s) => sum + (s.price || 0), 0);
    return { total, completed, upcoming, cancelled, revenue };
  }, [sessions]);

  const { loyaltyStats } = useLoyaltyStats();

  return (
    <div className="space-y-6">
      {/* Report Categories */}
      <ReportCategories 
        activeReport={activeReport} 
        setActiveReport={setActiveReport} 
      />

      {/* Report Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        {/* Users Report */}
        {activeReport === 'users' && (
          <UsersReport
            users={users}
            usersLoading={usersLoading}
            usersError={usersError}
            usersLoaded={usersLoaded}
            userStats={userStats}
            getUserInfo={getUserInfo}
          />
        )}

        {/* Sessions Report */}
        {activeReport === 'sessions' && (
          <SessionsReport
            sessions={sessions}
            sessionsLoading={sessionsLoading}
            sessionsError={sessionsError}
            sessionStats={sessionStats}
            getUserInfo={getUserInfo}
          />
        )}

        {/* Plans Report */}
        {activeReport === 'plans' && (
          <PlansReport
            workoutPlans={workoutPlans}
            dietPlans={dietPlans}
            plansLoading={plansLoading}
            plansError={plansError}
            plansStats={plansStats}
            getUserInfo={getUserInfo}
          />
        )}

        {/* Attendance Report */}
        {activeReport === 'attendance' && (
          <AttendanceReport
            attendanceRecords={attendanceRecords}
            attendanceLoading={attendanceLoading}
            attendanceError={attendanceError}
            attendanceStats={attendanceStats}
            getUserInfo={getUserInfo}
          />
        )}

        {/* Loyalty Report */}
        {activeReport === 'loyalty' && (
          <LoyaltyReport
            activeReport={activeReport}
          />
        )}

        {/* Financial Report */}
        {activeReport === 'financial' && (
          <FinancialReport
            financialSummary={financialSummary}
            financialLoading={financialLoading}
            financialError={financialError}
            payrollData={payrollData}
            payrollLoading={payrollLoading}
            payrollError={payrollError}
          />
        )}

        {/* Export Options */}
        <ExportOptions
          activeReport={activeReport}
          users={users}
          sessions={sessions}
          workoutPlans={workoutPlans}
          dietPlans={dietPlans}
          attendanceRecords={attendanceRecords}
          loyaltyStats={loyaltyStats}
          getUserInfo={getUserInfo}
        />
      </div>

      {/* Custom Alert */}
      <CustomAlert
        isOpen={false}
        type="success"
        title=""
        message=""
        onClose={() => {}}
      />
    </div>
  );
};

export default ManagerReports;
