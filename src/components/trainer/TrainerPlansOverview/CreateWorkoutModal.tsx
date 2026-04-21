'use client';

import React, { useState } from 'react';

interface CreateWorkoutModalProps {
  showCreateModal: boolean;
  creatingUserId: string;
  formPlanName: string;
  formDescription: string;
  formStartDate: string;
  formEndDate: string;
  formExercises: Array<{ name: string; reps: number; sets: number; notes?: string; image?: string; imageFile?: File }>;
  myClients: Array<{ _id: string; name: string; email?: string; phone?: string }>;
  memberSearch: string;
  onShowCreateModal: (show: boolean) => void;
  onCreatingUserIdChange: (userId: string) => void;
  onFormPlanNameChange: (name: string) => void;
  onFormDescriptionChange: (description: string) => void;
  onFormStartDateChange: (date: string) => void;
  onFormEndDateChange: (date: string) => void;
  onFormExercisesChange: (exercises: any) => void;
  onCreatePlan: () => void;
}

const CreateWorkoutModal: React.FC<CreateWorkoutModalProps> = ({
  showCreateModal,
  creatingUserId,
  formPlanName,
  formDescription,
  formStartDate,
  formEndDate,
  formExercises,
  myClients,
  memberSearch,
  onShowCreateModal,
  onCreatingUserIdChange,
  onFormPlanNameChange,
  onFormDescriptionChange,
  onFormStartDateChange,
  onFormEndDateChange,
  onFormExercisesChange,
  onCreatePlan
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">إنشاء خطة</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">اختر عميل (من عملائك فقط)</label>
            <select className="mb-2 w-full border rounded px-3 py-2 bg-white dark:bg-gray-900" value={creatingUserId} onChange={(e)=>onCreatingUserIdChange(e.target.value)}>
              <option value="">اختر عميل...</option>
              {myClients.filter(m=>{
                    const q = memberSearch.trim().toLowerCase();
                    if(!q) return true;
                    const phone=(m.phone||'').toLowerCase();
                    const name=(m.name||'').toLowerCase();
                    const email=(m.email||'').toLowerCase();
                    return phone.includes(q)||name.includes(q)||email.includes(q);
                  }).map(m=> <option key={m._id} value={m._id}>{(m.phone||'بدون هاتف')} - {m.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">اسم الخطة</label>
            <input className="mb-2 w-full border rounded px-3 py-2 bg-white dark:bg-gray-900" placeholder="اكتب اسم الخطة (مثال: خطة تخسيس)" value={formPlanName} onChange={(e)=>onFormPlanNameChange(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">الوصف</label>
            <textarea className="mb-2 w-full border rounded px-3 py-2 bg-white dark:bg-gray-900" placeholder="اكتب وصفًا مختصرًا للخطة" value={formDescription} onChange={(e)=>onFormDescriptionChange(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">تاريخ البداية</label>
            <input type="date" className="mb-2 w-full border rounded px-3 py-2 bg-white dark:bg-gray-900" value={formStartDate} onChange={(e)=>onFormStartDateChange(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">تاريخ النهاية</label>
            <input type="date" className="mb-2 w-full border rounded px-3 py-2 bg-white dark:bg-gray-900" value={formEndDate} onChange={(e)=>onFormEndDateChange(e.target.value)} />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">التمارين</span>
            <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={()=>onFormExercisesChange([...formExercises,{name:'',reps:0,sets:0,notes:'',image:'',imageFile:''}])}>إضافة تمرين</button>
          </div>
          <div className="grid grid-cols-12 gap-2 text-xs text-gray-600 mb-1">
            <span className="col-span-2">اسم التمرين</span>
            <span className="col-span-2">التكرارات </span>
            <span className="col-span-2">المجموعات </span>
            <span className="col-span-2">ملاحظات</span>
            <span className="col-span-3">الصورة</span>
            <span className="col-span-1">إجراء</span>
          </div>
          <div className="space-y-3 max-h-60 overflow-auto pr-1">
            {formExercises.map((ex,idx)=> (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center mb-2">
                <input className="col-span-2 border rounded px-2 py-1 bg-white dark:bg-gray-900" placeholder="مثال: سكوات" value={ex.name} onChange={(e)=>onFormExercisesChange(formExercises.map((p,i)=>i===idx?{...p,name:e.target.value}:p))} />
                <input type="number" className="col-span-2 border rounded px-2 py-1 bg-white dark:bg-gray-900" placeholder="مثال: 12" value={ex.reps} onChange={(e)=>onFormExercisesChange(formExercises.map((p,i)=>i===idx?{...p,reps:Number(e.target.value)}:p))} />
                <input type="number" className="col-span-2 border rounded px-2 py-1 bg-white dark:bg-gray-900" placeholder="مثال: 3" value={ex.sets} onChange={(e)=>onFormExercisesChange(formExercises.map((p,i)=>i===idx?{...p,sets:Number(e.target.value)}:p))} />
                <input className="col-span-3 border rounded px-2 py-1 bg-white dark:bg-gray-900" placeholder="مثال: راحة 60 ثانية" value={ex.notes || ''} onChange={(e)=>onFormExercisesChange(formExercises.map((p,i)=>i===idx?{...p,notes:e.target.value}:p))} />
                <div className="col-span-2 flex flex-col gap-1">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="text-xs border rounded px-1 py-1 bg-white dark:bg-gray-900" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        onFormExercisesChange(formExercises.map((p, i) => i === idx ? { ...p, imageFile: file } : p));
                      }
                    }}
                  />
                  {ex.image && !ex.imageFile && (
                    <img src={ex.image} alt={ex.name} className="w-8 h-8 object-cover rounded" />
                  )}
                  {ex.imageFile && (
                    <img src={URL.createObjectURL(ex.imageFile)} alt={ex.name} className="w-8 h-8 object-cover rounded" />
                  )}
                </div>
                <button className="col-span-1 text-red-600" onClick={()=>onFormExercisesChange(formExercises.filter((_,i)=>i!==idx))}>حذف</button>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-2">
          <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded" onClick={()=>onShowCreateModal(false)}>إلغاء</button>
          <button className="px-4 py-2 bg-gray-600 text-white rounded" onClick={onCreatePlan}>حفظ</button>
        </div>
      </div>
    </div>
  );
};

export default CreateWorkoutModal;
