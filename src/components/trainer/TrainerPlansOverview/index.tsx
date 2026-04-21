'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { WorkoutPlan } from '@/types';
import { workoutService, userService, dietService } from '@/services';
import type { DietPlan } from '@/types';
import { useAuth } from '@/hooks/useAuth';

// Import extracted components
import PlansHeader from './PlansHeader';
import PlansTabs from './PlansTabs';
import WorkoutPlanCard from './WorkoutPlanCard';
import DietPlanCard from './DietPlanCard';
import CreateWorkoutModal from './CreateWorkoutModal';
import CreateDietModal from './CreateDietModal';
import EditWorkoutModal from './EditWorkoutModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import { getTypeText, getDifficultyColor, getDifficultyText, getStatusColor, getStatusText } from './utils';

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

  const currentPlans = activeTab === 'workout' ? workoutPlans : (dietPlans as any[]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">{error}</div>
        <button 
          onClick={() => {
            setError(null);
            // Re-fetch data
          }}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PlansHeader
        activeTab={activeTab}
        onShowCreateModal={openCreate}
        onShowCreateDietModal={() => {
          setCreateDietUserId('');
          setCreateDietName('');
          setCreateDietDesc('');
          setCreateDietStart('');
          setCreateDietEnd('');
          setCreateDietMeals([]);
          setCreateDietError(null);
          setShowCreateDietModal(true);
        }}
      />

      {/* Create Diet Plan Modal */}
      <CreateDietModal
        showCreateDietModal={showCreateDietModal}
        createDietUserId={createDietUserId}
        createDietName={createDietName}
        createDietDesc={createDietDesc}
        createDietStart={createDietStart}
        createDietEnd={createDietEnd}
        createDietMeals={createDietMeals}
        createDietLoading={createDietLoading}
        createDietError={createDietError}
        onShowCreateDietModal={setShowCreateDietModal}
        onCreateDietUserIdChange={setCreateDietUserId}
        onCreateDietNameChange={setCreateDietName}
        onCreateDietDescChange={setCreateDietDesc}
        onCreateDietStartChange={setCreateDietStart}
        onCreateDietEndChange={setCreateDietEnd}
        onCreateDietMealsChange={setCreateDietMeals}
        onCreateDietPlan={async () => {
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
        }}
      />

      {/* Tabs */}
      <PlansTabs
        activeTab={activeTab}
        workoutPlans={workoutPlans}
        dietPlans={dietPlans}
        onTabChange={setActiveTab}
        dietLoading={dietLoading}
        dietError={dietError}
      />

      {/* Plans List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === 'workout' && workoutPlans.map((plan) => (
            <WorkoutPlanCard
              key={plan._id}
              plan={plan}
              userNameMap={userNameMap}
              getTypeText={getTypeText}
              getDifficultyColor={getDifficultyColor}
              getDifficultyText={getDifficultyText}
              getStatusColor={getStatusColor}
              getStatusText={getStatusText}
              onEdit={openEdit}
              onDelete={setShowDeleteModal}
            />
          ))}
          {activeTab === 'diet' && dietPlans.map((plan) => (
            <DietPlanCard
              key={plan._id}
              plan={plan}
              userNameMap={userNameMap}
              getTypeText={getTypeText}
              getStatusColor={getStatusColor}
              getStatusText={getStatusText}
              onEdit={openEdit}
              onDelete={setShowDeleteModal}
            />
          ))}
        </div>
      </div>

      {/* Create Modal */}
      <CreateWorkoutModal
        showCreateModal={showCreateModal}
        creatingUserId={creatingUserId}
        formPlanName={formPlanName}
        formDescription={formDescription}
        formStartDate={formStartDate}
        formEndDate={formEndDate}
        formExercises={formExercises}
        myClients={myClients}
        memberSearch={memberSearch}
        onShowCreateModal={setShowCreateModal}
        onCreatingUserIdChange={setCreatingUserId}
        onFormPlanNameChange={setFormPlanName}
        onFormDescriptionChange={setFormDescription}
        onFormStartDateChange={setFormStartDate}
        onFormEndDateChange={setFormEndDate}
        onFormExercisesChange={setFormExercises}
        onCreatePlan={async () => {
          try { 
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
          }catch(e:any){alert(e.message||'فشل إنشاء الخطة');}finally{setLoading(false);}}
      }
      />
      

      {/* Edit Modal */}
      <EditWorkoutModal
        showEditModal={showEditModal}
        editingPlan={editingPlan}
        formPlanName={formPlanName}
        formDescription={formDescription}
        formStartDate={formStartDate}
        formEndDate={formEndDate}
        formExercises={formExercises}
        onShowEditModal={setShowEditModal}
        onFormPlanNameChange={setFormPlanName}
        onFormDescriptionChange={setFormDescription}
        onFormStartDateChange={setFormStartDate}
        onFormEndDateChange={setFormEndDate}
        onFormExercisesChange={setFormExercises}
        onUpdatePlan={async () => {
          try { 
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

            // تحديث الخطة أولاً (بدون التمارين التي تحتوي على صور)
            await workoutService.updateWorkoutPlan(editingPlan!._id, workoutData);

            // إضافة التمارين التي تحتوي على صور بعد تحديث الخطة
            if (exercisesWithImages.length > 0) {
              await workoutService.addExercisesWithImagesToPlan(editingPlan!._id, exercisesWithImages);
            }

            setWorkoutPlans(prev=> prev.map(p=>p._id===editingPlan!._id?{...p,...workoutData}:p)); 
            setShowEditModal(false); 
          }catch(e:any){alert(e.message||'فشل تحديث الخطة');}finally{setLoading(false);}}
        }
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        showDeleteModal={showDeleteModal}
        onShowDeleteModal={setShowDeleteModal}
        onDeletePlan={async () => {
          if (!showDeleteModal) return;
          try {
            await workoutService.deleteWorkoutPlan(showDeleteModal);
            setWorkoutPlans(prev => prev.filter(p => p._id !== showDeleteModal));
            setShowDeleteModal(null);
          } catch (e: any) {
            alert(e.message || 'فشل حذف الخطة');
          }
        }}
      />
    </div>
  );
};

export default TrainerPlansOverview;
