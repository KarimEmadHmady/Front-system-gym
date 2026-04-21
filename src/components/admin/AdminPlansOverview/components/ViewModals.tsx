import React from 'react';
import type { WorkoutPlan } from '@/types';
import type { DietPlan } from '@/types';

// ─── View Workout Plan ────────────────────────────────────────────────────────

interface ViewWorkoutProps {
  plan: WorkoutPlan | null;
  userNameMap: Record<string, string>;
  onClose: () => void;
  onImageClick: (src: string, alt: string) => void;
}

export const ViewWorkoutModal: React.FC<ViewWorkoutProps> = ({ plan, userNameMap, onClose, onImageClick }) => {
  if (!plan) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-3xl p-6 max-h-[85vh] overflow-y-auto">
        <button className="absolute top-3 left-3 text-gray-400 hover:text-gray-600" onClick={onClose}>✕</button>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">تفاصيل خطة التمرين</h3>

        <div className="space-y-3">
          <Row label="اسم الخطة" value={plan.planName} />
          {plan.description && <Row label="الوصف" value={plan.description} />}
          <Row label="المستخدم" value={userNameMap[(plan as any).userId] || (plan as any).userId} />
          {(plan as any).trainerId && <Row label="المدرب" value={userNameMap[(plan as any).trainerId] || (plan as any).trainerId} />}
          <Row label="الفترة" value={`${new Date(plan.startDate).toLocaleDateString()} - ${new Date(plan.endDate).toLocaleDateString()}`} />

          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mt-4 mb-2">التمارين ({plan.exercises?.length || 0})</h4>
            <div className="border rounded-lg divide-y dark:border-gray-700">
              {(plan.exercises || []).map((ex, i) => (
                <div key={i} className="p-4 text-sm border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  <div className="flex items-start gap-4">
                    {ex.image && (
                      <div className="flex-shrink-0 relative group cursor-pointer" onClick={() => onImageClick(String(ex.image), String(ex.name || ''))}>
                        <img src={ex.image} alt={ex.name || ''} className="w-20 h-20 object-cover rounded-lg hover:opacity-80 transition-opacity shadow-sm border border-gray-200 dark:border-gray-600" />
                        <div className="absolute inset-0 pointer-events-none rounded flex items-center justify-center">
                          <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">🔍</span>
                        </div>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900 dark:text-white text-base">{ex.name}</span>
                        <span className="text-gray-600 dark:text-gray-300 font-medium">{ex.sets} مجموعات × {ex.reps} تكرارات</span>
                      </div>
                      {ex.notes && (
                        <div className="text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded text-sm">
                          <span className="font-medium">ملاحظات:</span> {ex.notes}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {(!plan.exercises || plan.exercises.length === 0) && (
                <div className="p-3 text-sm text-gray-500">لا يوجد تمارين</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── View Diet Plan ───────────────────────────────────────────────────────────

interface ViewDietProps {
  plan: DietPlan | null;
  userNameMap: Record<string, string>;
  onClose: () => void;
}

export const ViewDietModal: React.FC<ViewDietProps> = ({ plan, userNameMap, onClose }) => {
  if (!plan) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-3xl p-6 max-h-[85vh] overflow-y-auto">
        <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-600" onClick={onClose}>✕</button>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">تفاصيل الخطة الغذائية</h3>

        <div className="space-y-3">
          <Row label="اسم الخطة" value={plan.planName} />
          {plan.description && <Row label="الوصف" value={plan.description} />}
          <Row label="المستخدم" value={userNameMap[(plan as any).userId] || (plan as any).userId} />
          {(plan as any).trainerId && <Row label="المدرب" value={userNameMap[(plan as any).trainerId] || (plan as any).trainerId} />}
          <Row label="الفترة" value={`${new Date(plan.startDate).toLocaleDateString()}${plan.endDate ? ` - ${new Date(plan.endDate).toLocaleDateString()}` : ''}`} />

          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mt-4 mb-2">الوجبات ({plan.meals?.length || 0})</h4>
            <div className="border rounded-lg divide-y dark:border-gray-700">
              {(plan.meals || []).map((m, i) => (
                <div key={m.mealId || i} className="p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">{m.mealName}</span>
                    <span className="text-gray-600 dark:text-gray-300">{m.calories} س.ح • {m.quantity}</span>
                  </div>
                  {m.notes && <div className="text-gray-500 dark:text-gray-400 mt-1">ملاحظات: {m.notes}</div>}
                </div>
              ))}
              {(!plan.meals || plan.meals.length === 0) && (
                <div className="p-3 text-sm text-gray-500">لا يوجد وجبات</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── shared helper ────────────────────────────────────────────────────────────
const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-gray-600 dark:text-gray-400">{label}:</span>
    <span className="text-gray-900 dark:text-white font-medium">{value}</span>
  </div>
);