'use client';

import React from 'react';
import { X } from 'lucide-react';
import type { CardGenerationResult } from './types';

interface Props {
  open: boolean;
  result: CardGenerationResult | null;
  onClose: () => void;
}

export const GenerationResultDialog: React.FC<Props> = ({ open, result, onClose }) => {
  if (!open || !result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 relative">
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mb-4 text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">نتائج توليد البطاقات</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">تفاصيل عملية توليد البطاقات</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-green-50 rounded-lg dark:bg-green-900/20">
                <div className="text-2xl font-bold text-green-600 dark:text-green-300">
                  {result.data?.totalGenerated}
                </div>
                <div className="text-sm text-green-600 dark:text-green-300">تم التوليد</div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg dark:bg-red-900/20">
                <div className="text-2xl font-bold text-red-600 dark:text-red-300">
                  {result.data?.totalErrors}
                </div>
                <div className="text-sm text-red-600 dark:text-red-300">أخطاء</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-900/20">
                <div className="text-2xl font-bold text-gray-600 dark:text-gray-300">
                  {result.data?.totalRequested}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">المطلوب</div>
              </div>
            </div>

            {result.data?.errors?.length > 0 && (
              <div>
                <h4 className="font-semibold text-red-600 dark:text-red-300 mb-2">الأخطاء:</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {result.data.errors.map((error, index) => (
                    <div key={index} className="p-2 bg-red-50 rounded text-sm dark:bg-red-900/20 dark:text-red-200">
                      <strong>معرّف المستخدم:</strong> {error.userId} - {error.error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};