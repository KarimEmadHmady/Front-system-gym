'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import type { User as UserModel } from '@/types/models';
import { UserService } from '@/services/userService';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useRouter, usePathname } from '@/i18n/navigation';
import MemberCrowdLevel from './MemberCrowdLevel';

const MemberProfileHeader = () => {
  const { user: authUser } = usePermissions();
  const [user, setUser] = useState<UserModel | null>(null);
  const [trainerName, setTrainerName] = useState<string>('-');
  const [trainerAvatarUrl, setTrainerAvatarUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const userService = new UserService();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const id = (authUser as any)?._id || (authUser as any)?.id;
        if (!id) return;
        const me = await userService.getUser(id);
        setUser(me);
        const tId = (me as any)?.trainerId;
        if (tId) {
          try {
            const trainer = await userService.getUser(typeof tId === 'object' ? (tId as any)._id : tId);
            setTrainerName(trainer?.name || '-');
            setTrainerAvatarUrl(trainer?.avatarUrl || '');
          } catch {
            setTrainerName('-');
            setTrainerAvatarUrl('');
          }
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [authUser]);

  const derived = useMemo(() => {
    const name = user?.name || '-';
    const email = user?.email || '-';
    const phone = user?.phone || '-';
    const membershipLevel = (user?.membershipLevel || 'basic') as string;
    const membershipMap: Record<string, string> = {
      basic: 'Basic',
      silver: 'Silver',
      gold: 'Gold',
      platinum: 'Platinum',
    };
    const membershipType = membershipMap[membershipLevel] || 'Basic';
    const membershipExpiry = user?.subscriptionEndDate ? new Date(user.subscriptionEndDate).toLocaleDateString('ar-EG') : '-';
    const height = (user as any)?.heightCm ?? (user as any)?.metadata?.heightCm ?? '-';
    const weight = (user as any)?.baselineWeightKg ?? '-';
    const hNum = typeof height === 'number' ? height : parseFloat(height);
    const wNum = typeof weight === 'number' ? weight : parseFloat(weight);
    const bmi = hNum && wNum && !Number.isNaN(hNum) && !Number.isNaN(wNum) ? +(wNum / Math.pow(hNum / 100, 2)).toFixed(1) : undefined;
    const goalsArr: string[] = [];
    if (user?.goals?.weightLoss) goalsArr.push('تخسيس');
    if (user?.goals?.muscleGain) goalsArr.push('بناء عضلات');
    if (user?.goals?.endurance) goalsArr.push('قوة تحمل');
    return { name, email, phone, membershipType, membershipExpiry, height, weight, bmi, goalsArr, avatarUrl: user?.avatarUrl };
  }, [user]);

  const getMembershipColor = (type: string) => {
    const colors = {
      Premium: 'bg-gradient-to-r from-yellow-500 to-orange-600',
      Standard: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
      Basic: 'bg-gradient-to-r from-gray-500 to-gray-600',
      Silver: 'bg-gradient-to-r from-gray-400 to-gray-500',
      Gold: 'bg-gradient-to-r from-yellow-500 to-amber-600',
      Platinum: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
    } as Record<string, string>;
    return colors[type] || 'bg-gradient-to-r from-gray-500 to-gray-600';
  };

  const getBMIColor = (bmi: number) => {
    if (bmi < 18.5) return 'text-yellow-600';
    if (bmi >= 18.5 && bmi < 25) return 'text-green-600';
    if (bmi >= 25 && bmi < 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBMIText = (bmi: number) => {
    if (bmi < 18.5) return 'نقص وزن';
    if (bmi >= 18.5 && bmi < 25) return 'وزن طبيعي';
    if (bmi >= 25 && bmi < 30) return 'وزن زائد';
    return 'سمنة';
  };

  // Compute subscription donut data from subscription dates if present
  const startDate = (user as any)?.subscriptionStartDate ? new Date((user as any).subscriptionStartDate) : null;
  const endDate = (user as any)?.subscriptionEndDate ? new Date((user as any).subscriptionEndDate) : null;
  const today = new Date();
  const totalDays = startDate && endDate ? Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))) : 0;
  const usedDays = startDate ? Math.max(0, Math.ceil((Math.min(today.getTime(), endDate ? endDate.getTime() : today.getTime()) - startDate.getTime()) / (1000 * 60 * 60 * 24))) : 0;
  const remainingDays = Math.max(totalDays - usedDays, 0);
  const progress = totalDays > 0 ? Math.min(100, Math.max(0, Math.round((usedDays / totalDays) * 100))) : 0;

  const donutData = [
    { name: 'المستخدم', value: usedDays },
    { name: 'المتبقي', value: remainingDays }
  ];

  // Helper to change tab in URL
  const goToTab = (tab: string) => {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    params.set('tab', tab);
    router.push(`${pathname}?${params.toString()}`);
  };

  // Skeletons
  const AvatarSkeleton = () => (
    <div className="w-15 h-15 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
  );
  const InfoSkeleton = () => (
    <div className="space-y-2 w-full">
      <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      <div className="h-4 w-40 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
      <div className="h-4 w-36 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
      <div className="h-4 w-44 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
    </div>
  );
  const StatSkeleton = () => (
    <div className="text-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 animate-pulse">
      <div className="h-6 w-6 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full mb-1" />
      <div className="h-3 w-12 mx-auto bg-gray-100 dark:bg-gray-800 rounded mb-1" />
      <div className="h-5 w-10 mx-auto bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  );
  const DonutSkeleton = () => (
    <div className="h-36 flex items-center justify-center animate-pulse">
      <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full" />
    </div>
  );
  const DonutInfoSkeleton = () => (
    <div className="space-y-2">
      <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      <div className="h-3 w-28 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
      <div className="h-3 w-24 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
      <div className="h-3 w-24 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
      <div className="h-3 w-24 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
    </div>
  );
  const GoalsSkeleton = () => (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/30 animate-pulse min-h-[120px]" />
  );
  const TrainerSkeleton = () => (
    <div className="rounded-xl border border-yellow-200 dark:border-yellow-700 p-4 bg-yellow-50/40 dark:bg-yellow-900/20 animate-pulse min-h-[120px]" />
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 relative">
      {/* Edit Button - Top Left */}
      <button
        onClick={() => goToTab('settings')}
        className="absolute top-4 left-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 flex items-center justify-center transition-colors duration-200"
        title="Edit Profile"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </button>
      
      {loading ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: Avatar + Basic Info */}
          <div className="flex items-start space-x-4">
            <AvatarSkeleton />
            <InfoSkeleton />
          </div>
          {/* Middle: Physical Stats */}
          <div className="grid grid-cols-3 gap-4">
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </div>
          {/* Right: Subscription Donut */}
          <div className="grid grid-cols-2 gap-4 items-center">
            <DonutSkeleton />
            <DonutInfoSkeleton />
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: Avatar + Basic Info */}
          <div className="flex items-start space-x-4">
            {derived.avatarUrl ? (
              <img 
                src={derived.avatarUrl} 
                alt={derived.name}
                className="w-15 h-15 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className={`w-15 h-15 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center text-white text-2xl font-bold ${derived.avatarUrl ? 'hidden' : ''}`}
              style={{ display: derived.avatarUrl ? 'none' : 'flex' }}
            >
              {derived.name.charAt(0)}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center text-gray-900 dark:text-white">
                <span className="text-base mx-2" aria-hidden>👤</span>
                <h2 className="text-lg font-semibold leading-tight">{derived.name}</h2>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                <span className="text-base mx-2" aria-hidden>✉️</span>
                <span className="truncate max-w-[16rem]">{derived.email}</span>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                <span className="text-base mx-2" aria-hidden>📞</span>
                <span className="truncate max-w-[16rem]">{derived.phone}</span>
              </div>
              <div className="flex items-center text-gray-700 dark:text-gray-300 text-sm">
                <span className="text-base mx-2" aria-hidden>🎖️</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-semibold rounded-full text-white ${getMembershipColor(derived.membershipType)}`}>
                  {derived.membershipType}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 mr-2 flex items-center">
                  <span className="text-sm ml-1" aria-hidden>📅</span>
                  ينتهي في {derived.membershipExpiry}
                </span>
              </div>
            </div>
          </div>
          {/* Middle: Physical Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-2xl mb-1" aria-hidden>📏</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">الطول</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{derived.height !== '-' ? `${derived.height} سم` : '-'}</p>
            </div>
            <div className="text-center p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-2xl mb-1" aria-hidden>⚖️</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">الوزن</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{derived.weight !== '-' ? `${derived.weight} كغ` : '-'}</p>
            </div>
            <div className="text-center p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-2xl mb-1" aria-hidden>🧮</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">مؤشر كتلة الجسم</p>
              {typeof derived.bmi === 'number' ? (
                <>
                  <p className={`text-xl font-bold ${getBMIColor(derived.bmi)} mt-1`}>{derived.bmi}</p>
                  <p className={`text-[11px] ${getBMIColor(derived.bmi)}`}>{getBMIText(derived.bmi)}</p>
                </>
              ) : (
                <p className="text-xl font-bold text-gray-400 mt-1">-</p>
              )}
            </div>
          </div>
          {/* Right: Subscription Donut */}
          <div className="grid grid-cols-2 gap-4 items-center">
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donutData} dataKey="value" innerRadius={40} outerRadius={60} paddingAngle={2}>
                    <Cell fill="#6366F1" />
                    <Cell fill="#10B981" />
                  </Pie>
                  <Tooltip formatter={(val: any) => `${val} يوم`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">اشتراكك</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">المستخدم: {usedDays} يوم ({progress}%)</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">المتبقي: {remainingDays} يوم</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">البداية: {startDate ? startDate.toLocaleDateString('ar-EG') : '-'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">النهاية: {endDate ? endDate.toLocaleDateString('ar-EG') : '-'}</p>
            </div>
          </div>
        </div>
      )}
      {/* Goals and Trainer */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? (
            <>
              <MemberCrowdLevel />
              <GoalsSkeleton />
              <TrainerSkeleton />
            </>
          ) : (
            <>
            <MemberCrowdLevel />
              {/* Goals */}
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/30 flex flex-col gap-3 text-right" dir="rtl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl" aria-hidden>🎯</span>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">أهدافي</h3>
                  </div>
                  {derived.goalsArr.length > 0 ? (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-200">
                      {derived.goalsArr.length} هدف
                    </span>
                  ) : null}
                </div>
                <div className="border-t border-dashed border-gray-200 dark:border-gray-700 my-2"></div>
                {derived.goalsArr.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {derived.goalsArr.map((goal, index) => (
                      <span
                        key={index}
                        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 shadow-sm"
                      >
                        <span className="text-lg">🎯</span>
                        <span>{goal}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400">لا توجد أهداف محددة</div>
                )}
              </div>
              {/* Trainer */}
              <div className="rounded-xl border border-yellow-200 dark:border-yellow-700 p-4 bg-yellow-50/40 dark:bg-yellow-900/20 flex flex-col items-center md:items-end gap-2 text-right shadow-sm" dir="rtl">
                <div className="flex flex-col items-center w-full mb-1">
                  {trainerAvatarUrl ? (
                    <img 
                      src={trainerAvatarUrl} 
                      alt={trainerName}
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600 mb-2 shadow-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className={`w-20 h-20 bg-gradient-to-r from-green-500 to-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-3xl mb-2 shadow-lg ${trainerAvatarUrl ? 'hidden' : ''}`}
                    style={{ display: trainerAvatarUrl ? 'none' : 'flex' }}
                  >
                    {trainerName && trainerName !== '-' ? trainerName.charAt(0) : '?'}
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl" aria-hidden>👨‍🏫</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{trainerName}</span>
                  </div>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-1">مدرب شخصي</p>
                </div>
                <div className="border-t border-dashed border-yellow-200 dark:border-yellow-700 my-2 w-full"></div>
                <div className="w-full flex justify-center md:justify-end">
                  <div className="w-full flex justify-center gap-2">
                    {/* زر الرسائل */}
                    <button
                      className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold bg-green-600 text-white dark:bg-green-700 dark:text-green-100 shadow hover:bg-green-700 transition cursor-pointer"
                      onClick={() => goToTab('messages')}
                    >
                      <span className="text-lg">💬</span>
                      <span>الرسائل</span>
                    </button>
                    {/* زر التقييم */}
                    <button
                      className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold bg-yellow-500 text-white dark:bg-yellow-600 dark:text-yellow-100 shadow hover:bg-yellow-600 transition cursor-pointer"
                      onClick={() => goToTab('feedback')}
                    >
                      <span className="text-lg">⭐</span>
                      <span>التقييم</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberProfileHeader;
