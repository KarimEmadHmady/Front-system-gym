'use client';

import React from 'react';

type Props = {
  preview: string | null;
  currentImageUrl?: string;
  onFileChange: (file: File | null) => void;
  onRemove: () => void;
  label?: string;
};

const ImageUploadField = ({
  preview,
  currentImageUrl,
  onFileChange,
  onRemove,
  label = 'صورة التقدم (اختيارية)',
}: Props) => {
  return (
    <div>
      <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">{label}</label>
      <div className="space-y-2">
        {currentImageUrl && !preview && (
          <div className="mb-2">
            <p className="text-xs text-gray-500 mb-1">الصورة الحالية:</p>
            <img src={currentImageUrl} alt="الصورة الحالية" className="w-32 h-32 object-cover rounded-md border" />
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={e => onFileChange(e.target.files?.[0] || null)}
          className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white"
        />
        {preview && (
          <div className="mt-2">
            {currentImageUrl && <p className="text-xs text-gray-500 mb-1">الصورة الجديدة:</p>}
            <img src={preview} alt="معاينة الصورة" className="w-32 h-32 object-cover rounded-md border" />
            <button
              type="button"
              onClick={onRemove}
              className="mt-1 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
            >
              إزالة الصورة
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploadField;