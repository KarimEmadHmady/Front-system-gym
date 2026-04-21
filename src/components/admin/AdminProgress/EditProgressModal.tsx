'use client';

import React from 'react';
import type { ClientProgress } from '@/types/models';
import ProgressFormFields, { type ProgressFields } from './ProgressFormFields';
import ImageUploadField from './ImageUploadField';

type EditData = {
  date: string;
  weight: string;
  bodyFat: string;
  notes: string;
};

type Props = {
  editData: EditData;
  onEditDataChange: (d: Partial<EditData>) => void;
  extraFields: ProgressFields;
  onExtraFieldsChange: (f: Partial<ProgressFields>) => void;
  currentImageUrl?: string;
  imagePreview: string | null;
  onImageChange: (file: File | null) => void;
  onImageRemove: () => void;
  onClose: () => void;
  onSave: () => void;
};

const EditProgressModal = ({
  editData,
  onEditDataChange,
  extraFields,
  onExtraFieldsChange,
  currentImageUrl,
  imagePreview,
  onImageChange,
  onImageRemove,
  onClose,
  onSave,
}: Props) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md overflow-y-auto max-h-[80vh]">
        <button
          onClick={onClose}
          className="absolute top-3 left-3 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">تعديل سجل التقدم</div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">التاريخ</label>
            <input type="date" value={editData.date} onClick={e => e.currentTarget.showPicker?.()} onChange={e => onEditDataChange({ date: e.target.value })} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">الوزن (كجم)</label>
            <input type="number" value={editData.weight} onChange={e => onEditDataChange({ weight: e.target.value })} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">نسبة الدهون %</label>
            <input type="number" value={editData.bodyFat} onChange={e => onEditDataChange({ bodyFat: e.target.value })} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">ملاحظات</label>
            <input type="text" value={editData.notes} onChange={e => onEditDataChange({ notes: e.target.value })} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white" />
          </div>

          <ProgressFormFields fields={extraFields} onChange={onExtraFieldsChange} />

          <ImageUploadField
            preview={imagePreview}
            currentImageUrl={currentImageUrl}
            onFileChange={onImageChange}
            onRemove={onImageRemove}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-800">إلغاء</button>
          <button
            onClick={onSave}
            className="px-4 py-2 rounded bg-gray-600 text-white disabled:opacity-60"
            disabled={!editData.date}
          >
            تأكيد
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProgressModal;