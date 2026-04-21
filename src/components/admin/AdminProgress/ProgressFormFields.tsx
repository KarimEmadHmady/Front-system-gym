'use client';

import React from 'react';

type ProgressFields = {
  muscleMass: string;
  waist: string;
  chest: string;
  arms: string;
  legs: string;
  weightChange: string;
  fatChange: string;
  muscleChange: string;
  status: 'ممتاز' | 'جيد' | 'يحتاج لتحسين';
  advice: string;
};

type Props = {
  fields: ProgressFields;
  onChange: (fields: Partial<ProgressFields>) => void;
};

const ProgressFormFields = ({ fields, onChange }: Props) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">الكتلة العضلية (كجم)</label>
          <input type="number" value={fields.muscleMass} onChange={e => onChange({ muscleMass: e.target.value })} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">مقاس الوسط (سم)</label>
          <input type="number" value={fields.waist} onChange={e => onChange({ waist: e.target.value })} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">مقاس الصدر (سم)</label>
          <input type="number" value={fields.chest} onChange={e => onChange({ chest: e.target.value })} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">مقاس الذراع (سم)</label>
          <input type="number" value={fields.arms} onChange={e => onChange({ arms: e.target.value })} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">مقاس الرجل (سم)</label>
          <input type="number" value={fields.legs} onChange={e => onChange({ legs: e.target.value })} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">تغير الوزن عن السابق (كجم)</label>
          <input type="number" value={fields.weightChange} onChange={e => onChange({ weightChange: e.target.value })} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">تغير الدهون عن السابق (%)</label>
          <input type="number" value={fields.fatChange} onChange={e => onChange({ fatChange: e.target.value })} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">تغير الكتلة العضلية عن السابق (كجم)</label>
          <input type="number" value={fields.muscleChange} onChange={e => onChange({ muscleChange: e.target.value })} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">الحالة العامة</label>
          <select value={fields.status} onChange={e => onChange({ status: e.target.value as any })} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white">
            <option value="ممتاز">ممتاز</option>
            <option value="جيد">جيد</option>
            <option value="يحتاج لتحسين">يحتاج لتحسين</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">نصيحة المدرب</label>
        <input type="text" value={fields.advice} onChange={e => onChange({ advice: e.target.value })} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white" />
      </div>
    </>
  );
};

export default ProgressFormFields;
export type { ProgressFields };