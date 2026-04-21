'use client';

import React from 'react';
import type { SessionFormData } from './types';
import SessionFormFields from './SessionFormFields';

type Props = {
  formData: SessionFormData;
  setFormData: React.Dispatch<React.SetStateAction<SessionFormData>>;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
};

const EditSessionModal = ({ formData, setFormData, onSubmit, onClose }: Props) => {
  return (
    <div className="fixed inset-0 bg-black/70 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div className="mt-3">
          <button
            onClick={onClose}
            className="absolute top-3 left-3 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">تعديل الحصة</h3>
          <form onSubmit={onSubmit}>
            <SessionFormFields formData={formData} setFormData={setFormData} />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700"
              >
                حفظ
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditSessionModal;