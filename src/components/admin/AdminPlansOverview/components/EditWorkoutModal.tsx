import React, { useState, useEffect } from 'react';
import { workoutService } from '@/services';
import type { WorkoutPlan } from '@/types';

interface Props {
  open: boolean;
  plan: WorkoutPlan | null;
  onClose: () => void;
  onUpdated: (plan: WorkoutPlan) => void;
  onRefresh: (planId: string) => Promise<WorkoutPlan>;
  onImageClick: (src: string, alt: string) => void;
}

const EditWorkoutModal: React.FC<Props> = ({ open, plan, onClose, onUpdated, onRefresh, onImageClick }) => {
  const [planName, setPlanName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [editingPlan, setEditingPlan] = useState<WorkoutPlan | null>(null);

  useEffect(() => {
    if (plan) {
      setEditingPlan(plan);
      setPlanName(plan.planName || '');
      setDescription((plan as any).description || '');
      setStartDate(plan.startDate ? new Date(plan.startDate).toISOString().slice(0, 10) : '');
      setEndDate(plan.endDate ? new Date(plan.endDate).toISOString().slice(0, 10) : '');
    }
  }, [plan]);

  if (!open || !editingPlan) return null;

  const handleSave = async () => {
    if (!editingPlan) return;
    try {
      const updated = await workoutService.updateWorkoutPlan(editingPlan._id, {
        planName,
        description,
        startDate: startDate ? new Date(startDate) as any : undefined,
        endDate: endDate ? new Date(endDate) as any : undefined,
      });
      onUpdated(updated);
      onClose();
    } catch (e: any) {
      alert(e.message || 'فشل حفظ الخطة');
    }
  };

  const handleAddExercise = async () => {
    try {
      const updated = await workoutService.addExerciseToPlan(editingPlan._id, { name: 'تمرين جديد', reps: 8, sets: 3, notes: '', image: '' });
      const refreshed = await onRefresh(editingPlan._id);
      setEditingPlan(refreshed);
    } catch (e: any) {
      alert(e.message || 'فشل إضافة التمرين');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl p-6">
        <button className="absolute top-3 left-3 text-gray-400 hover:text-gray-600" onClick={onClose}>✕</button>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">تعديل الخطة</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">اسم الخطة</label>
            <input value={planName} onChange={(e) => setPlanName(e.target.value)} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">الوصف</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900" />
          </div>
          <div>
            <label className="block text-sm mb-1">تاريخ البداية</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} onClick={(e) => (e.currentTarget as any).showPicker?.()} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900" />
          </div>
          <div>
            <label className="block text-sm mb-1">تاريخ النهاية</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} onClick={(e) => (e.currentTarget as any).showPicker?.()} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900" />
          </div>
        </div>

        {/* التمارين */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">التمارين</h4>
            <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={handleAddExercise}>إضافة تمرين</button>
          </div>
          <div className="grid grid-cols-12 gap-2 text-xs text-gray-600 mb-1">
            <span className="col-span-2">اسم التمرين</span>
            <span className="col-span-2">التكرارات</span>
            <span className="col-span-2">المجموعات</span>
            <span className="col-span-3">ملاحظات</span>
            <span className="col-span-2">الصورة</span>
            <span className="col-span-1">إجراء</span>
          </div>
          <div className="space-y-3 max-h-60 overflow-auto pr-1">
            {(editingPlan.exercises || []).map((ex) => (
              <div key={ex._id} className="grid grid-cols-12 gap-2 items-center">
                <input className="col-span-2 border rounded px-2 py-1 bg-white dark:bg-gray-900" defaultValue={ex.name} onBlur={async (e) => {
                  try {
                    const updated = await workoutService.updateExerciseInPlan(editingPlan._id, ex._id, { name: e.target.value });
                    const refreshed = await onRefresh(editingPlan._id);
                    setEditingPlan(refreshed);
                  } catch (err: any) { alert(err.message || 'تعذر تحديث التمرين'); }
                }} />
                <input type="number" className="col-span-2 border rounded px-2 py-1 bg-white dark:bg-gray-900" defaultValue={ex.reps} onBlur={async (e) => {
                  try {
                    await workoutService.updateExerciseInPlan(editingPlan._id, ex._id, { reps: Number(e.target.value) });
                    const refreshed = await onRefresh(editingPlan._id);
                    setEditingPlan(refreshed);
                  } catch (err: any) { alert(err.message || 'تعذر تحديث التمرين'); }
                }} />
                <input type="number" className="col-span-2 border rounded px-2 py-1 bg-white dark:bg-gray-900" defaultValue={ex.sets} onBlur={async (e) => {
                  try {
                    await workoutService.updateExerciseInPlan(editingPlan._id, ex._id, { sets: Number(e.target.value) });
                    const refreshed = await onRefresh(editingPlan._id);
                    setEditingPlan(refreshed);
                  } catch (err: any) { alert(err.message || 'تعذر تحديث التمرين'); }
                }} />
                <input className="col-span-3 border rounded px-2 py-1 bg-white dark:bg-gray-900" defaultValue={ex.notes || ''} onBlur={async (e) => {
                  try {
                    await workoutService.updateExerciseInPlan(editingPlan._id, ex._id, { notes: e.target.value });
                    const refreshed = await onRefresh(editingPlan._id);
                    setEditingPlan(refreshed);
                  } catch (err: any) { alert(err.message || 'تعذر تحديث التمرين'); }
                }} />
                <div className="col-span-2 flex flex-col gap-1">
                  <input type="file" accept="image/*" className="text-xs border rounded px-1 py-1 bg-white dark:bg-gray-900"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        await workoutService.updateExerciseInPlan(editingPlan._id, ex._id, { image: file } as any);
                        const refreshed = await onRefresh(editingPlan._id);
                        setEditingPlan(refreshed);
                        e.target.value = '';
                      } catch (err: any) { alert(err.message || 'تعذر تحديث صورة التمرين'); }
                    }}
                  />
                  {ex.image && (
                    <div className="relative group cursor-pointer" onClick={() => onImageClick(String(ex.image), String(ex.name || ''))}>
                      <img src={ex.image} alt={ex.name || ''} className="w-20 h-20 object-cover rounded-lg hover:opacity-80 transition-opacity shadow-sm border border-gray-200 dark:border-gray-600" />
                      <div className="absolute inset-0 pointer-events-none rounded flex items-center justify-center">
                        <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">🔍</span>
                      </div>
                    </div>
                  )}
                </div>
                <button className="col-span-1 text-red-600" onClick={async () => {
                  try {
                    await workoutService.removeExerciseFromPlan(editingPlan._id, ex._id);
                    const refreshed = await onRefresh(editingPlan._id);
                    setEditingPlan(refreshed);
                  } catch (err: any) { alert(err.message || 'تعذر حذف التمرين'); }
                }}>حذف</button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-2">
          <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded" onClick={onClose}>إغلاق</button>
          <button className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded" onClick={handleSave}>حفظ</button>
        </div>
      </div>
    </div>
  );
};

export default EditWorkoutModal;