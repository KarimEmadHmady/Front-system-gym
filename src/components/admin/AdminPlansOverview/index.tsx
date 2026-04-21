'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { useCustomAlert } from '@/hooks/useCustomAlert';
import CustomAlert from '@/components/ui/CustomAlert';
import VideoTutorial from '@/components/VideoTutorial';
import type { WorkoutPlan } from '@/types';
import type { DietPlan } from '@/types';

import { useWorkoutPlans } from './hooks/useWorkoutPlans';
import { useDietPlans } from './hooks/useDietPlans';
import { useUserNameMap } from './hooks/useUserNameMap';
import { exportWorkoutPlansToExcel, exportDietPlansToExcel } from './utils/exportPlans';

import PlansHeader from './components/PlansHeader';
import WorkoutPlanCard from './components/WorkoutPlanCard';
import DietPlanCard from './components/DietPlanCard';
import CreateWorkoutModal from './components/CreateWorkoutModal';
import EditWorkoutModal from './components/EditWorkoutModal';
import CreateDietModal from './components/CreateDietModal';
import EditDietModal from './components/EditDietModal';
import { ViewWorkoutModal, ViewDietModal } from './components/ViewModals';
import { DeleteWorkoutModal, DeleteDietModal } from './components/DeleteConfirmModals';
import ImageLightbox from './components/ImageLightbox';

type AdminPlansOverviewProps = { filterUserIds?: Set<string> };

const AdminPlansOverview = ({ filterUserIds }: AdminPlansOverviewProps = {}) => {
  const { user } = useAuth();
  const { alertState, showSuccess, showError, hideAlert } = useCustomAlert();
  const t = useTranslations();

  const currentRole = (user as any)?.role as string | undefined;
  const currentTrainerId = useMemo(() => ((user as any)?._id ?? (user as any)?.id ?? ''), [user]);

  // ── data hooks ───────────────────────────────────────────────────────────────
  const {
    workoutPlans, loading, error,
    members, trainers,
    refreshPlan, deletePlan, addPlan, updatePlan,
  } = useWorkoutPlans(currentRole, currentTrainerId);

  const {
    dietPlans,
    dietLoading, dietError,
    dietMealsLoading, setDietMealsLoading,
    dietMealsError, setDietMealsError,
    refreshDietPlan, addDietPlan, deleteDietPlan,
  } = useDietPlans();

  const { userNameMap } = useUserNameMap(workoutPlans, dietPlans);

  // ── ui state ─────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('workout');
  const [searchType, setSearchType] = useState<'member' | 'trainer'>('member');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedTrainerId, setSelectedTrainerId] = useState('');

  // modal visibility
  const [createWorkoutOpen, setCreateWorkoutOpen] = useState(false);
  const [editWorkoutOpen, setEditWorkoutOpen] = useState(false);
  const [viewWorkoutPlan, setViewWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [deleteWorkoutId, setDeleteWorkoutId] = useState<string | null>(null);

  const [createDietOpen, setCreateDietOpen] = useState(false);
  const [editDietOpen, setEditDietOpen] = useState(false);
  const [viewDietPlan, setViewDietPlan] = useState<DietPlan | null>(null);
  const [deleteDietId, setDeleteDietId] = useState<string | null>(null);

  const [editingWorkoutPlan, setEditingWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [editingDietPlan, setEditingDietPlan] = useState<DietPlan | null>(null);
  const [enlargedImage, setEnlargedImage] = useState<{ src: string; alt: string } | null>(null);

  // ── filtered plans ───────────────────────────────────────────────────────────
  const filteredWorkoutPlans = useMemo(() => {
    let plans = (!filterUserIds || filterUserIds.size === 0)
      ? workoutPlans
      : workoutPlans.filter((p) => filterUserIds.has(p.userId as any));
    if (searchType === 'member' && selectedUserId) plans = plans.filter((p) => p.userId === selectedUserId);
    if (searchType === 'trainer' && selectedTrainerId) plans = plans.filter((p) => (p as any).trainerId === selectedTrainerId);
    return plans;
  }, [workoutPlans, filterUserIds, searchType, selectedUserId, selectedTrainerId]);

  const filteredDietPlans = useMemo(() => {
    let plans = (!filterUserIds || filterUserIds.size === 0)
      ? (dietPlans as any[])
      : (dietPlans as any[]).filter((p: any) => filterUserIds.has(p.userId));
    if (searchType === 'member' && selectedUserId) plans = plans.filter((p: any) => p.userId === selectedUserId);
    if (searchType === 'trainer' && selectedTrainerId) plans = plans.filter((p: any) => p.trainerId === selectedTrainerId);
    return plans;
  }, [dietPlans, filterUserIds, searchType, selectedUserId, selectedTrainerId]);

  // ── handlers ─────────────────────────────────────────────────────────────────
  const handleExport = () => {
    if (activeTab === 'workout') exportWorkoutPlansToExcel(filteredWorkoutPlans, userNameMap, showSuccess, showError);
    else exportDietPlansToExcel(filteredDietPlans, userNameMap, showSuccess, showError);
  };

  const openEditWorkout = (plan: WorkoutPlan) => { setEditingWorkoutPlan(plan); setEditWorkoutOpen(true); };
  const openEditDiet = (plan: DietPlan) => { setEditingDietPlan(plan); setEditDietOpen(true); };

  const handleRefreshWorkout = async (planId: string): Promise<WorkoutPlan> => {
    const updated = await refreshPlan(planId);
    if (editingWorkoutPlan?._id === planId) setEditingWorkoutPlan(updated);
    return updated;
  };

  return (
    <>
      <div className="space-y-6">
        <VideoTutorial
          videoId="sLhXQC7up6o"
          title="تحكم كامل للمدربين في إنشاء وتعديل وإرسال الخطط"
          position="bottom-right"
          buttonText="شرح"
        />

        <PlansHeader
          activeTab={activeTab}
          currentRole={currentRole}
          searchType={searchType}
          searchQuery={searchQuery}
          selectedUserId={selectedUserId}
          selectedTrainerId={selectedTrainerId}
          members={members}
          trainers={trainers}
          onSearchTypeChange={setSearchType}
          onSearchQueryChange={setSearchQuery}
          onSelectedUserChange={setSelectedUserId}
          onSelectedTrainerChange={setSelectedTrainerId}
          onCreateWorkout={() => setCreateWorkoutOpen(true)}
          onCreateDiet={() => setCreateDietOpen(true)}
          onExport={handleExport}
        />

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow_sm border border-gray-200 dark:border-gray-700">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'workout', name: t('AdminPlansOverview.tabs.workout'), count: filteredWorkoutPlans.length, icon: '🏋️' },
                { id: 'diet', name: t('AdminPlansOverview.tabs.diet'), count: filteredDietPlans.length, icon: '🍎' },
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
                  <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 py-1 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {loading && <p className="text-sm text-gray-600 dark:text-gray-400">جاري التحميل...</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeTab === 'workout' && filteredWorkoutPlans.map((plan) => (
                <WorkoutPlanCard
                  key={plan._id}
                  plan={plan}
                  userNameMap={userNameMap}
                  onView={setViewWorkoutPlan}
                  onEdit={openEditWorkout}
                  onDelete={setDeleteWorkoutId}
                  onImageClick={(src, alt) => setEnlargedImage({ src, alt })}
                />
              ))}

              {activeTab === 'diet' && (
                dietLoading ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400">جاري التحميل...</p>
                ) : dietError ? (
                  <p className="text-sm text-red-600">{dietError}</p>
                ) : filteredDietPlans.map((plan: any) => (
                  <DietPlanCard
                    key={plan._id}
                    plan={plan}
                    userNameMap={userNameMap}
                    onView={setViewDietPlan}
                    onEdit={openEditDiet}
                    onDelete={setDeleteDietId}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      <CreateWorkoutModal
        open={createWorkoutOpen}
        members={members}
        trainers={trainers}
        currentRole={currentRole}
        currentTrainerId={currentTrainerId}
        onClose={() => setCreateWorkoutOpen(false)}
        onCreated={(plan) => { addPlan(plan); setCreateWorkoutOpen(false); }}
      />

      <EditWorkoutModal
        open={editWorkoutOpen}
        plan={editingWorkoutPlan}
        onClose={() => { setEditWorkoutOpen(false); setEditingWorkoutPlan(null); }}
        onUpdated={(plan) => { updatePlan(plan); setEditWorkoutOpen(false); }}
        onRefresh={handleRefreshWorkout}
        onImageClick={(src, alt) => setEnlargedImage({ src, alt })}
      />

      <ViewWorkoutModal
        plan={viewWorkoutPlan}
        userNameMap={userNameMap}
        onClose={() => setViewWorkoutPlan(null)}
        onImageClick={(src, alt) => setEnlargedImage({ src, alt })}
      />

      <DeleteWorkoutModal
        planId={deleteWorkoutId}
        onClose={() => setDeleteWorkoutId(null)}
        onConfirm={async (id) => { await deletePlan(id); }}
      />

      <CreateDietModal
        open={createDietOpen}
        members={members}
        trainers={trainers}
        currentRole={currentRole}
        onClose={() => setCreateDietOpen(false)}
        onCreated={(plan) => { addDietPlan(plan); setCreateDietOpen(false); }}
      />

      <EditDietModal
        open={editDietOpen}
        plan={editingDietPlan}
        dietMealsLoading={dietMealsLoading}
        dietMealsError={dietMealsError}
        onClose={() => { setEditDietOpen(false); setEditingDietPlan(null); }}
        onRefresh={refreshDietPlan}
        onMealsLoadingChange={setDietMealsLoading}
        onMealsErrorChange={setDietMealsError}
      />

      <ViewDietModal
        plan={viewDietPlan}
        userNameMap={userNameMap}
        onClose={() => setViewDietPlan(null)}
      />

      <DeleteDietModal
        planId={deleteDietId}
        onClose={() => setDeleteDietId(null)}
        onConfirm={async (id) => { await deleteDietPlan(id); }}
      />

      <ImageLightbox image={enlargedImage} onClose={() => setEnlargedImage(null)} />

      <CustomAlert
        isOpen={alertState.isOpen}
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
        onClose={hideAlert}
      />
    </>
  );
};

export default AdminPlansOverview;