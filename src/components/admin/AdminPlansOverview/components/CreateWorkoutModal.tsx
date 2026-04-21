import React, { useState } from 'react';
import { workoutService } from '@/services';
import type { WorkoutPlan } from '@/types';
import type { ExerciseFormItem, UserBasic } from '../types';

interface Props {
  open: boolean;
  members: UserBasic[];
  trainers: UserBasic[];
  currentRole?: string;
  currentTrainerId: string;
  onClose: () => void;
  onCreated: (plan: WorkoutPlan) => void;
}

const CreateWorkoutModal: React.FC<Props> = ({
  open, members, trainers, currentRole, currentTrainerId, onClose, onCreated,
}) => {
  const [memberSearch, setMemberSearch] = useState('');
  const [trainerSearch, setTrainerSearch] = useState('');
  const [userId, setUserId] = useState('');
  const [trainerId, setTrainerId] = useState('');
  const [planName, setPlanName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exercises, setExercises] = useState<ExerciseFormItem[]>([]);
  const [loading, setLoading] = useState(false);

  const canSubmit = userId && planName && startDate && endDate;

  const reset = () => {
    setUserId(''); setTrainerId(''); setPlanName(''); setDescription('');
    setStartDate(''); setEndDate(''); setExercises([]); setMemberSearch('');
    setTrainerSearch('');
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSave = async () => {
    try {
      setLoading(true);
      const withoutImages: any[] = [];
      const withImages: any[] = [];

      exercises.forEach((ex) => {
        const base = { name: ex.name, reps: ex.reps, sets: ex.sets, notes: ex.notes };
        if (ex.imageFile) withImages.push({ ...base, image: ex.imageFile });
        else if (ex.image?.trim()) withoutImages.push({ ...base, image: ex.image });
        else withoutImages.push(base);
      });

      const data: any = {
        planName, description,
        startDate: new Date(startDate) as any,
        endDate: new Date(endDate) as any,
        exercises: withoutImages,
      };

      if (currentRole === 'trainer') data.trainerId = currentTrainerId;
      else if (trainerId) data.trainerId = trainerId;

      const created = await workoutService.createWorkoutPlan(userId, data);
      if (withImages.length > 0) await workoutService.addExercisesWithImagesToPlan(created._id, withImages);
      const updated = await workoutService.getWorkoutPlan(created._id);
      onCreated(updated);
      handleClose();
    } catch (e: any) {
      alert(e.message || 'فشل إنشاء الخطة');
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

  const filteredTrainers = trainers.filter((m) => {
    const q = trainerSearch.trim().toLowerCase();
    if (!q) return true;
    return (m.name || '').toLowerCase().includes(q) ||
      (m.phone || '').toLowerCase().includes(q) ||
      (m.email || '').toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl p-6">
        <button className="absolute top-3 left-3 text-gray-400 hover:text-gray-600" onClick={handleClose}>✕</button>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">إنشاء خطة تمرين</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
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
              <input className="mb-2 w-full border rounded px-3 py-2 bg-white dark:bg-gray-900" placeholder="ابحث بالاسم أو الهاتف أو الإيميل" value={trainerSearch} onChange={(e) => setTrainerSearch(e.target.value)} />
              <select value={trainerId} onChange={(e) => setTrainerId(e.target.value)} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900">
                <option value="">اختر مدرب...</option>
                {filteredTrainers.map((m) => <option key={m._id} value={m._id}>{(m.phone || 'بدون هاتف')} - {m.name}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm mb-1">اسم الخطة</label>
            <input value={planName} onChange={(e) => setPlanName(e.target.value)} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900" placeholder="اكتب اسم الخطة (مثال: خطة تخسيس)" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">الوصف</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900" placeholder="اكتب وصفًا مختصرًا للخطة" />
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
            <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={() => setExercises((p) => [...p, { name: '', reps: 0, sets: 0, notes: '', image: '' }])}>إضافة تمرين</button>
          </div>
          <div className="grid grid-cols-12 gap-2 text-xs text-gray-600 mb-1">
            <span className="col-span-2">اسم التمرين</span>
            <span className="col-span-2">التكرارات</span>
            <span className="col-span-2">المجموعات</span>
            <span className="col-span-3">ملاحظات</span>
            <span className="col-span-2">الصورة</span>
            <span className="col-span-1">إجراء</span>
          </div>
          {exercises.length === 0 && <p className="text-sm text-gray-500">لا يوجد تمارين</p>}
          <div className="space-y-3 max-h-60 overflow-auto pr-1">
            {exercises.map((ex, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                <input className="col-span-2 border rounded px-2 py-1 bg-white dark:bg-gray-900" placeholder="مثال: سكوات" value={ex.name} onChange={(e) => setExercises((p) => p.map((x, i) => i === idx ? { ...x, name: e.target.value } : x))} />
                <input type="number" className="col-span-2 border rounded px-2 py-1 bg-white dark:bg-gray-900" placeholder="12" value={ex.reps} onChange={(e) => setExercises((p) => p.map((x, i) => i === idx ? { ...x, reps: Number(e.target.value) } : x))} />
                <input type="number" className="col-span-2 border rounded px-2 py-1 bg-white dark:bg-gray-900" placeholder="3" value={ex.sets} onChange={(e) => setExercises((p) => p.map((x, i) => i === idx ? { ...x, sets: Number(e.target.value) } : x))} />
                <input className="col-span-3 border rounded px-2 py-1 bg-white dark:bg-gray-900" placeholder="راحة 60 ثانية" value={ex.notes || ''} onChange={(e) => setExercises((p) => p.map((x, i) => i === idx ? { ...x, notes: e.target.value } : x))} />
                <div className="col-span-2 flex flex-col gap-1">
                  <input type="file" accept="image/*" className="text-xs border rounded px-1 py-1 bg-white dark:bg-gray-900"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setExercises((p) => p.map((x, i) => i === idx ? { ...x, imageFile: file } : x));
                    }}
                  />
                  {ex.imageFile && <img src={URL.createObjectURL(ex.imageFile)} alt={ex.name} className="w-8 h-8 object-cover rounded" />}
                  {ex.image && !ex.imageFile && <img src={ex.image} alt={ex.name} className="w-8 h-8 object-cover rounded" />}
                </div>
                <button className="col-span-1 text-red-600" onClick={() => setExercises((p) => p.filter((_, i) => i !== idx))}>حذف</button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-2">
          <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded" onClick={handleClose}>إلغاء</button>
          <button
            className={`px-4 py-2 rounded text-white ${canSubmit && !loading ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-300 cursor-not-allowed'}`}
            disabled={!canSubmit || loading}
            onClick={handleSave}
          >
            {loading ? 'جارِ الحفظ...' : 'حفظ'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateWorkoutModal;