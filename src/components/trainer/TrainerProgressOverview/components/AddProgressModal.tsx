'use client';

import React, { useState } from 'react';
import ProgressFormFields from './ProgressFormFields';
import { useImageUpload } from '../hooks/useImageUpload';
import type { ProgressFormData } from '../types/progress.types';

const DEFAULT_FORM: ProgressFormData = {
  date: '',
  weight: '',
  bodyFatPercentage: '',
  notes: '',
  status: 'جيد',
};

interface AddProgressModalProps {
  loading: boolean;
  onClose: () => void;
  onSave: (data: ProgressFormData, image: File | null) => Promise<void>;
}

const AddProgressModal: React.FC<AddProgressModalProps> = ({ loading, onClose, onSave }) => {
  const [formData, setFormData] = useState<ProgressFormData>(DEFAULT_FORM);
  const { image, preview, handleChange, reset } = useImageUpload();

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSave = async () => {
    if (!formData.date) return;
    await onSave(formData, image);
    reset();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative z-10 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 px-6 py-4 rounded-t-2xl">
          <h3 className="text-base font-semibold text-white">إضافة سجل جديد</h3>
        </div>

        <div className="px-6 py-4">
          <ProgressFormFields
            data={formData}
            onChange={setFormData}
            imagePreview={preview}
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
            disabled={!formData.date || loading}
            className="px-4 py-2 rounded-lg text-sm bg-emerald-600 hover:bg-emerald-500 text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'جاري الحفظ...' : 'حفظ'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProgressModal;