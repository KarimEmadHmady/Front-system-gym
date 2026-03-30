'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { User as UserModel } from '@/types/models';
import { UserService } from '@/services/userService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const MemberSubscription = () => {
  const { user: authUser } = useAuth();
  const userId = useMemo(() => ((authUser as any)?._id ?? (authUser as any)?.id ?? ''), [authUser]);
  const [user, setUser] = useState<UserModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userService = new UserService();

  useEffect(() => {
    const load = async () => {
      if (!userId) return;
      setLoading(true);
      setError(null);
      try {
        const me = await userService.getUser(userId);
        setUser(me as any);
      } catch (e: any) {
        setError(e?.message || 'تعذر جلب بيانات الاشتراك');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const toDate = (val: any): Date | null => {
    if (!val) return null;
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  };

  const start = toDate((user as any)?.subscriptionStartDate);
  const end = toDate((user as any)?.subscriptionEndDate);
  const status = (user as any)?.subscriptionStatus as string | undefined;
  const freezeDays = (user as any)?.subscriptionFreezeDays ?? 0;
  const freezeUsed = (user as any)?.subscriptionFreezeUsed ?? 0;
  const lastPaymentDate = toDate((user as any)?.lastPaymentDate);
  const nextPaymentDueDate = toDate((user as any)?.nextPaymentDueDate);

  const today = new Date();
  const totalDays = start && end ? Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))) : 0;
  const usedDays = start ? Math.max(0, Math.ceil((Math.min(today.getTime(), end ? end.getTime() : today.getTime()) - start.getTime()) / (1000 * 60 * 60 * 24))) : 0;
  const daysLeft = end ? Math.max(0, Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))) : 0;
  const progress = totalDays > 0 ? Math.min(100, Math.max(0, Math.round((usedDays / totalDays) * 100))) : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">اشتراكي</h3>

      {loading ? (
        <div className="text-gray-500 dark:text-gray-400">جارٍ تحميل بيانات الاشتراك...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : !user ? (
        <div className="text-gray-500 dark:text-gray-400">لا توجد بيانات لعرضها.</div>
      ) : (
        <div className="space-y-5">
          {/* Status and Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">الحالة</p>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                status === 'frozen' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                status === 'expired' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                status === 'cancelled' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' :
                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}>
                {status === 'active' ? 'نشط' : status === 'frozen' ? 'مجمّد' : status === 'expired' ? 'منتهي' : status === 'cancelled' ? 'ملغي' : (status || '-')}
              </span>
            </div>
            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">بداية الاشتراك</p>
              <p className="text-gray-900 dark:text-white">{start ? start.toLocaleDateString('ar-EG') : '-'}</p>
            </div>
            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">نهاية الاشتراك</p>
              <p className="text-gray-900 dark:text-white">{end ? end.toLocaleDateString('ar-EG') : '-'}</p>
            </div>
          </div>

          {/* Progress */}
          <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2 text-sm text-gray-600 dark:text-gray-300">
              <span>الأيام المستخدمة: {usedDays} / {totalDays}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div className={`h-2 rounded-full ${progress < 60 ? 'bg-green-500' : progress < 85 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              متبقي: {daysLeft} يوم
            </div>
          </div>

          {/* Subscription Chart Section */}
          <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">نظرة عامة على الاشتراك</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'المستخدم', value: usedDays },
                        { name: 'المتبقي', value: Math.max(totalDays - usedDays, 0) }
                      ]}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      <Cell fill="#6366F1" />
                      <Cell fill="#10B981" />
                    </Pie>
                    <Tooltip formatter={(val: any) => `${val} يوم`} />
                    <Legend verticalAlign="bottom" height={24} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">مدة الاشتراك</span>
                  <span className="font-semibold">{totalDays} يوم</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">المستخدم</span>
                  <span className="font-semibold">{usedDays} يوم ({progress}%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">المتبقي</span>
                  <span className="font-semibold">{Math.max(totalDays - usedDays, 0)} يوم</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">تاريخ البداية</span>
                  <span className="font-semibold">{start ? start.toLocaleDateString('ar-EG') : '-'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">تاريخ النهاية</span>
                  <span className="font-semibold">{end ? end.toLocaleDateString('ar-EG') : '-'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Freeze Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">أيام التجميد المسموحة</p>
              <p className="text-gray-900 dark:text-white">{freezeDays}</p>
            </div>
            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">أيام التجميد المستخدمة</p>
              <p className="text-gray-900 dark:text-white">{freezeUsed}</p>
            </div>
          </div>

          {/* Payments */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">آخر دفعة</p>
              <p className="text-gray-900 dark:text-white">{lastPaymentDate ? lastPaymentDate.toLocaleDateString('ar-EG') : '-'}</p>
            </div>
            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">استحقاق الدفع القادم</p>
              <p className="text-gray-900 dark:text-white">{nextPaymentDueDate ? nextPaymentDueDate.toLocaleDateString('ar-EG') : '-'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberSubscription;


