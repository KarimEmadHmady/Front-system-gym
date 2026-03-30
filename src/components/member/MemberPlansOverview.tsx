'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { WorkoutPlan, DietPlan } from '@/types';
import { workoutService, dietService, userService } from '@/services';

const MemberPlansOverview = () => {
  const { user } = useAuth();
  const currentUserId = useMemo(() => ((user as any)?._id ?? (user as any)?.id ?? ''), [user]);
  const [activeTab, setActiveTab] = useState('workout');
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [dietLoading, setDietLoading] = useState(false);
  const [dietError, setDietError] = useState<string | null>(null);
  const [nameMap, setNameMap] = useState<Record<string, string>>({});
  const [enlargedImage, setEnlargedImage] = useState<{src: string; alt: string} | null>(null);

  const getTypeText = (type: string) => {
    const types = {
      weight_loss: 'تخسيس',
      muscle_gain: 'بناء عضلات',
      general_fitness: 'لياقة عامة',
      general_health: 'صحة عامة'
    };
    return types[type as keyof typeof types] || type;
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      intermediate: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getDifficultyText = (difficulty: string) => {
    const texts = {
      beginner: 'مبتدئ',
      intermediate: 'متوسط',
      advanced: 'متقدم'
    };
    return texts[difficulty as keyof typeof texts] || difficulty;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      completed: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts = {
      active: 'نشط',
      inactive: 'غير نشط',
      completed: 'مكتمل'
    };
    return texts[status as keyof typeof texts] || status;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-gray-500';
    if (progress >= 40) return 'bg-gray-500';
    return 'bg-red-500';
  };

  useEffect(() => {
    const fetchMyPlans = async () => {
      if (!currentUserId) return;
      try {
        setLoading(true);
        setError(null);
        const res: any = await workoutService.getUserWorkoutPlans(currentUserId);
        const plans = (res?.data || res || []) as WorkoutPlan[];
        setWorkoutPlans(plans);
      } catch (e: any) {
        setError(e.message || 'فشل تحميل خطط التمرين');
      } finally {
        setLoading(false);
      }
    };
    fetchMyPlans();
  }, [currentUserId]);

  useEffect(() => {
    const fetchMyDietPlans = async () => {
      if (!currentUserId) return;
      try {
        setDietLoading(true);
        setDietError(null);
        const res: any = await dietService.getUserDietPlans(currentUserId);
        setDietPlans((res?.data || res || []) as DietPlan[]);
      } catch (e: any) {
        setDietError(e.message || 'فشل تحميل الخطط الغذائية');
      } finally {
        setDietLoading(false);
      }
    };
    fetchMyDietPlans();
  }, [currentUserId]);

  useEffect(() => {
    const loadNames = async () => {
      const ids = Array.from(new Set([
        ...((workoutPlans || []).map((p: any) => p.trainerId).filter(Boolean)),
        ...((dietPlans || []).map((p: any) => p.trainerId).filter(Boolean)),
      ]));
      const missing = ids.filter(id => !nameMap[id as string]);
      if (missing.length === 0) return;
      try {
        const pairs = await Promise.all(missing.map(async (id) => {
          try { const u = await userService.getUser(id as string); return [id, u.name] as const; }
          catch { return [id, id as string] as const; }
        }));
        setNameMap(prev => ({ ...prev, ...Object.fromEntries(pairs) }));
      } catch {}
    };
    loadNames();
  }, [workoutPlans, dietPlans, nameMap]);

  const currentPlans: any[] = activeTab === 'workout' ? (workoutPlans as any[]) : (dietPlans as any[]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-0">
            خططي
          </h3>
          <div className="flex space-x-2">
            <button className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              تصدير البيانات
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'workout', name: 'خطط التمرين', count: workoutPlans.length, icon: '🏋️' },
              { id: 'diet', name: 'الخطط الغذائية', count: dietPlans.length, icon: '🍎' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center ${
                  activeTab === tab.id
                    ? 'border-gray-500 text-gray-600 dark:text-gray-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
                <span className="mx-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 py-1 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Plans List */}
        <div className="p-6">
          {loading && <p className="text-sm text-gray-600 dark:text-gray-400">جاري التحميل...</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeTab === 'workout' && (workoutPlans as any[]).map((plan: any) => (
              <div
                key={plan._id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="text-base">🏋️</span>
                    {plan.planName}
                  </h4>
                </div>

                <div className="space-y-3">
                  {plan.trainerId && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1"><span className="text-xs">🧑‍🏫</span>المدرب:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{nameMap[plan.trainerId] || '...'}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1"><span className="text-xs">📅</span>الفترة:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1"><span className="text-xs">🏋️</span>عدد التمارين:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {plan.exercises?.length || 0} تمرين
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1"><span className="text-xs">📝</span>الوصف:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {plan.description || '-'}
                    </span>
                  </div>

                  {/* تمارين الخطة */}
                  <div className="mt-4">
                    <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-1"><span className="text-xs">📋</span>التمارين</h5>
                    {(!plan.exercises || plan.exercises.length === 0) ? (
                      <p className="text-xs text-gray-500">لا توجد تمارين في هذه الخطة.</p>
                    ) : (
                      <ul className="space-y-3">
                        {plan.exercises.map((ex: any, idx: number) => (
                          <li
                            key={ex._id || idx}
                            className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded px-3 py-2"
                          >
                            <div
                              className="relative group flex-shrink-0 cursor-pointer"
                              style={{ minWidth: 56 }}
                              onClick={() => ex.image ? setEnlargedImage({ src: String(ex.image), alt: String(ex.name || '') }) : undefined}
                            >
                              {ex.image ? (
                                <img
                                  src={ex.image}
                                  alt={ex.name || ''}
                                  className="w-14 h-14 object-cover rounded-full border-2 border-gray-600 shadow-md"
                                  draggable={false}
                                />
                              ) : (
                                <div className="w-14 h-14 bg-gray-100 flex items-center justify-center rounded-full text-3xl">
                                  🏋️‍♂️
                                </div>
                              )}
                              {ex.image && (
                                <div className="absolute inset-0 pointer-events-none rounded-full flex items-center justify-center">
                                  <span className="text-white text-lg opacity-0 group-hover:opacity-100 transition-opacity select-none shadow">🔍</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-base font-medium text-gray-900 dark:text-white">{ex.name}</span>
                                <span className="text-xs text-gray-400">{idx + 1}</span>
                              </div>
                              <div className="text-xs text-gray-700 dark:text-gray-300 flex flex-wrap gap-2 mt-1">
                                <span>المجموعات: {ex.sets}</span>
                                <span>التكرارات: {ex.reps}</span>
                              </div>
                              {ex.notes && (
                                <div className="block text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                                  📝 {ex.notes}
                                </div>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {enlargedImage && (
                    <div
                      className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center"
                      onClick={() => setEnlargedImage(null)}
                    >
                      <div className="relative" onClick={e => e.stopPropagation()}>
                        <button
                          className="absolute -top-4 -right-4 bg-white text-black rounded-full shadow p-2 text-xl"
                          onClick={() => setEnlargedImage(null)}
                        >
                          ✕
                        </button>
                        <img
                          src={enlargedImage.src}
                          alt={enlargedImage.alt}
                          className="max-w-[90vw] max-h-[70vh] rounded-lg shadow-xl border-4 border-white"
                        />
                        {enlargedImage.alt && (
                          <div className="text-center mt-3 text-lg text-white font-semibold">
                            {enlargedImage.alt}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {activeTab === 'diet' && (
              dietLoading ? (
                <p className="text-sm text-gray-600 dark:text-gray-400">جاري التحميل...</p>
              ) : dietError ? (
                <p className="text-sm text-red-600">{dietError}</p>
              ) : (dietPlans as any[]).map((plan: any) => (
                <div key={plan._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <span className="text-base">🍎</span>
                      {plan.planName}
                    </h4>
                  </div>
                  {plan.trainerId && (
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1 "><span className="text-xs">🧑‍🏫</span>المدرب: {nameMap[plan.trainerId] || '...'}</p>
                  )}
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1 my-2"><span className="text-xs">📅</span>الفترة:</span>
                    <span className="text-gray-900 dark:text-white">{new Date(plan.startDate).toLocaleDateString()} {plan.endDate ? `- ${new Date(plan.endDate).toLocaleDateString()}` : ''}</span>
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1"><span className="text-xs">📝</span>{plan.description || '-'}</div>
                  <div>
                    <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-1"><span className="text-xs">🍽️</span>الوجبات</h5>
                    {(!plan.meals || plan.meals.length === 0) ? (
                      <p className="text-xs text-gray-500">لا توجد وجبات.</p>
                    ) : (
                      <ul className="space-y-2">
                        {plan.meals.map((meal: any, idx: number) => (
                          <li key={meal.mealId || idx} className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-2">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold">{idx+1}</span>
                              <span className="text-sm text-gray-900 dark:text-white">{meal.mealName}</span>
                            </div>
                            <div className="text-xs text-gray-700 dark:text-gray-300 text-right">
                              <div><span className="mr-1">🔥</span>السعرات: {meal.calories}</div>
                              <div><span className="mr-1">🧪</span>الكمية: {meal.quantity}</div>
                              {meal.notes ? (
                                <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1"><span className="mr-1">📝</span>ملاحظات: {meal.notes}</div>
                              ) : null}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberPlansOverview;

