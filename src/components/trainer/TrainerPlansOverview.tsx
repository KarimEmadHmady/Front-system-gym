'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { WorkoutPlan } from '@/types';
import { workoutService, userService, dietService } from '@/services';
import type { DietPlan } from '@/types';
import { useAuth } from '@/hooks/useAuth';

const TrainerPlansOverview = () => {
  const { user } = useAuth();
  const currentTrainerId = useMemo(() => ((user as any)?._id ?? (user as any)?.id ?? ''), [user]);
  const [activeTab, setActiveTab] = useState('workout');
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [dietLoading, setDietLoading] = useState(false);
  const [dietError, setDietError] = useState<string | null>(null);
  const [showCreateDietModal, setShowCreateDietModal] = useState(false);
  const [createDietUserId, setCreateDietUserId] = useState('');
  const [createDietName, setCreateDietName] = useState('');
  const [createDietDesc, setCreateDietDesc] = useState('');
  const [createDietStart, setCreateDietStart] = useState('');
  const [createDietEnd, setCreateDietEnd] = useState('');
  const [createDietMeals, setCreateDietMeals] = useState<Array<{ mealName: string; calories: number; quantity: string; notes?: string }>>([]);
  const [createDietLoading, setCreateDietLoading] = useState(false);
  const [createDietError, setCreateDietError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<null | string>(null);
  const [creatingUserId, setCreatingUserId] = useState('');
  const [formPlanName, setFormPlanName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formExercises, setFormExercises] = useState<Array<{ name: string; reps: number; sets: number; notes?: string; image?: string; imageFile?: File }>>([]);
  const [editingPlan, setEditingPlan] = useState<WorkoutPlan | null>(null);
  const [userNameMap, setUserNameMap] = useState<Record<string, string>>({});
  const [allowedUserIds, setAllowedUserIds] = useState<Set<string>>(new Set());
  const [myClients, setMyClients] = useState<Array<{ _id: string; name: string; email?: string; phone?: string }>>([]);
  const [memberSearch, setMemberSearch] = useState('');

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch trainer's clients like TrainerClientsOverview
        let clientIds: string[] = [];
        try {
          const membersRes: any = await new (userService as any).constructor().getUsersByRole('member', { page: 1, limit: 1000 });
          const arr = Array.isArray(membersRes) ? membersRes : (membersRes?.data || []);
          const normalizeId = (val: any): string => {
            if (!val) return '';
            if (typeof val === 'string') return val;
            if (typeof val === 'object') return (val._id || val.id || '') as string;
            return String(val);
          };
          const me = normalizeId(currentTrainerId);
          const filtered = (arr || []).filter((m: any) => normalizeId(m?.trainerId) === me);
          setMyClients(filtered);
          clientIds = filtered.map((c: any) => c._id);
          setAllowedUserIds(new Set(clientIds));
        } catch {}

        // Fetch all plans then filter to only my clients
        const res = await workoutService.getAllWorkoutPlans({ trainerId: currentTrainerId });
        const plans: any = (res as any).data || (res as any);
        const filtered = clientIds.length ? plans.filter((p: any) => clientIds.includes(p.userId)) : plans;
        setWorkoutPlans(filtered);
      } catch (e: any) {
        setError(e.message || 'فشل تحميل الخطط');
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, [currentTrainerId]);

  useEffect(() => {
    const fetchDietPlans = async () => {
      try {
        setDietLoading(true);
        setDietError(null);
        const res: any = await dietService.getDietPlans({ trainerId: currentTrainerId });
        setDietPlans((res?.data || res || []) as DietPlan[]);
      } catch (e: any) {
        setDietError(e.message || 'فشل تحميل الخطط الغذائية');
      } finally {
        setDietLoading(false);
      }
    };
    fetchDietPlans();
  }, [currentTrainerId]);

  useEffect(() => {
    const loadNames = async () => {
      const ids = Array.from(new Set((workoutPlans || []).map(p => p.userId).filter(Boolean)));
      const missing = ids.filter(id => !userNameMap[id]);
      if (missing.length === 0) return;
      try {
        const pairs = await Promise.all(missing.map(async (id) => {
          try { const u = await userService.getUser(id); return [id, u.name] as const; }
          catch { return [id, id] as const; }
        }));
        setUserNameMap(prev => ({ ...prev, ...Object.fromEntries(pairs) }));
      } catch {}
    };
    loadNames();
  }, [workoutPlans, userNameMap]);

  const resetForm = () => {
    setCreatingUserId('');
    setFormPlanName('');
    setFormDescription('');
    setFormStartDate('');
    setFormEndDate('');
    setFormExercises([]);
  };

  const openCreate = () => { resetForm(); setShowCreateModal(true); };
  const openEdit = (plan: WorkoutPlan) => {
    setEditingPlan(plan);
    setFormPlanName(plan.planName || '');
    setFormDescription((plan as any).description || '');
    setFormStartDate(plan.startDate ? new Date(plan.startDate).toISOString().slice(0,10) : '');
    setFormEndDate(plan.endDate ? new Date(plan.endDate).toISOString().slice(0,10) : '');
    setFormExercises((plan.exercises || []).map((e) => ({ name: e.name, reps: e.reps, sets: e.sets, notes: e.notes, image: e.image })));
    setShowEditModal(true);
  };
  const canSubmitCreate = useMemo(() => creatingUserId && formPlanName && formStartDate && formEndDate, [creatingUserId, formPlanName, formStartDate, formEndDate]);

  // removed static dietPlans

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
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts = {
      active: 'نشط',
      inactive: 'غير نشط',
      draft: 'مسودة'
    };
    return texts[status as keyof typeof texts] || status;
  };

  const currentPlans = activeTab === 'workout' ? workoutPlans : (dietPlans as any[]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-0">
            خططي
          </h3>
          <div className="flex space-x-2">
            {activeTab === 'workout' ? (
              <button className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700 transition-colors" onClick={openCreate}>
                إنشاء خطة تمرين
              </button>
            ) : (
              <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition-colors" onClick={() => {
                setCreateDietUserId('');
                setCreateDietName('');
                setCreateDietDesc('');
                setCreateDietStart('');
                setCreateDietEnd('');
                setCreateDietMeals([]);
                setCreateDietError(null);
                setShowCreateDietModal(true);
              }}>
                إنشاء خطة غذائية
              </button>
            )}
            <button className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              تصدير البيانات
            </button>
          </div>
        </div>
      </div>
      {/* Create Diet Plan Modal */}
      {showCreateDietModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">إنشاء خطة غذائية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm mb-1">اختر عميل (من عملائك فقط)</label>
                <select value={createDietUserId} onChange={(e) => setCreateDietUserId(e.target.value)} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900">
                  <option value="">اختر عميل...</option>
                  {myClients.map((m) => (
                    <option key={m._id} value={m._id}>{(m.phone || 'بدون هاتف')} - {m.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">اسم الخطة</label>
                <input value={createDietName} onChange={(e) => setCreateDietName(e.target.value)} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900" placeholder="مثال: خطة غذائية" />
              </div>
              <div>
                <label className="block text-sm mb-1">الوصف</label>
                <input value={createDietDesc} onChange={(e) => setCreateDietDesc(e.target.value)} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900" placeholder="وصف مختصر" />
              </div>
              <div>
                <label className="block text-sm mb-1">تاريخ البداية</label>
                <input type="date" value={createDietStart} onChange={(e) => setCreateDietStart(e.target.value)} onFocus={(e)=> (e.currentTarget as any).showPicker?.()} onClick={(e)=> (e.currentTarget as any).showPicker?.()} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900" />
              </div>
              <div>
                <label className="block text-sm mb-1">تاريخ النهاية</label>
                <input type="date" value={createDietEnd} onChange={(e) => setCreateDietEnd(e.target.value)} onFocus={(e)=> (e.currentTarget as any).showPicker?.()} onClick={(e)=> (e.currentTarget as any).showPicker?.()} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900" />
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">الوجبات</h4>
                <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={() => setCreateDietMeals((prev) => [...prev, { mealName: '', calories: 1, quantity: '1', notes: '' }])}>إضافة وجبة</button>
              </div>
              <div className="grid grid-cols-12 gap-2 text-xs text-gray-600 mb-1">
                <span className="col-span-3">اسم الوجبة</span>
                <span className="col-span-2">السعرات</span>
                <span className="col-span-2">الكمية</span>
                <span className="col-span-4">ملاحظات</span>
                <span className="col-span-1">إجراء</span>
              </div>
              {createDietMeals.length === 0 && (
                <p className="text-sm text-gray-500">لا يوجد وجبات</p>
              )}
              <div className="space-y-3 max-h-60 overflow-auto pr-1">
                {createDietMeals.map((meal, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <input className="col-span-3 border rounded px-2 py-1 bg-white dark:bg-gray-900" placeholder="مثال: فطور" value={meal.mealName} onChange={(e)=> setCreateDietMeals(prev => prev.map((m,i)=> i===idx ? { ...m, mealName: e.target.value } : m))} />
                    <input type="number" className="col-span-2 border rounded px-2 py-1 bg-white dark:bg-gray-900" placeholder="مثال: 300" value={meal.calories} onChange={(e)=> setCreateDietMeals(prev => prev.map((m,i)=> i===idx ? { ...m, calories: Number(e.target.value) } : m))} />
                    <input className="col-span-2 border rounded px-2 py-1 bg-white dark:bg-gray-900" placeholder="مثال: 1 طبق" value={meal.quantity} onChange={(e)=> setCreateDietMeals(prev => prev.map((m,i)=> i===idx ? { ...m, quantity: e.target.value } : m))} />
                    <input className="col-span-4 border rounded px-2 py-1 bg-white dark:bg-gray-900" placeholder="اختياري" value={meal.notes || ''} onChange={(e)=> setCreateDietMeals(prev => prev.map((m,i)=> i===idx ? { ...m, notes: e.target.value } : m))} />
                    <button className="col-span-1 text-red-600" onClick={()=> setCreateDietMeals(prev => prev.filter((_,i)=> i!==idx))}>حذف</button>
                  </div>
                ))}
              </div>
            </div>

            {createDietError && <p className="text-xs text-red-600 mt-2">{createDietError}</p>}

            <div className="mt-6 flex justify-end space-x-2">
              <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded" onClick={() => setShowCreateDietModal(false)}>إلغاء</button>
              <button className={`px-4 py-2 rounded text-white ${createDietLoading ? 'bg-green-300 cursor-wait' : 'bg-green-600 hover:bg-green-700'}`} disabled={createDietLoading} onClick={async () => {
                if (!createDietUserId) { setCreateDietError('يجب اختيار عميل'); return; }
                if (!createDietName.trim()) { setCreateDietError('اسم الخطة مطلوب'); return; }
                if (!createDietStart) { setCreateDietError('تاريخ البداية مطلوب'); return; }
                try {
                  setCreateDietLoading(true);
                  const created = await dietService.createDietPlan({
                    userId: createDietUserId,
                    planName: createDietName.trim(),
                    description: createDietDesc,
                    startDate: new Date(createDietStart) as any,
                    endDate: createDietEnd ? new Date(createDietEnd) as any : undefined,
                    meals: createDietMeals as any,
                  });
                  setDietPlans((prev) => [created as any, ...prev]);
                  setShowCreateDietModal(false);
                  setCreateDietMeals([]);
                } catch (e: any) {
                  setCreateDietError(e.message || 'فشل إنشاء الخطة الغذائية');
                } finally {
                  setCreateDietLoading(false);
                }
              }}>حفظ</button>
            </div>
          </div>
        </div>
      )}

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
                    ? 'border-green-500 text-green-600 dark:text-green-400'
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
            {activeTab === 'diet' && (
              dietLoading ? (
                <p className="text-sm text-gray-600 dark:text-gray-400">جاري التحميل...</p>
              ) : dietError ? (
                <p className="text-sm text-red-600">{dietError}</p>
              ) : dietPlans.map((plan) => (
                <div key={plan._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">{plan.planName}</h4>
                  </div>
                  {plan.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{plan.description}</p>
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">الفترة:</span>
                      <span className="text-gray-900 dark:text-white">{new Date(plan.startDate).toLocaleDateString()} {plan.endDate ? `- ${new Date(plan.endDate).toLocaleDateString()}` : ''}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">عدد الوجبات:</span>
                      <span className="text-gray-900 dark:text-white">{plan.meals?.length || 0} وجبة</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </nav>
        </div>

        {/* Plans List */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === 'workout' && workoutPlans.map((plan) => (
              <div
                key={plan._id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                    {plan.planName}
                  </h4>
                </div>
                <p className="text-xs text-gray-500 mb-2">اسم المستخدم: {userNameMap[plan.userId] || '...'}</p>
                {plan.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{plan.description}</p>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">التمارين:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{plan.exercises?.length || 0} تمرين</span>
                  </div>
                  {plan.exercises && plan.exercises.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs text-gray-500 mb-1">عينة من التمارين:</div>
                      <div className="flex flex-wrap gap-2">
                        {plan.exercises.slice(0, 3).map((ex, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-full">
                            {ex.image && (
                              <img 
                                src={ex.image} 
                                alt={ex.name} 
                                className="w-5 h-5 object-cover rounded-full cursor-pointer hover:scale-110 transition-transform" 
                                onClick={() => {
                                  const newWindow = window.open('', '_blank');
                                  if (newWindow) {
                                    newWindow.document.write(`
                                      <html>
                                        <head><title>${ex.name}</title></head>
                                        <body style="margin:0; padding:20px; background:#f5f5f5; text-align:center;">
                                          <img src="${ex.image}" style="max-width:90%; max-height:90%; border-radius:8px; box-shadow:0 4px 8px rgba(0,0,0,0.2);" />
                                          <p style="margin-top:20px; font-family:Arial; color:#666;">${ex.name}</p>
                                        </body>
                                      </html>
                                    `);
                                    newWindow.document.close();
                                  }
                                }}
                              />
                            )}
                            <span className="text-gray-600 dark:text-gray-300 font-medium">{ex.name}</span>
                          </div>
                        ))}
                        {plan.exercises.length > 3 && (
                          <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full">+{plan.exercises.length - 3} أكثر</span>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">المدة:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mt-6 flex space-x-2">
                  <button className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-md text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" onClick={() => openEdit(plan)}>تعديل</button>
                  <button className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md text-sm hover:bg-red-700 transition-colors" onClick={() => setShowDeleteModal(plan._id)}>حذف</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">إنشاء خطة</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">اختر عميل (من عملائك فقط)</label>
                <input className="mb-2 w-full border rounded px-3 py-2 bg-white dark:bg-gray-900" placeholder="ابحث بالاسم أو الهاتف أو الإيميل" value={memberSearch} onChange={(e)=>setMemberSearch(e.target.value)} />
                <select className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900" value={creatingUserId} onChange={(e)=>setCreatingUserId(e.target.value)}>
                  <option value="">اختر عميل...</option>
                  {myClients.filter(m=>{
                    const q = memberSearch.trim().toLowerCase();
                    if(!q) return true;
                    const phone=(m.phone||'').toLowerCase();
                    const name=(m.name||'').toLowerCase();
                    const email=(m.email||'').toLowerCase();
                    return phone.includes(q)||name.includes(q)||email.includes(q);
                  }).map(m=> (
                    <option key={m._id} value={m._id}>{(m.phone||'بدون هاتف')} - {m.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">اسم الخطة</label>
                <input className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900" placeholder="اكتب اسم الخطة (مثال: خطة تخسيس)" value={formPlanName} onChange={(e)=>setFormPlanName(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm mb-1">الوصف</label>
                <textarea className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900" placeholder="اكتب وصفًا مختصرًا للخطة" value={formDescription} onChange={(e)=>setFormDescription(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm mb-1">تاريخ البداية</label>
                <input type="date" className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900" value={formStartDate} onChange={(e)=>setFormStartDate(e.target.value)} onFocus={(e)=> (e.currentTarget as any).showPicker?.()} onClick={(e)=> (e.currentTarget as any).showPicker?.()} placeholder="تاريخ البداية" />
              </div>
              <div>
                <label className="block text-sm mb-1">تاريخ النهاية</label>
                <input type="date" className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900" value={formEndDate} onChange={(e)=>setFormEndDate(e.target.value)} onFocus={(e)=> (e.currentTarget as any).showPicker?.()} onClick={(e)=> (e.currentTarget as any).showPicker?.()} placeholder="تاريخ النهاية" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">التمارين</span>
                <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={()=>setFormExercises(prev=>[...prev,{name:'',reps:0,sets:0,notes:'',image:''}])}>إضافة تمرين</button>
              </div>
              <div className="grid grid-cols-12 gap-2 text-xs text-gray-600 mb-1">
                <span className="col-span-2">اسم التمرين</span>
                <span className="col-span-2">التكرارات </span>
                <span className="col-span-2">المجموعات </span>
                <span className="col-span-3">ملاحظات</span>
                <span className="col-span-2">الصورة</span>
                <span className="col-span-1">إجراء</span>
              </div>
              {formExercises.map((ex,idx)=> (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center mb-2">
                  <input className="col-span-2 border rounded px-2 py-1 bg-white dark:bg-gray-900" placeholder="مثال: سكوات" value={ex.name} onChange={(e)=>setFormExercises(prev=>prev.map((p,i)=>i===idx?{...p,name:e.target.value}:p))} />
                  <input type="number" className="col-span-2 border rounded px-2 py-1 bg-white dark:bg-gray-900" placeholder="مثال: 12" value={ex.reps} onChange={(e)=>setFormExercises(prev=>prev.map((p,i)=>i===idx?{...p,reps:Number(e.target.value)}:p))} />
                  <input type="number" className="col-span-2 border rounded px-2 py-1 bg-white dark:bg-gray-900" placeholder="مثال: 3" value={ex.sets} onChange={(e)=>setFormExercises(prev=>prev.map((p,i)=>i===idx?{...p,sets:Number(e.target.value)}:p))} />
                  <input className="col-span-3 border rounded px-2 py-1 bg-white dark:bg-gray-900" placeholder="مثال: راحة 60 ثانية" value={ex.notes || ''} onChange={(e)=>setFormExercises(prev=>prev.map((p,i)=>i===idx?{...p,notes:e.target.value}:p))} />
                  <div className="col-span-2 flex flex-col gap-1">
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="text-xs border rounded px-1 py-1 bg-white dark:bg-gray-900" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setFormExercises((prev) => prev.map((p, i) => i === idx ? { ...p, imageFile: file } : p));
                        }
                      }}
                    />
                    {ex.image && !ex.imageFile && (
                      <img src={ex.image} alt={ex.name} className="w-8 h-8 object-cover rounded" />
                    )}
                    {ex.imageFile && (
                      <img src={URL.createObjectURL(ex.imageFile)} alt={ex.name} className="w-8 h-8 object-cover rounded" />
                    )}
                  </div>
                  <button className="col-span-1 text-red-600" onClick={()=>setFormExercises(prev=>prev.filter((_,i)=>i!==idx))}>حذف</button>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded" onClick={()=>setShowCreateModal(false)}>إلغاء</button>
              <button className={`px-4 py-2 rounded text-white ${canSubmitCreate?'bg-gray-600 hover:bg-gray-700':'bg-gray-300 cursor-not-allowed'}`} disabled={!canSubmitCreate} onClick={async()=>{
                try{ 
                  setLoading(true); 

                  // تحضير التمارين للرسالة - فصل التمارين مع الصور عن التمارين العادية
                  const exercisesWithoutImages: any[] = [];
                  const exercisesWithImages: any[] = [];

                  formExercises.forEach((exercise) => {
                    const exerciseData = {
                      name: exercise.name,
                      reps: exercise.reps,
                      sets: exercise.sets,
                      notes: exercise.notes
                    };

                    // إذا كان هناك ملف صورة جديد
                    if (exercise.imageFile) {
                      exercisesWithImages.push({
                        ...exerciseData,
                        image: exercise.imageFile
                      });
                    }
                    // إذا كان هناك URL صورة موجود
                    else if (exercise.image && exercise.image.trim() !== '') {
                      exercisesWithoutImages.push({
                        ...exerciseData,
                        image: exercise.image
                      });
                    }
                    // إذا لم تكن هناك صورة
                    else {
                      exercisesWithoutImages.push(exerciseData);
                    }
                  });

                  // إعداد البيانات الأساسية للخطة (بدون التمارين التي تحتوي على صور)
                  const workoutData = {
                    planName: formPlanName,
                    description: formDescription,
                    startDate: new Date(formStartDate) as any,
                    endDate: new Date(formEndDate) as any,
                    exercises: exercisesWithoutImages,
                    trainerId: currentTrainerId
                  };

                  // إنشاء الخطة أولاً (بدون التمارين التي تحتوي على صور)
                  const created = await workoutService.createWorkoutPlan(creatingUserId, workoutData);

                  // إضافة التمارين التي تحتوي على صور بعد إنشاء الخطة
                  if (exercisesWithImages.length > 0) {
                    await workoutService.addExercisesWithImagesToPlan(created._id, exercisesWithImages);
                  }

                  setWorkoutPlans(prev=> allowedUserIds.has(created.userId) ? [created,...prev] : prev); 
                  setShowCreateModal(false); 
                  resetForm();
                }catch(e:any){alert(e.message||'فشل إنشاء الخطة');}finally{setLoading(false);}
              }}>حفظ</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">تعديل الخطة</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">اسم الخطة</label>
                <input className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900" value={formPlanName} onChange={(e)=>setFormPlanName(e.target.value)} placeholder="اكتب اسم الخطة" />
              </div>
              <div>
                <label className="block text-sm mb-1">الوصف</label>
                <input className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900" value={formDescription} onChange={(e)=>setFormDescription(e.target.value)} placeholder="اكتب وصف الخطة" />
              </div>
              <div>
                <label className="block text-sm mb-1">تاريخ البداية</label>
                <input type="date" className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900" value={formStartDate} onChange={(e)=>setFormStartDate(e.target.value)} placeholder="تاريخ البداية" />
              </div>
              <div>
                <label className="block text-sm mb-1">تاريخ النهاية</label>
                <input type="date" className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900" value={formEndDate} onChange={(e)=>setFormEndDate(e.target.value)} placeholder="تاريخ النهاية" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">التمارين</span>
                <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={async()=>{ if(!editingPlan)return; try{ const updated=await workoutService.addExerciseToPlan(editingPlan._id,{name:'تمرين جديد',reps:8,sets:3,notes:'',image:''}); setWorkoutPlans(prev=>prev.map(p=>p._id===editingPlan._id?updated:p)); setEditingPlan(updated);}catch(e:any){alert(e.message||'فشل إضافة التمرين');}}}>إضافة تمرين</button>
              </div>
              <div className="grid grid-cols-12 gap-2 text-xs text-gray-600 mb-1">
                <span className="col-span-2">اسم التمرين</span>
                <span className="col-span-2">التكرارات </span>
                <span className="col-span-2">المجموعات </span>
                <span className="col-span-3">ملاحظات</span>
                <span className="col-span-2">الصورة</span>
                <span className="col-span-1">إجراء</span>
              </div>
              {(editingPlan.exercises||[]).map((ex)=> (
                <div key={ex._id} className="grid grid-cols-12 gap-2 items-center mb-2">
                  <input className="col-span-2 border rounded px-2 py-1 bg-white dark:bg-gray-900" placeholder="مثال: سكوات" defaultValue={ex.name} onBlur={async(e)=>{ if(!editingPlan)return; try{ const updated=await workoutService.updateExerciseInPlan(editingPlan._id,ex._id,{name:e.target.value}); setWorkoutPlans(prev=>prev.map(p=>p._id===editingPlan._id?updated:p)); setEditingPlan(updated);}catch(err:any){alert(err.message||'تعذر تحديث التمرين');}}} />
                  <input type="number" className="col-span-2 border rounded px-2 py-1 bg-white dark:bg-gray-900" placeholder="مثال: 12" defaultValue={ex.reps} onBlur={async(e)=>{ if(!editingPlan)return; try{ const updated=await workoutService.updateExerciseInPlan(editingPlan._id,ex._id,{reps:Number(e.target.value)}); setWorkoutPlans(prev=>prev.map(p=>p._id===editingPlan._id?updated:p)); setEditingPlan(updated);}catch(err:any){alert(err.message||'تعذر تحديث التمرين');}}} />
                  <input type="number" className="col-span-2 border rounded px-2 py-1 bg-white dark:bg-gray-900" placeholder="مثال: 3" defaultValue={ex.sets} onBlur={async(e)=>{ if(!editingPlan)return; try{ const updated=await workoutService.updateExerciseInPlan(editingPlan._id,ex._id,{sets:Number(e.target.value)}); setWorkoutPlans(prev=>prev.map(p=>p._id===editingPlan._id?updated:p)); setEditingPlan(updated);}catch(err:any){alert(err.message||'تعذر تحديث التمرين');}}} />
                  <input className="col-span-3 border rounded px-2 py-1 bg-white dark:bg-gray-900" placeholder="مثال: راحة 60 ثانية" defaultValue={ex.notes || ''} onBlur={async(e)=>{ if(!editingPlan)return; try{ const updated=await workoutService.updateExerciseInPlan(editingPlan._id,ex._id,{notes:e.target.value}); setWorkoutPlans(prev=>prev.map(p=>p._id===editingPlan._id?updated:p)); setEditingPlan(updated);}catch(err:any){alert(err.message||'تعذر تحديث التمرين');}}} />
                  <div className="col-span-2 flex flex-col gap-1">
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="text-xs border rounded px-1 py-1 bg-white dark:bg-gray-900" 
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const updated = await workoutService.updateExerciseInPlan(editingPlan!._id, ex._id, { image: file } as any);
                            setWorkoutPlans((prev) => prev.map((p) => p._id === editingPlan!._id ? updated : p));
                            setEditingPlan(updated);
                            // مسح قيمة الملف بعد التحديث
                            e.target.value = '';
                          } catch (err: any) {
                            alert(err.message || 'تعذر تحديث صورة التمرين');
                          }
                        }
                      }}
                    />
                    {ex.image && (
                      <div className="relative group">
                        <img 
                          src={ex.image} 
                          alt={ex.name} 
                          className="w-8 h-8 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity" 
                          onClick={() => {
                            // إنشاء نافذة لعرض الصورة بالحجم الكامل
                            const newWindow = window.open('', '_blank');
                            if (newWindow) {
                              newWindow.document.write(`
                                <html>
                                  <head><title>صورة التمرين - ${ex.name}</title></head>
                                  <body style="margin:0; padding:20px; background:#f5f5f5; text-align:center;">
                                    <img src="${ex.image}" style="max-width:90%; max-height:90%; border-radius:8px; box-shadow:0 4px 8px rgba(0,0,0,0.2);" />
                                    <p style="margin-top:20px; font-family:Arial; color:#666;">${ex.name}</p>
                                  </body>
                                </html>
                              `);
                              newWindow.document.close();
                            }
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded transition-all flex items-center justify-center">
                          <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">🔍</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <button className="col-span-1 text-red-600" onClick={async()=>{ if(!editingPlan)return; try{ const updated=await workoutService.removeExerciseFromPlan(editingPlan._id,ex._id); setWorkoutPlans(prev=>prev.map(p=>p._id===editingPlan._id?updated:p)); setEditingPlan(updated);}catch(err:any){alert(err.message||'تعذر حذف التمرين');}}}>حذف</button>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded" onClick={()=>{setShowEditModal(false); setEditingPlan(null);}}>إغلاق</button>
              <button className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded" onClick={async()=>{ if(!editingPlan)return; try{ const updated=await workoutService.updateWorkoutPlan(editingPlan._id,{planName:formPlanName,description:formDescription,startDate:formStartDate?new Date(formStartDate) as any:undefined,endDate:formEndDate?new Date(formEndDate) as any:undefined}); setWorkoutPlans(prev=>prev.map(p=>p._id===editingPlan._id?updated:p)); setEditingPlan(updated); setShowEditModal(false);}catch(e:any){alert(e.message||'فشل حفظ الخطة');}}}>حفظ</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">تأكيد الحذف</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">هل أنت متأكد من حذف هذه الخطة؟</p>
            <div className="mt-4 flex justify-end space-x-2">
              <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded" onClick={()=>setShowDeleteModal(null)}>إلغاء</button>
              <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded" onClick={async()=>{ try{ await workoutService.deleteWorkoutPlan(showDeleteModal as string); setWorkoutPlans(prev=>prev.filter(p=>p._id!==showDeleteModal)); setShowDeleteModal(null);}catch(e:any){alert(e.message||'فشل حذف الخطة');}}}>حذف</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerPlansOverview;
