'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { WorkoutPlan } from '@/types';
import { workoutService, userService, dietService } from '@/services';
import type { DietPlan } from '@/types';

const ManagerPlansOverview = () => {
  const [activeTab, setActiveTab] = useState('workout');
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [dietLoading, setDietLoading] = useState(false);
  const [dietError, setDietError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<null | string>(null);
  const [creatingUserId, setCreatingUserId] = useState('');
  const [formPlanName, setFormPlanName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formExercises, setFormExercises] = useState<Array<{ name: string; reps: number; sets: number; notes?: string }>>([]);
  const [editingPlan, setEditingPlan] = useState<WorkoutPlan | null>(null);
  const [members, setMembers] = useState<Array<{ _id: string; name: string; email?: string; phone?: string }>>([]);
  const [trainers, setTrainers] = useState<Array<{ _id: string; name: string; email?: string; phone?: string }>>([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [trainerSearch, setTrainerSearch] = useState('');
  const [creatingTrainerId, setCreatingTrainerId] = useState('');
  const [userNameMap, setUserNameMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await workoutService.getAllWorkoutPlans();
        setWorkoutPlans((res as any).data || (res as any));
        try {
          const membersRes = await userService.getUsersByRole('member', { limit: 100 });
          const data = (membersRes as any).data || (membersRes as any);
          setMembers(data?.items || data || []);
        } catch {}
        try {
          const trainersRes = await userService.getUsersByRole('trainer', { limit: 100 });
          const tdata = (trainersRes as any).data || (trainersRes as any);
          setTrainers(tdata?.items || tdata || []);
        } catch {}
      } catch (e: any) {
        setError(e.message || 'فشل تحميل الخطط');
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  useEffect(() => {
    const fetchDietPlans = async () => {
      try {
        setDietLoading(true);
        setDietError(null);
        const res: any = await dietService.getDietPlans();
        setDietPlans((res?.data || res || []) as DietPlan[]);
      } catch (e: any) {
        setDietError(e.message || 'فشل تحميل الخطط الغذائية');
      } finally {
        setDietLoading(false);
      }
    };
    fetchDietPlans();
  }, []);

  useEffect(() => {
    const loadNames = async () => {
      const ids = Array.from(new Set([
        ...((workoutPlans || []).map(p => p.userId).filter(Boolean)),
        ...((workoutPlans || []).map((p:any) => p.trainerId).filter(Boolean)),
        ...((dietPlans || []).map((p:any) => p.userId).filter(Boolean)),
        ...((dietPlans || []).map((p:any) => p.trainerId).filter(Boolean)),
      ]));
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
  }, [workoutPlans, dietPlans, userNameMap]);

  const resetForm = () => {
    setCreatingUserId('');
    setCreatingTrainerId('');
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
    setFormExercises((plan.exercises || []).map((e) => ({ name: e.name, reps: e.reps, sets: e.sets, notes: e.notes })));
    setShowEditModal(true);
  };
  const canSubmitCreate = useMemo(() => creatingUserId && formPlanName && formStartDate && formEndDate, [creatingUserId, formPlanName, formStartDate, formEndDate]);

  // removed static dietPlans

  const currentPlans = activeTab === 'workout' ? workoutPlans : (dietPlans as any[]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-0">
            إدارة الخطط
          </h3>
          <div className="flex space-x-2">
            <button className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700 transition-colors" onClick={openCreate}>
              إضافة خطة جديدة
            </button>
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
                  <p className="text-xs text-gray-500 mb-1">اسم المستخدم: {userNameMap[(plan as any).userId] || '...'}</p>
                  {(plan as any).trainerId && (
                    <p className="text-xs text-gray-500 mb-2">اسم المدرب: {userNameMap[(plan as any).trainerId] || '...'}</p>
                  )}
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
          {loading && <p className="text-sm text-gray-600 dark:text-gray-400">جاري التحميل...</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
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
                <p className="text-xs text-gray-500 mb-1">اسم المستخدم: {userNameMap[plan.userId] || '...'}</p>
                {(plan as any).trainerId && (
                  <p className="text-xs text-gray-500 mb-2">اسم المدرب: {userNameMap[(plan as any).trainerId] || '...'}</p>
                )}
                {plan.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{plan.description}</p>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">التمارين:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{plan.exercises?.length || 0} تمرين</span>
                      </div>
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
                <input className="mb-2 w-full border rounded px-3 py-2 bg-white dark:bg-gray-900" placeholder="ابحث بالاسم أو الهاتف أو الإيميل" value={memberSearch} onChange={(e)=>setMemberSearch(e.target.value)} />
                <select className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900" value={creatingUserId} onChange={(e)=>setCreatingUserId(e.target.value)}>
                  <option value="">اختر عضو...</option>
                  {members.filter(m=>{
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
                <input className="mb-2 w-full border rounded px-3 py-2 bg-white dark:bg-gray-900" placeholder="ابحث عن مدرب" value={trainerSearch} onChange={(e)=>setTrainerSearch(e.target.value)} />
                <select className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900" value={creatingTrainerId} onChange={(e)=>setCreatingTrainerId(e.target.value)}>
                  <option value="">اختر مدرب...</option>
                  {trainers.filter(m=>{
                    const q = trainerSearch.trim().toLowerCase();
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
                <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={()=>setFormExercises(prev=>[...prev,{name:'',reps:0,sets:0,notes:''}])}>إضافة تمرين</button>
              </div>
              <div className="grid grid-cols-12 gap-2 text-xs text-gray-600 mb-1">
                <span className="col-span-3">اسم التمرين</span>
                <span className="col-span-2">التكرارات </span>
                <span className="col-span-2">المجموعات </span>
                <span className="col-span-4">ملاحظات</span>
                <span className="col-span-1">إجراء</span>
              </div>
              {formExercises.map((ex,idx)=> (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center mb-2">
                  <input className="col-span-3 border rounded px-2 py-1 bg-white dark:bg-gray-900" placeholder="مثال: سكوات" value={ex.name} onChange={(e)=>setFormExercises(prev=>prev.map((p,i)=>i===idx?{...p,name:e.target.value}:p))} />
                  <input type="number" className="col-span-2 border rounded px-2 py-1 bg-white dark:bg-gray-900" placeholder="مثال: 12" value={ex.reps} onChange={(e)=>setFormExercises(prev=>prev.map((p,i)=>i===idx?{...p,reps:Number(e.target.value)}:p))} />
                  <input type="number" className="col-span-2 border rounded px-2 py-1 bg-white dark:bg-gray-900" placeholder="مثال: 3" value={ex.sets} onChange={(e)=>setFormExercises(prev=>prev.map((p,i)=>i===idx?{...p,sets:Number(e.target.value)}:p))} />
                  <input className="col-span-4 border rounded px-2 py-1 bg-white dark:bg-gray-900" placeholder="مثال: راحة 60 ثانية" value={ex.notes || ''} onChange={(e)=>setFormExercises(prev=>prev.map((p,i)=>i===idx?{...p,notes:e.target.value}:p))} />
                  <button className="col-span-1 text-red-600" onClick={()=>setFormExercises(prev=>prev.filter((_,i)=>i!==idx))}>حذف</button>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded" onClick={()=>setShowCreateModal(false)}>إلغاء</button>
              <button className={`px-4 py-2 rounded text-white ${canSubmitCreate?'bg-gray-600 hover:bg-gray-700':'bg-gray-300 cursor-not-allowed'}`} disabled={!canSubmitCreate} onClick={async()=>{
                try{ setLoading(true); const created=await workoutService.createWorkoutPlan(creatingUserId,{planName:formPlanName,description:formDescription,startDate:new Date(formStartDate) as any,endDate:new Date(formEndDate) as any,exercises: formExercises as any, trainerId: creatingTrainerId || undefined}); setWorkoutPlans(prev=>[created,...prev]); setShowCreateModal(false); resetForm();}catch(e:any){alert(e.message||'فشل إنشاء الخطة');}finally{setLoading(false);}
              }}>حفظ</button>
            </div>
          </div>
        </div>
      )}
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
                <input type="date" className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900" onClick={(e) => e.currentTarget.showPicker?.()} value={formStartDate} onChange={(e)=>setFormStartDate(e.target.value)} placeholder="تاريخ البداية" />
              </div>
              <div>
                <label className="block text-sm mb-1">تاريخ النهاية</label>
                <input type="date" className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900" onClick={(e) => e.currentTarget.showPicker?.()} value={formEndDate} onChange={(e)=>setFormEndDate(e.target.value)} placeholder="تاريخ النهاية" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">التمارين</span>
                <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={async()=>{ if(!editingPlan)return; try{ const updated=await workoutService.addExerciseToPlan(editingPlan._id,{name:'تمرين جديد',reps:8,sets:3,notes:''}); setWorkoutPlans(prev=>prev.map(p=>p._id===editingPlan._id?updated:p)); setEditingPlan(updated);}catch(e:any){alert(e.message||'فشل إضافة التمرين');}}}>إضافة تمرين</button>
              </div>
              <div className="grid grid-cols-12 gap-2 text-xs text-gray-600 mb-1">
                <span className="col-span-3">اسم التمرين</span>
                <span className="col-span-2">التكرارات </span>
                <span className="col-span-2">المجموعات </span>
                <span className="col-span-4">ملاحظات</span>
                <span className="col-span-1">إجراء</span>
              </div>
              {(editingPlan.exercises||[]).map((ex)=> (
                <div key={ex._id} className="grid grid-cols-12 gap-2 items-center mb-2">
                  <input className="col-span-3 border rounded px-2 py-1 bg-white dark:bg-gray-900" placeholder="مثال: سكوات" defaultValue={ex.name} onBlur={async(e)=>{ if(!editingPlan)return; try{ const updated=await workoutService.updateExerciseInPlan(editingPlan._id,ex._id,{name:e.target.value}); setWorkoutPlans(prev=>prev.map(p=>p._id===editingPlan._id?updated:p)); setEditingPlan(updated);}catch(err:any){alert(err.message||'تعذر تحديث التمرين');}}} />
                  <input type="number" className="col-span-2 border rounded px-2 py-1 bg-white dark:bg-gray-900" placeholder="مثال: 12" defaultValue={ex.reps} onBlur={async(e)=>{ if(!editingPlan)return; try{ const updated=await workoutService.updateExerciseInPlan(editingPlan._id,ex._id,{reps:Number(e.target.value)}); setWorkoutPlans(prev=>prev.map(p=>p._id===editingPlan._id?updated:p)); setEditingPlan(updated);}catch(err:any){alert(err.message||'تعذر تحديث التمرين');}}} />
                  <input type="number" className="col-span-2 border rounded px-2 py-1 bg-white dark:bg-gray-900" placeholder="مثال: 3" defaultValue={ex.sets} onBlur={async(e)=>{ if(!editingPlan)return; try{ const updated=await workoutService.updateExerciseInPlan(editingPlan._id,ex._id,{sets:Number(e.target.value)}); setWorkoutPlans(prev=>prev.map(p=>p._id===editingPlan._id?updated:p)); setEditingPlan(updated);}catch(err:any){alert(err.message||'تعذر تحديث التمرين');}}} />
                  <input className="col-span-4 border rounded px-2 py-1 bg-white dark:bg-gray-900" placeholder="مثال: راحة 60 ثانية" defaultValue={ex.notes || ''} onBlur={async(e)=>{ if(!editingPlan)return; try{ const updated=await workoutService.updateExerciseInPlan(editingPlan._id,ex._id,{notes:e.target.value}); setWorkoutPlans(prev=>prev.map(p=>p._id===editingPlan._id?updated:p)); setEditingPlan(updated);}catch(err:any){alert(err.message||'تعذر تحديث التمرين');}}} />
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

export default ManagerPlansOverview;
