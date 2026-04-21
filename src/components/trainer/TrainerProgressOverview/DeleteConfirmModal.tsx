'use client';

import React from 'react';

interface DeleteConfirmModalProps {
  progressDeleteId: string | null;
  onProgressDeleteIdChange: (id: string | null) => void;
  onDeleteProgress: (id: string) => void;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  progressDeleteId,
  onProgressDeleteIdChange,
  onDeleteProgress
}) => {
  if (!progressDeleteId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={() => onProgressDeleteIdChange(null)} />
      <div className="relative z-10 bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
        <div className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">تأكيد حذف السجل</div>
        <div className="mb-6 text-gray-700 dark:text-gray-300">هل أنت متأكد أنك تريد حذف هذا السجل؟ لا يمكن التراجع.</div>
        <div className="flex justify-center gap-3">
          <button onClick={() => onProgressDeleteIdChange(null)} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-800">إلغاء</button>
          <button onClick={async () => {
            onDeleteProgress(progressDeleteId);
          }} className="px-4 py-2 rounded bg-red-600 text-white">تأكيد الحذف</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
