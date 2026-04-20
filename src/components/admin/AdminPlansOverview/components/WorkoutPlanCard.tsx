import React from 'react';
import type { WorkoutPlan } from '@/types';

interface WorkoutPlanCardProps {
  plan: WorkoutPlan;
  userNameMap: Record<string, string>;
  onView: (plan: WorkoutPlan) => void;
  onEdit: (plan: WorkoutPlan) => void;
  onDelete: (planId: string) => void;
  onImageClick: (src: string, alt: string) => void;
}

const WorkoutPlanCard: React.FC<WorkoutPlanCardProps> = ({
  plan,
  userNameMap,
  onView,
  onEdit,
  onDelete,
  onImageClick
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{plan.planName}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {userNameMap[plan.userId] || 'Unknown User'}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onView(plan)}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            View
          </button>
          <button
            onClick={() => onEdit(plan)}
            className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(plan._id)}
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
        {plan.startDate && plan.endDate && (
          <span>{new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}</span>
        )}
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Exercises:</div>
        {plan.exercises.slice(0, 3).map((exercise, index) => (
          <div key={index} className="text-sm text-gray-600 dark:text-gray-300">
            <div className="font-medium">{exercise.name}</div>
            <div className="text-xs text-gray-500">
              {exercise.sets} sets × {exercise.reps} reps
              {exercise.notes && <span> - {exercise.notes}</span>}
            </div>
            {exercise.image && (
              <div className="mt-1">
                <img
                  src={exercise.image}
                  alt={exercise.name}
                  className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-80"
                  onClick={() => onImageClick(exercise.image!, exercise.name)}
                />
              </div>
            )}
          </div>
        ))}
        {plan.exercises.length > 3 && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            +{plan.exercises.length - 3} more exercises
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutPlanCard;
