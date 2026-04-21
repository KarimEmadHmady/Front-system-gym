'use client';

import React from 'react';
import type { User } from '@/types/models';
import ProgressFormFields, { type ProgressFields } from './ProgressFormFields';
import ImageUploadField from './ImageUploadField';

type BaseData = {
  date: string;
  weight: string;
  bodyFat: string;
  notes: string;
};

type Props = {
  userId: string;
  trainerClients: User[];
  baseData: BaseData;
  onBaseDataChange: (d: Partial<BaseData>) => void;
  extraFields: ProgressFields;
  onExtraFieldsChange: (f: Partial<ProgressFields>) => void;
  imagePreview: string | null;
  onImageChange: (file: File | null) => void;
  onImageRemove: () => void;
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
};

const AddMemberProgressModal = ({
  userId,
  trainerClients,
  baseData,
  onBaseDataChange,
  extraFields,
  onExtraFieldsChange,
  imagePreview,
  onImageChange,
  onImageRemove,
  saving,
  onClose,
  onSave,
}: Props) => {
  const member = trainerClients.find(u => u._id === userId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md overflow-y-auto max-h-[80vh]">
        <div className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">إضافة سجل جديد للعضو</div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">العضو</label>
            <input
              type="text"
              value={member?.name || ''}
              disabled
              className="w-full px-3 py-2 border rounded-md bg-gray-100 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">التاريخ</label>
            <input type="date" value={baseData.date} onClick={e => e.currentTarget.showPicker?.()} onChange={e => onBaseDataChange({ date: e.target.value })} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">الوزن (كجم)</label>
            <input type="number" value={baseData.weight} onChange={e => onBaseDataChange({ weight: e.target.value })} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">نسبة الدهون %</label>
            <input type="number" value={baseData.bodyFat} onChange={e => onBaseDataChange({ bodyFat: e.target.value })} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">ملاحظات</label>
            <input type="text" value={baseData.notes} onChange={e => onBaseDataChange({ notes: e.target.value })} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white" />
          </div>

          <ProgressFormFields fields={extraFields} onChange={onExtraFieldsChange} />

          <ImageUploadField
            preview={imagePreview}
            onFileChange={onImageChange}
            onRemove={onImageRemove}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-800">إلغاء</button>
          <button
            onClick={onSave}
            className="px-4 py-2 rounded bg-gray-600 text-white disabled:opacity-60"
            disabled={!userId || !baseData.date || saving}
          >
            حفظ
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMemberProgressModal;