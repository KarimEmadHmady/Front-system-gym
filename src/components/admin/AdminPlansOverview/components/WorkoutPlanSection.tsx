import React from 'react';
import type { WorkoutPlan } from '@/types';
import WorkoutPlanCard from './WorkoutPlanCard';

interface WorkoutPlanSectionProps {
  workoutPlans: WorkoutPlan[];
  userNameMap: Record<string, string>;
  loading: boolean;
  error: string | null;
  onViewPlan: (plan: WorkoutPlan) => void;
  onEditPlan: (plan: WorkoutPlan) => void;
  onDeletePlan: (planId: string) => void;
  onImageClick: (src: string, alt: string) => void;
  onCreatePlan: () => void;
  filterUserIds?: Set<string>;
}

const WorkoutPlanSection: React.FC<WorkoutPlanSectionProps> = ({
  workoutPlans,
  userNameMap,
  loading,
  error,
  onViewPlan,
  onEditPlan,
  onDeletePlan,
  onImageClick,
  onCreatePlan,
  filterUserIds
}) => {
  const filteredPlans = filterUserIds 
    ? workoutPlans.filter(plan => filterUserIds.has(plan.userId))
    : workoutPlans;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading workout plans...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Workout Plans</h2>
        <button
          onClick={onCreatePlan}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Workout Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans.map(plan => (
          <WorkoutPlanCard
            key={plan._id}
            plan={plan}
            userNameMap={userNameMap}
            onView={onViewPlan}
            onEdit={onEditPlan}
            onDelete={onDeletePlan}
            onImageClick={onImageClick}
          />
        ))}
      </div>

      {filteredPlans.length === 0 && !loading && !error && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No workout plans found</div>
          <button
            onClick={onCreatePlan}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create First Workout Plan
          </button>
        </div>
      )}
    </div>
  );
};

export default WorkoutPlanSection;
