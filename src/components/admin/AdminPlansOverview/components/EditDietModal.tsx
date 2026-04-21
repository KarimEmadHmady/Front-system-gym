import React, { useState, useEffect } from 'react';
import { dietService } from '@/services';
import type { DietPlan } from '@/types';

interface Props {
  open: boolean;
  plan: DietPlan | null;
  dietMealsLoading: boolean;
  dietMealsError: string | null;
  onClose: () => void;
  onRefresh: (planId: string) => Promise<DietPlan>;
  onMealsLoadingChange: (v: boolean) => void;
  onMealsErrorChange: (v: string | null) => void;
}

const EditDietModal: React.FC<Props> = ({
  open, plan, dietMealsLoading, dietMealsError,
  onClose, onRefresh, onMealsLoadingChange, onMealsErrorChange,
}) => {
  const [editingPlan, setEditingPlan] = useState<DietPlan | null>(null);
  const [planName, setPlanName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (plan) {
      setEditingPlan(plan);
      setPlanName(plan.planName || '');
      setDescription(plan.description || '');
      setStartDate(plan.startDate ? new Date(plan.startDate).toISOString().slice(0, 10) : '');
      setEndDate(plan.endDate ? new Date(plan.endDate).toISOString().slice(0, 10) : '');
    }
  }, [plan]);

  if (!open || !editingPlan) return null;

  const refresh = async () => {
    const refreshed = await onRefresh(editingPlan._id);
    setEditingPlan(refreshed);
    return refreshed;
  };

  const handleAddMeal = async () => {
    try {
      onMealsLoadingChange(true);
      await dietService.addMealToPlan(editingPlan._id, { mealName: 'وجبة جديدة', calories: 1, quantity: '1', notes: '' });
      await refresh();
    } catch (e: any) {
      onMealsErrorChange(e.message || 'فشل إضافة الوجبة');
    } finally {
      onMealsLoadingChange(false);
    }
  };

  const handleSave = async () => {
    try {
      onMealsLoadingChange(true);
      await dietService.updateDietPlan(editingPlan._id, {
        planName,
        description,
        startDate: startDate ? new Date(startDate) as any : undefined,
        endDate: endDate ? new Date(endDate) as any : undefined,
      });
      await refresh();
      onClose();
    } catch (e: any) {
      onMealsErrorChange(e.message || 'فشل حفظ الخطة الغذائية');
    } finally {
      onMealsLoadingChange(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl p-6">
        <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-600" onClick={onClose}>✕</button>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">تعديل الخطة الغذائية</h3>

        <div className="mb-4">
          <label className="block text-sm mb-1">اسم الخطة</label>
          <input className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900" value={planName} onChange={(e) => setPlanName(e.target.value)} />
        </div>
        <div className="mb-4">
          <label className="block text-sm mb-1">الوصف</label>
          <textarea className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm mb-1">تاريخ البداية</label>
            <input type="date" className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900" value={startDate} onChange={(e) => setStartDate(e.target.value)} onClick={(e) => (e.currentTarget as any).showPicker?.()} />
          </div>
          <div>
            <label className="block text-sm mb-1">تاريخ النهاية</label>
            <input type="date" className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900" value={endDate} onChange={(e) => setEndDate(e.target.value)} onClick={(e) => (e.currentTarget as any).showPicker?.()} />
          </div>
        </div>

        {/* الوجبات */}
        <div className="mb-4">
          <label className="block text-sm mb-1">الوجبات</label>
          <button className="px-3 py-1 bg-green-600 text-white rounded mb-2" onClick={handleAddMeal}>إضافة وجبة</button>
          <div className="grid grid-cols-12 gap-2 text-xs text-gray-600 mb-1">
            <span className="col-span-3">اسم الوجبة</span>
            <span className="col-span-2">السعرات</span>
            <span className="col-span-2">الكمية</span>
            <span className="col-span-3">ملاحظات</span>
            <span className="col-span-2">إجراء</span>
          </div>
          <div className="space-y-3 max-h-60 overflow-auto pr-1">
            {(editingPlan.meals || []).map((meal) => (
              <div key={meal.mealId} className="grid grid-cols-12 gap-2 items-center mb-2">
                <input className="col-span-3 border rounded px-2 py-1 bg-white dark:bg-gray-900" defaultValue={meal.mealName} onBlur={async (e) => {
                  try {
                    onMealsLoadingChange(true);
                    await dietService.updateMealInPlan(editingPlan._id, meal.mealId, { mealName: e.target.value, calories: meal.calories, quantity: meal.quantity, notes: meal.notes || '' });
                    await refresh();
                  } catch (err: any) { onMealsErrorChange(err.message || 'تعذر تحديث الوجبة'); }
                  finally { onMealsLoadingChange(false); }
                }} />
                <input type="number" className="col-span-2 border rounded px-2 py-1 bg-white dark:bg-gray-900" defaultValue={meal.calories} onBlur={async (e) => {
                  try {
                    onMealsLoadingChange(true);
                    await dietService.updateMealInPlan(editingPlan._id, meal.mealId, { mealName: meal.mealName, calories: Number(e.target.value), quantity: meal.quantity, notes: meal.notes || '' });
                    await refresh();
                  } catch (err: any) { onMealsErrorChange(err.message || 'تعذر تحديث الوجبة'); }
                  finally { onMealsLoadingChange(false); }
                }} />
                <input className="col-span-2 border rounded px-2 py-1 bg-white dark:bg-gray-900" defaultValue={meal.quantity} onBlur={async (e) => {
                  try {
                    onMealsLoadingChange(true);
                    await dietService.updateMealInPlan(editingPlan._id, meal.mealId, { mealName: meal.mealName, calories: meal.calories, quantity: e.target.value, notes: meal.notes || '' });
                    await refresh();
                  } catch (err: any) { onMealsErrorChange(err.message || 'تعذر تحديث الوجبة'); }
                  finally { onMealsLoadingChange(false); }
                }} />
                <input className="col-span-3 border rounded px-2 py-1 bg-white dark:bg-gray-900" defaultValue={meal.notes || ''} onBlur={async (e) => {
                  try {
                    onMealsLoadingChange(true);
                    await dietService.updateMealInPlan(editingPlan._id, meal.mealId, { mealName: meal.mealName, calories: meal.calories, quantity: meal.quantity, notes: e.target.value });
                    await refresh();
                  } catch (err: any) { onMealsErrorChange(err.message || 'تعذر تحديث الوجبة'); }
                  finally { onMealsLoadingChange(false); }
                }} />
                <button className="col-span-2 text-red-600" onClick={async () => {
                  try {
                    onMealsLoadingChange(true);
                    await dietService.removeMealFromPlan(editingPlan._id, meal.mealId);
                    await refresh();
                  } catch (err: any) { onMealsErrorChange(err.message || 'تعذر حذف الوجبة'); }
                  finally { onMealsLoadingChange(false); }
                }}>حذف</button>
              </div>
            ))}
          </div>
          {dietMealsError && <p className="text-red-600 text-xs mt-2">{dietMealsError}</p>}
        </div>

        <div className="mt-6 flex justify-end space-x-2">
          <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded" onClick={onClose}>إلغاء</button>
          <button className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded" onClick={handleSave}>حفظ</button>
        </div>
      </div>
    </div>
  );
};

export default EditDietModal;