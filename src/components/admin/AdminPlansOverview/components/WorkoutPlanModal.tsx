import React from 'react';
import type { WorkoutPlan } from '@/types';

interface WorkoutPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: WorkoutPlan | null;
  onImageClick: (src: string, alt: string) => void;
}

const WorkoutPlanModal: React.FC<WorkoutPlanModalProps> = ({
  isOpen,
  onClose,
  plan,
  onImageClick
}) => {
  if (!isOpen || !plan) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {plan.planName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Description</h3>
            <p className="text-gray-700 dark:text-gray-300">{plan.description || 'No description'}</p>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Duration</h3>
            <p className="text-gray-700 dark:text-gray-300">
              {plan.startDate && plan.endDate 
                ? `${new Date(plan.startDate).toLocaleDateString()} - ${new Date(plan.endDate).toLocaleDateString()}`
                : 'Not specified'
              }
            </p>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Exercises</h3>
            <div className="space-y-4">
              {plan.exercises.map((exercise, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">{exercise.name}</h4>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {exercise.sets} sets × {exercise.reps} reps
                    </div>
                  </div>
                  
                  {exercise.notes && (
                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      <strong>Notes:</strong> {exercise.notes}
                    </div>
                  )}

                  {exercise.image && (
                    <div className="mt-2">
                      <img
                        src={exercise.image}
                        alt={exercise.name}
                        className="w-32 h-32 object-cover rounded cursor-pointer hover:opacity-80"
                        onClick={() => onImageClick(exercise.image!, exercise.name)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutPlanModal;
