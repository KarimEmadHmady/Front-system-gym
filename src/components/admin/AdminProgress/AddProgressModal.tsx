'use client';

import React from 'react';
import type { User } from '@/types/models';
import type { TrainerRow } from './types';
import ProgressFormFields, { type ProgressFields } from './ProgressFormFields';
import ImageUploadField from './ImageUploadField';

type Props = {
  trainers: TrainerRow[];
  formTrainerId: string;
  setFormTrainerId: (id: string) => void;
  formUserId: string;
  setFormUserId: (id: string) => void;
  formUsersOfTrainer: User[];
  formMembersLoading: boolean;
  onTrainerChange: (id: string) => void;
  formDate: string;
  setFormDate: (d: string) => void;
  formWeight: string;
  setFormWeight: (w: string) => void;
  formBodyFat: string;
  setFormBodyFat: (b: string) => void;
  formNotes: string;
  setFormNotes: (n: string) => void;
  extraFields: ProgressFields;
  onExtraFieldsChange: (f: Partial<ProgressFields>) => void;
  imagePreview: string | null;
  onImageChange: (file: File | null) => void;
  onImageRemove: () => void;
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
};

const AddProgressModal = ({
  trainers,
  formTrainerId,
  formUserId,
  setFormUserId,
  formUsersOfTrainer,
  formMembersLoading,
  onTrainerChange,
  formDate,
  setFormDate,
  formWeight,
  setFormWeight,
  formBodyFat,
  setFormBodyFat,
  formNotes,
  setFormNotes,
  extraFields,
  onExtraFieldsChange,
  imagePreview,
  onImageChange,
  onImageRemove,
  saving,
  onClose,
  onSave,
}: Props) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 overflow-y-auto max-h-[80vh]">
        <div className="flex items-center justify-between mb-3">
          <div className="text-base font-semibold text-gray-900 dark:text-white">إضافة سجل تقدم</div>
          <button onClick={onClose} className="px-3 py-1.5 text-sm rounded-md bg-gray-200 dark:bg-gray-800 dark:text-white">إغلاق</button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">اختر المدرب</label>
            <select
              value={formTrainerId}
              onChange={e => onTrainerChange(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white"
            >
              <option value="">— اختر —</option>
              {trainers.map(r => (
                <option key={r.trainer._id} value={r.trainer._id}>
                  {r.trainer.name} {r.trainer.phone ? `• ${r.trainer.phone}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">اختر العضو</label>
            <select
              value={formUserId}
              onChange={e => setFormUserId(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white"
              disabled={formMembersLoading}
            >
              <option value="">— اختر —</option>
              {formUsersOfTrainer.map(u => (
                <option key={u._id} value={u._id}>
                  {(u.phone || 'بدون هاتف')} - {u.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">التاريخ</label>
              <input type="date" onClick={e => e.currentTarget.showPicker?.()} value={formDate} onChange={e => setFormDate(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">الوزن (كجم)</label>
              <input type="number" value={formWeight} onChange={e => setFormWeight(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">نسبة الدهون %</label>
              <input type="number" value={formBodyFat} onChange={e => setFormBodyFat(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">ملاحظات</label>
              <input type="text" value={formNotes} onChange={e => setFormNotes(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white" />
            </div>
          </div>

          <ProgressFormFields fields={extraFields} onChange={onExtraFieldsChange} />

          <ImageUploadField
            preview={imagePreview}
            onFileChange={onImageChange}
            onRemove={onImageRemove}
          />

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="px-3 py-2 text-sm rounded-md bg-gray-200 dark:bg-gray-800 dark:text-white">إلغاء</button>
            <button
              onClick={onSave}
              className="px-3 py-2 text-sm rounded-md bg-gray-600 hover:bg-gray-700 text-white disabled:opacity-60"
              disabled={!formTrainerId || !formUserId || !formDate || saving}
            >
              حفظ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProgressModal;