import React from 'react';
import { Dialog } from '@headlessui/react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

const DeleteRewardDialog: React.FC<Props> = ({ isOpen, onClose, onConfirm, loading }) => {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black/50 z-40" />
        <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md mx-auto p-6 z-50">
          <button
            onClick={onClose}
            className="absolute top-3 left-3 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">حذف المكافأة</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">هل أنت متأكد من حذف هذه المكافأة؟ هذا الإجراء لا يمكن التراجع عنه.</p>
          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">إلغاء</button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
            >
              حذف
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default DeleteRewardDialog;
