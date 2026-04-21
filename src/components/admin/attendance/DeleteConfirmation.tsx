import React from 'react';
import type { DeleteConfirmationProps } from './types';

export const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/40" 
        onClick={() => !loading && onClose()} 
      />
      <div className="relative z-10 bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-200 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 9v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M10.29 3.86l-8.48 14.7A2 2 0 0 0 3.48 21h17.04a2 2 0 0 0 1.72-3.44l-8.48-14.7a2 2 0 0 0-3.47 0Z" 
                    stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-base font-semibold text-gray-900 dark:text-white">
              تأكيد الحذف
            </div>
            <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              هل أنت متأكد من حذف هذا السجل؟ لا يمكن التراجع عن هذا الإجراء.
            </div>
          </div>
          <button 
            onClick={() => !loading && onClose()} 
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button 
            onClick={() => !loading && onClose()} 
            className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-700"
            disabled={loading}
          >
            إلغاء
          </button>
          <button 
            onClick={onConfirm} 
            disabled={loading}
            className="px-4 py-2 rounded text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400"
          >
            {loading ? 'جاري الحذف...' : 'تأكيد الحذف'}
          </button>
        </div>
      </div>
    </div>
  );
};
