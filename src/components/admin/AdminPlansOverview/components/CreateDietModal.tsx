import React, { useState } from 'react';
import { dietService } from '@/services';
import type { DietPlan } from '@/types';
import type { MealFormItem, UserBasic } from '../types';

interface Props {
  open: boolean;
  members: UserBasic[];
  trainers: UserBasic[];
  currentRole?: string;
  onClose: () => void;
  onCreated: (plan: DietPlan) => void;
}

const CreateDietModal: React.FC<Props> = ({ open, members, trainers, currentRole, onClose, onCreated }) => {
  const [memberSearch, setMemberSearch] = useState('');
  const [userId, setUserId] = useState('');
  const [trainerId, setTrainerId] = useState('');
  const [planName, setPlanName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [meals, setMeals] = useState<MealFormItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const reset = () => {
    setUserId(''); setTrainerId(''); setPlanName(''); setDescription('');
    setStartDate(''); setEndDate(''); setMeals([]); setFormError(null);
    setMemberSearch('');
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSave = async () => {
    if (!userId) { setFormError('يجب اختيار عضو'); return; }
    if (!planName.trim()) { setFormError('اسم الخطة مطلوب'); return; }
    if (!startDate) { setFormError('تاريخ البداية مطلوب'); return; }
    try {
      setLoading(true);
      const created = await dietService.createDietPlan({
        userId,
        planName: planName.trim(),
        description,
        startDate: new Date(startDate) as any,
        endDate: endDate ? new Date(endDate) as any : undefined,
        meals: meals as any,
        trainerId: currentRole === 'trainer' ? undefined : (trainerId || undefined),
      });
      onCreated(created as any);
      handleClose();
    } catch (e: any) {
      setFormError(e.message || 'فشل إنشاء الخطة الغذائية');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const filteredMembers = members.filter((m) => {
    const q = memberSearch.trim().toLowerCase();
    if (!q) return true;
    return (m.name || '').toLowerCase().includes(q) ||
      (m.phone || '').toLowerCase().includes(q) ||
      (m.email || '').toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl p-6">
        <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-600" onClick={handleClose}>✕</button>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">إنشاء خطة غذائية</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">المستخدم (الأعضاء فقط)</label>
            <input className="mb-2 w-full border rounded px-3 py-2 bg-white dark:bg-gray-900" placeholder="ابحث بالاسم أو الهاتف أو الإيميل" value={memberSearch} onChange={(e) => setMemberSearch(e.target.value)} />
            <select value={userId} onChange={(e) => setUserId(e.target.value)} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900">
              <option value="">اختر عضو...</option>
              {filteredMembers.map((m) => <option key={m._id} value={m._id}>{(m.phone || 'بدون هاتف')} - {m.name}</option>)}
            </select>
          </div>

          {currentRole !== 'trainer' && (
            <div>
              <label className="block text-sm mb-1">المدرب</label>
              <select value={trainerId} onChange={(e) => setTrainerId(e.target.value)} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900">
                <option value="">اختر مدرب...</option>
                {trainers.map((m) => <option key={m._id} value={m._id}>{(m.phone || 'بدون هاتف')} - {m.name}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm mb-1">اسم الخطة</label>
            <input value={planName} onChange={(e) => setPlanName(e.target.value)} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900" placeholder="مثال: خطة غذائية" />
          </div>
          <div>
            <label className="block text-sm mb-1">الوصف</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900" placeholder="وصف مختصر" />
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

        {/* الوجبات */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">الوجبات</h4>
            <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={() => setMeals((p) => [...p, { mealName: '', calories: 1, quantity: '1', notes: '' }])}>إضافة وجبة</button>
          </div>
          <div className="grid grid-cols-12 gap-2 text-xs text-gray-600 mb-1">
            <span className="col-span-3">اسم الوجبة</span>
            <span className="col-span-2">السعرات</span>
            <span className="col-span-2">الكمية</span>
            <span className="col-span-4">ملاحظات</span>
            <span className="col-span-1">إجراء</span>
          </div>
          {meals.length === 0 && <p className="text-sm text-gray-500">لا يوجد وجبات</p>}
          <div className="space-y-3 max-h-60 overflow-auto pr-1">
            {meals.map((meal, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                <input className="col-span-3 border rounded px-2 py-1 bg-white dark:bg-gray-900" placeholder="مثال: فطور" value={meal.mealName} onChange={(e) => setMeals((p) => p.map((m, i) => i === idx ? { ...m, mealName: e.target.value } : m))} />
                <input type="number" className="col-span-2 border rounded px-2 py-1 bg-white dark:bg-gray-900" placeholder="300" value={meal.calories} onChange={(e) => setMeals((p) => p.map((m, i) => i === idx ? { ...m, calories: Number(e.target.value) } : m))} />
                <input className="col-span-2 border rounded px-2 py-1 bg-white dark:bg-gray-900" placeholder="1 طبق" value={meal.quantity} onChange={(e) => setMeals((p) => p.map((m, i) => i === idx ? { ...m, quantity: e.target.value } : m))} />
                <input className="col-span-4 border rounded px-2 py-1 bg-white dark:bg-gray-900" placeholder="اختياري" value={meal.notes || ''} onChange={(e) => setMeals((p) => p.map((m, i) => i === idx ? { ...m, notes: e.target.value } : m))} />
                <button className="col-span-1 text-red-600" onClick={() => setMeals((p) => p.filter((_, i) => i !== idx))}>حذف</button>
              </div>
            ))}
          </div>
        </div>

        {formError && <p className="text-xs text-red-600 mt-2">{formError}</p>}

        <div className="mt-6 flex justify-end space-x-2">
          <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded" onClick={handleClose}>إلغاء</button>
          <button
            className={`px-4 py-2 rounded text-white ${loading ? 'bg-gray-300 cursor-wait' : 'bg-gray-600 hover:bg-gray-700'}`}
            disabled={loading}
            onClick={handleSave}
          >
            {loading ? 'جارِ الحفظ...' : 'حفظ'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateDietModal;