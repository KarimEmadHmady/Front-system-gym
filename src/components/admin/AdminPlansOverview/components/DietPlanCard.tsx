import React from 'react';
import type { DietPlan } from '@/types';

interface Props {
  plan: DietPlan;
  userNameMap: Record<string, string>;
  onView: (plan: DietPlan) => void;
  onEdit: (plan: DietPlan) => void;
  onDelete: (id: string) => void;
}

const DietPlanCard: React.FC<Props> = ({ plan, userNameMap, onView, onEdit, onDelete }) => (
  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <h4 className="text-lg font-medium text-gray-900 dark:text-white">{plan.planName}</h4>
      <div className="flex gap-2">
        <button
          className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded text-xs inline-flex items-center gap-1"
          onClick={() => onView(plan)}
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="#2563eb" strokeWidth="2"/>
            <circle cx="12" cy="12" r="3" stroke="#2563eb" strokeWidth="2"/>
          </svg>
          عرض
        </button>
        <button
          className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded text-xs"
          onClick={() => onEdit(plan)}
        >
          تعديل
        </button>
        <button
          className="bg-red-600 text-white px-3 py-1 rounded text-xs"
          onClick={() => onDelete(plan._id)}
        >
          حذف
        </button>
      </div>
    </div>

    <p className="text-xs text-gray-500 mb-1">👤 اسم المستخدم: {userNameMap[(plan as any).userId] || '...'}</p>
    {(plan as any).trainerId && (
      <p className="text-xs text-gray-500 mb-2">🧑‍🏫 اسم المدرب: {userNameMap[(plan as any).trainerId] || '...'}</p>
    )}
    {plan.description && (
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{plan.description}</p>
    )}

    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">📅 الفترة:</span>
        <span className="text-gray-900 dark:text-white">
          {new Date(plan.startDate).toLocaleDateString()}
          {plan.endDate ? ` - ${new Date(plan.endDate).toLocaleDateString()}` : ''}
        </span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">🍽️ عدد الوجبات:</span>
        <span className="text-gray-900 dark:text-white">{plan.meals?.length || 0} وجبة</span>
      </div>
    </div>
  </div>
);

export default DietPlanCard;