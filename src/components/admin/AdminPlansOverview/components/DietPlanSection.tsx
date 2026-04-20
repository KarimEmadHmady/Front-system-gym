import React from 'react';
import type { DietPlan } from '@/types';
import DietPlanCard from './DietPlanCard';

interface DietPlanSectionProps {
  dietPlans: DietPlan[];
  userNameMap: Record<string, string>;
  loading: boolean;
  error: string | null;
  onViewPlan: (plan: DietPlan) => void;
  onEditPlan: (plan: DietPlan) => void;
  onDeletePlan: (planId: string) => void;
  onCreatePlan: () => void;
  filterUserIds?: Set<string>;
}

const DietPlanSection: React.FC<DietPlanSectionProps> = ({
  dietPlans,
  userNameMap,
  loading,
  error,
  onViewPlan,
  onEditPlan,
  onDeletePlan,
  onCreatePlan,
  filterUserIds
}) => {
  const filteredPlans = filterUserIds 
    ? dietPlans.filter(plan => filterUserIds.has(plan.userId))
    : dietPlans;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading diet plans...</div>
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
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Diet Plans</h2>
        <button
          onClick={onCreatePlan}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Create Diet Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans.map(plan => (
          <DietPlanCard
            key={plan._id}
            plan={plan}
            userNameMap={userNameMap}
            onView={onViewPlan}
            onEdit={onEditPlan}
            onDelete={onDeletePlan}
          />
        ))}
      </div>

      {filteredPlans.length === 0 && !loading && !error && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No diet plans found</div>
          <button
            onClick={onCreatePlan}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Create First Diet Plan
          </button>
        </div>
      )}
    </div>
  );
};

export default DietPlanSection;
