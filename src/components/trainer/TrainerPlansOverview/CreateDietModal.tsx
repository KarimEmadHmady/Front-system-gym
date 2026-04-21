'use client';

import React, { useState } from 'react';

interface CreateDietModalProps {
  showCreateDietModal: boolean;
  createDietUserId: string;
  createDietName: string;
  createDietDesc: string;
  createDietStart: string;
  createDietEnd: string;
  createDietMeals: Array<{ mealName: string; calories: number; quantity: string; notes?: string }>;
  createDietLoading: boolean;
  createDietError: string | null;
  onShowCreateDietModal: (show: boolean) => void;
  onCreateDietUserIdChange: (userId: string) => void;
  onCreateDietNameChange: (name: string) => void;
  onCreateDietDescChange: (desc: string) => void;
  onCreateDietStartChange: (date: string) => void;
  onCreateDietEndChange: (date: string) => void;
  onCreateDietMealsChange: (meals: any) => void;
  onCreateDietPlan: () => void;
}

const CreateDietModal: React.FC<CreateDietModalProps> = ({
  showCreateDietModal,
  createDietUserId,
  createDietName,
  createDietDesc,
  createDietStart,
  createDietEnd,
  createDietMeals,
  createDietLoading,
  createDietError,
  onShowCreateDietModal,
  onCreateDietUserIdChange,
  onCreateDietNameChange,
  onCreateDietDescChange,
  onCreateDietStartChange,
  onCreateDietEndChange,
  onCreateDietMealsChange,
  onCreateDietPlan
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">إنشاء خطة غذائية</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">اختر عميل (من عملائك فقط)</label>
            <select className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900" value={createDietUserId} onChange={(e) => onCreateDietUserIdChange(e.target.value)}>
              <option value="">اختر عميل...</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">اسم الخطة</label>
            <input className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900" placeholder="مثال: خطة غذائية" value={createDietName} onChange={(e) => onCreateDietNameChange(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">الوصف</label>
            <input className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900" placeholder="وصف مختصر" value={createDietDesc} onChange={(e) => onCreateDietDescChange(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">تاريخ البداية</label>
            <input type="date" className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900" value={createDietStart} onChange={(e) => onCreateDietStartChange(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">تاريخ النهاية</label>
            <input type="date" className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900" value={createDietEnd} onChange={(e) => onCreateDietEndChange(e.target.value)} />
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">الوجبات</h4>
            <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={() => onCreateDietMealsChange([...createDietMeals, { mealName: '', calories: 1, quantity: '1', notes: '' }])}>إضافة وجبة</button>
          </div>
          <div className="grid grid-cols-12 gap-2 text-xs text-gray-600 mb-1">
            <span className="col-span-3">اسم الوجبة</span>
            <span className="col-span-2">السعرات</span>
            <span className="col-span-2">الكمية</span>
            <span className="col-span-4">ملاحظات</span>
            <span className="col-span-1">إجراء</span>
          </div>
          <div className="space-y-3 max-h-60 overflow-auto pr-1">
            {createDietMeals.length === 0 && (
              <p className="text-sm text-gray-500">لا يوجد وجبات</p>
            )}
            {createDietMeals.map((meal, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                <input className="col-span-3 border rounded px-2 py-1 bg-white dark:bg-gray-900" placeholder="مثال: فطور" value={meal.mealName} onChange={(e) => onCreateDietMealsChange(createDietMeals.map((m, i) => i === idx ? { ...m, mealName: e.target.value } : m))} />
                <input type="number" className="col-span-2 border rounded px-2 py-1 bg-white dark:bg-gray-900" placeholder="مثال: 300" value={meal.calories} onChange={(e) => onCreateDietMealsChange(createDietMeals.map((m, i) => i === idx ? { ...m, calories: Number(e.target.value) } : m))} />
                <input className="col-span-2 border rounded px-2 py-1 bg-white dark:bg-gray-900" placeholder="مثال: 1 طبق" value={meal.quantity} onChange={(e) => onCreateDietMealsChange(createDietMeals.map((m, i) => i === idx ? { ...m, quantity: e.target.value } : m))} />
                <input className="col-span-4 border rounded px-2 py-1 bg-white dark:bg-gray-900" placeholder="اختياري" value={meal.notes || ''} onChange={(e) => onCreateDietMealsChange(createDietMeals.map((m, i) => i === idx ? { ...m, notes: e.target.value } : m))} />
                <button className="col-span-1 text-red-600" onClick={() => onCreateDietMealsChange(createDietMeals.filter((_, i) => i !== idx))}>حذف</button>
              </div>
            ))}
          </div>
        </div>

        {createDietError && <p className="text-xs text-red-600 mt-2">{createDietError}</p>}

        <div className="mt-6 flex justify-end space-x-2">
          <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded" onClick={() => onShowCreateDietModal(false)}>إلغاء</button>
          <button className={`px-4 py-2 rounded text-white ${createDietLoading ? 'bg-green-300 cursor-wait' : 'bg-green-600 hover:bg-green-700'}`} disabled={createDietLoading} onClick={onCreateDietPlan}>حفظ</button>
        </div>
      </div>
    </div>
  );
};

export default CreateDietModal;
