'use client';

import React from 'react';

interface DietPlanCardProps {
  plan: any;
  userNameMap: Record<string, string>;
  getTypeText: (type: string) => string;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  onEdit: (plan: any) => void;
  onDelete: (planId: string) => void;
}

const DietPlanCard: React.FC<DietPlanCardProps> = ({
  plan,
  userNameMap,
  getTypeText,
  getStatusColor,
  getStatusText,
  onEdit,
  onDelete
}) => {
  return (
    <div key={plan._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white">{plan.planName}</h4>
      </div>
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
  );
};

export default DietPlanCard;
