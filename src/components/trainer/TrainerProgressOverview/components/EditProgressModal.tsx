'use client';

import React, { useState } from 'react';
import ProgressFormFields from './ProgressFormFields';
import { useImageUpload } from '../hooks/useImageUpload';
import type { ProgressFormData, ProgressRecord } from '../types/progress.types';

interface EditProgressModalProps {
  record: ProgressRecord;
  loading: boolean;
  onClose: () => void;
  onSave: (id: string, data: ProgressFormData, image: File | null | undefined, oldImagePublicId?: string) => Promise<void>;
}

const EditProgressModal: React.FC<EditProgressModalProps> = ({ record, loading, onClose, onSave }) => {
  const [formData, setFormData] = useState<ProgressFormData>({
    date: record.date ? new Date(record.date).toISOString().slice(0, 10) : '',
    weight: record.weight?.toString() || '',
    bodyFatPercentage: record.bodyFatPercentage?.toString() || '',
    notes: record.notes || '',
    muscleMass: record.muscleMass?.toString() || '',
    waist: record.waist?.toString() || '',
    chest: record.chest?.toString() || '',
    arms: record.arms?.toString() || '',
    legs: record.legs?.toString() || '',
    weightChange: record.weightChange?.toString() || '',
    fatChange: record.fatChange?.toString() || '',
    muscleChange: record.muscleChange?.toString() || '',
    status: record.status || 'جيد',
    advice: record.advice || '',
  });

  const { image, preview, handleChange, reset } = useImageUpload();

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSave = async () => {
    await onSave(record._id, formData, image || undefined, record.image?.publicId);
    reset();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative z-10 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 px-6 py-4 rounded-t-2xl">
          <h3 className="text-base font-semibold text-white">تعديل سجل التقدم</h3>
        </div>

        <div className="px-6 py-4">
          <ProgressFormFields
            data={formData}
            onChange={setFormData}
            imagePreview={preview}
            currentImageUrl={record.image?.url}
            onImageChange={handleChange}
            onRemoveImage={reset}
          />
        </div>

        <div className="sticky bottom-0 bg-slate-900 border-t border-slate-700 px-6 py-4 rounded-b-2xl flex justify-end gap-2">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-lg text-sm bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm bg-emerald-600 hover:bg-emerald-500 text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'جاري الحفظ...' : 'تأكيد'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProgressModal;