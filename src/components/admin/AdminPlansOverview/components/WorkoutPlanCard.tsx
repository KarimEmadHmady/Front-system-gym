import React from 'react';
import { useTranslations } from 'next-intl';
import type { WorkoutPlan } from '@/types';

interface Props {
  plan: WorkoutPlan;
  userNameMap: Record<string, string>;
  onView: (plan: WorkoutPlan) => void;
  onEdit: (plan: WorkoutPlan) => void;
  onDelete: (id: string) => void;
  onImageClick: (src: string, alt: string) => void;
}

const WorkoutPlanCard: React.FC<Props> = ({ plan, userNameMap, onView, onEdit, onDelete, onImageClick }) => {
  const t = useTranslations();

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white">{plan.planName}</h4>
      </div>

      <p className="text-xs text-gray-500 mb-1">👤 اسم المستخدم: {userNameMap[plan.userId] || '...'}</p>
      {(plan as any).trainerId && (
        <p className="text-xs text-gray-500 mb-2">🧑‍🏫 اسم المدرب: {userNameMap[(plan as any).trainerId] || '...'}</p>
      )}
      {plan.description && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{plan.description}</p>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">🏋️ {t('AdminPlansOverview.labels.exercises')}</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {plan.exercises?.length || 0} {t('AdminPlansOverview.exerciseUnit')}
          </span>
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
                      onClick={() => onImageClick(String(ex.image), String(ex.name || ''))}
                    />
                  )}
                  <span className="text-gray-600 dark:text-gray-300 font-medium">{ex.name}</span>
                </div>
              ))}
              {plan.exercises.length > 3 && (
                <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full">
                  +{plan.exercises.length - 3} أكثر
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">⏳ {t('AdminPlansOverview.labels.duration')}</span>
          <span className="text-sm font-medium text-white dark:text-white">
            {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="mt-6 flex space-x-2">
        <button
          className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-md text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          onClick={() => onView(plan)}
        >
          <span className="inline-flex items-center gap-2 justify-center w-full">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="#2563eb" strokeWidth="2"/>
              <circle cx="12" cy="12" r="3" stroke="#2563eb" strokeWidth="2"/>
            </svg>
            عرض
          </span>
        </button>
        <button
          className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-md text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          onClick={() => onEdit(plan)}
        >
          {t('AdminPlansOverview.edit')}
        </button>
        <button
          className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md text-sm hover:bg-red-700 transition-colors"
          onClick={() => onDelete(plan._id)}
        >
          حذف
        </button>
      </div>
    </div>
  );
};

export default WorkoutPlanCard;