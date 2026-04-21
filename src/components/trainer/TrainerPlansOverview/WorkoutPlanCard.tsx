'use client';

import React from 'react';

interface WorkoutPlanCardProps {
  plan: any;
  userNameMap: Record<string, string>;
  getTypeText: (type: string) => string;
  getDifficultyColor: (difficulty: string) => string;
  getDifficultyText: (difficulty: string) => string;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  onEdit: (plan: any) => void;
  onDelete: (planId: string) => void;
}

const WorkoutPlanCard: React.FC<WorkoutPlanCardProps> = ({
  plan,
  userNameMap,
  getTypeText,
  getDifficultyColor,
  getDifficultyText,
  getStatusColor,
  getStatusText,
  onEdit,
  onDelete
}) => {
  return (
    <div
      key={plan._id}
      className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white">
          {plan.planName}
        </h4>
      </div>
      {plan.description && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          {plan.description}
        </p>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">الفترة:</span>
          <span className="text-gray-900 dark:text-white">
            {new Date(plan.startDate).toLocaleDateString()} {plan.endDate ? `- ${new Date(plan.endDate).toLocaleDateString()}` : ''}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">عدد الوجبات:</span>
          <span className="text-gray-900 dark:text-white">{plan.meals?.length || 0} وجبة</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">التمارين:</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">{plan.exercises?.length || 0} تمرين</span>
        </div>
        {plan.exercises && plan.exercises.length > 0 && (
          <div className="mt-3">
            <div className="text-xs text-gray-500 mb-1">عينة من التمارين:</div>
            <div className="flex flex-wrap gap-2">
              {plan.exercises.slice(0, 3).map((ex: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2 text-xs bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-full">
                  {ex.image && (
                    <img 
                      src={ex.image} 
                      alt={ex.name} 
                      className="w-5 h-5 object-cover rounded-full cursor-pointer hover:scale-110 transition-transform" 
                      onClick={() => {
                        const newWindow = window.open('', '_blank');
                        if (newWindow) {
                          newWindow.document.write(`
                            <html>
                              <head><title>${ex.name}</title></head>
                              <body style="margin:0; padding:20px; background:#f5f5f5; text-align:center;">
                                <img src="${ex.image}" style="max-width:90%; max-height:90%; border-radius:8px; box-shadow:0 4px 8px rgba(0,0,0,0.2);" />
                                <p style="margin-top:20px; font-family:Arial; color:#666;">${ex.name}</p>
                              </body>
                            </html>
                          `);
                          newWindow.document.close();
                        }
                      }}
                    />
                  )}
                  <span className="text-gray-600 dark:text-gray-300 font-medium">{ex.name}</span>
                </div>
              ))}
              {plan.exercises.length > 3 && (
                <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full">+{plan.exercises.length - 3} أكثر</span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600 dark:text-gray-400">المدة:</span>
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
        </span>
      </div>

      <div className="mt-6 flex space-x-2">
        <button className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-md text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" onClick={() => onEdit(plan)}>تعديل</button>
        <button className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md text-sm hover:bg-red-700 transition-colors" onClick={() => onDelete(plan._id)}>حذف</button>
      </div>
    </div>
  );
};

export default WorkoutPlanCard;
