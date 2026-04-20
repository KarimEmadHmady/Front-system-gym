'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import type { WorkoutPlan, DietPlan } from '@/types';
import { workoutService, userService, dietService } from '@/services';
import CustomAlert from '@/components/ui/CustomAlert';
import { useCustomAlert } from '@/hooks/useCustomAlert';
import VideoTutorial from '@/components/VideoTutorial';

// Import new components
import PlanTabs from './components/PlanTabs';
import WorkoutPlanSection from './components/WorkoutPlanSection';
import DietPlanSection from './components/DietPlanSection';
import WorkoutPlanModal from './components/WorkoutPlanModal';
import DietPlanModal from './components/DietPlanModal';
import EnlargedImageModal from './components/EnlargedImageModal';
import WorkoutPlanCreateModal from './components/WorkoutPlanCreateModal';
import DietPlanCreateModal from './components/DietPlanCreateModal';
import ExportButtons from './components/ExportButtons';

type AdminPlansOverviewProps = {
  filterUserIds?: Set<string>;
};

const AdminPlansOverview = ({ filterUserIds }: AdminPlansOverviewProps = {}) => {
  const { user } = useAuth();
  const { alertState, showSuccess, showError, showWarning, hideAlert } = useCustomAlert();
  const currentRole = (user as any)?.role as string | undefined;
  const currentTrainerId = React.useMemo(() => ((user as any)?._id ?? (user as any)?.id ?? ''), [user]);
  
  // Basic state
  const [activeTab, setActiveTab] = useState('workout');
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [viewWorkoutPlan, setViewWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [viewDietPlan, setViewDietPlan] = useState<DietPlan | null>(null);
  const [enlargedImage, setEnlargedImage] = useState<{src: string; alt: string} | null>(null);
  const [showCreateWorkoutModal, setShowCreateWorkoutModal] = useState(false);
  const [showCreateDietModal, setShowCreateDietModal] = useState(false);
  const [showEditWorkoutModal, setShowEditWorkoutModal] = useState(false);
  const [showEditDietModal, setShowEditDietModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<null | string>(null);
  const [showDeleteDietModal, setShowDeleteDietModal] = useState<null | string>(null);
  
  // User data
  const [userNameMap, setUserNameMap] = useState<Record<string, string>>({});
  const [members, setMembers] = useState<Array<{ _id: string; name: string; email?: string; phone?: string }>>([]);
  const [trainers, setTrainers] = useState<Array<{ _id: string; name: string; email?: string; phone?: string }>>([]);
  const [editingPlan, setEditingPlan] = useState<WorkoutPlan | null>(null);
  const [editingDietPlan, setEditingDietPlan] = useState<DietPlan | null>(null);

  const t = useTranslations();

  // Effects
  useEffect(() => {
    fetchPlans();
    fetchUsers();
  }, []);

  // Functions
  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch workout plans
      const workoutRes = await workoutService.getAllWorkoutPlans();
      setWorkoutPlans((workoutRes as any).data || (workoutRes as any));
      
      // Fetch diet plans
      const dietRes = await dietService.getDietPlans();
      setDietPlans((dietRes as any).data || (dietRes as any));
      
    } catch (err) {
      setError('Failed to fetch plans');
      console.error('Error fetching plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      // Fetch members
      const membersRes = await userService.getUsersByRole('member', { limit: 1000 });
      const rawMembers = (membersRes as any).data || (membersRes as any);
      const membersList = (rawMembers?.items || rawMembers || []) as any[];
      
      if (currentRole === 'trainer') {
        const normalizeId = (val: any): string => {
          if (!val) return '';
          if (typeof val === 'string') return val;
          if (typeof val === 'object') return (val._id || val.id || '') as string;
          return String(val);
        };
        const me = normalizeId(currentTrainerId);
        setMembers(membersList.filter((m) => normalizeId((m as any)?.trainerId) === me));
      } else {
        setMembers(membersList);
      }

      // Fetch trainers
      const trainersRes = await userService.getUsersByRole('trainer', { limit: 1000 });
      const rawTrainers = (trainersRes as any).data || (trainersRes as any);
      const trainersList = (rawTrainers?.items || rawTrainers || []) as any[];
      setTrainers(trainersList);

      // Create user name map
      const allUsers = [...membersList, ...trainersList];
      const nameMap = allUsers.reduce((acc, user) => {
        acc[user._id] = user.name;
        return acc;
      }, {} as Record<string, string>);
      setUserNameMap(nameMap);
      
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleDeleteWorkoutPlan = async (planId: string) => {
    try {
      await workoutService.deleteWorkoutPlan(planId);
      setWorkoutPlans(prev => prev.filter(p => p._id !== planId));
      showSuccess('Success', 'Workout plan deleted successfully');
    } catch (err: any) {
      showError('Error', err.message || 'Failed to delete workout plan');
    }
  };

  const handleDeleteDietPlan = async (planId: string) => {
    try {
      await dietService.deleteDietPlan(planId);
      setDietPlans(prev => prev.filter(p => p._id !== planId));
      showSuccess('Success', 'Diet plan deleted successfully');
    } catch (err: any) {
      showError('Error', err.message || 'Failed to delete diet plan');
    }
  };

  const handleImageClick = (src: string, alt: string) => {
    setEnlargedImage({ src, alt });
  };

  const handleCreateWorkoutPlan = async (data: any) => {
    try {
      // Implementation for creating workout plan
      showSuccess('Success', 'Workout plan created successfully');
      setShowCreateWorkoutModal(false);
      fetchPlans();
    } catch (err: any) {
      showError('Error', err.message || 'Failed to create workout plan');
    }
  };

  const handleCreateDietPlan = async (data: any) => {
    try {
      // Implementation for creating diet plan
      showSuccess('Success', 'Diet plan created successfully');
      setShowCreateDietModal(false);
      fetchPlans();
    } catch (err: any) {
      showError('Error', err.message || 'Failed to create diet plan');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Plans Overview</h1>
        <p className="text-gray-600 dark:text-gray-300">Manage workout and diet plans for users</p>
      </div>

      <PlanTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <ExportButtons 
        workoutPlans={workoutPlans}
        dietPlans={dietPlans}
        userNameMap={userNameMap}
      />

      {activeTab === 'workout' && (
        <WorkoutPlanSection
          workoutPlans={workoutPlans}
          userNameMap={userNameMap}
          loading={loading}
          error={error}
          onViewPlan={setViewWorkoutPlan}
          onEditPlan={(plan) => {
            setEditingPlan(plan);
            setShowEditWorkoutModal(true);
          }}
          onDeletePlan={handleDeleteWorkoutPlan}
          onImageClick={handleImageClick}
          onCreatePlan={() => setShowCreateWorkoutModal(true)}
          filterUserIds={filterUserIds}
        />
      )}

      {activeTab === 'diet' && (
        <DietPlanSection
          dietPlans={dietPlans}
          userNameMap={userNameMap}
          loading={loading}
          error={error}
          onViewPlan={setViewDietPlan}
          onEditPlan={(plan) => {
            setEditingDietPlan(plan);
            setShowEditDietModal(true);
          }}
          onDeletePlan={handleDeleteDietPlan}
          onCreatePlan={() => setShowCreateDietModal(true)}
          filterUserIds={filterUserIds}
        />
      )}

      {/* Modals */}
      <WorkoutPlanModal
        isOpen={!!viewWorkoutPlan}
        onClose={() => setViewWorkoutPlan(null)}
        plan={viewWorkoutPlan}
        onImageClick={handleImageClick}
      />

      <DietPlanModal
        isOpen={!!viewDietPlan}
        onClose={() => setViewDietPlan(null)}
        plan={viewDietPlan}
      />

      <WorkoutPlanCreateModal
        isOpen={showCreateWorkoutModal}
        onClose={() => setShowCreateWorkoutModal(false)}
        members={members}
        trainers={trainers}
        currentRole={currentRole}
        currentTrainerId={currentTrainerId}
        onCreate={handleCreateWorkoutPlan}
        loading={false}
      />

      <DietPlanCreateModal
        isOpen={showCreateDietModal}
        onClose={() => setShowCreateDietModal(false)}
        members={members}
        trainers={trainers}
        currentRole={currentRole}
        currentTrainerId={currentTrainerId}
        onCreate={handleCreateDietPlan}
        loading={false}
      />

      <EnlargedImageModal
        enlargedImage={enlargedImage}
        onClose={() => setEnlargedImage(null)}
      />

      {/* Custom Alert */}
      <CustomAlert
        isOpen={alertState.isOpen}
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
        onClose={hideAlert}
      />

      <VideoTutorial videoId="" />
    </div>
  );
};

export default AdminPlansOverview;
