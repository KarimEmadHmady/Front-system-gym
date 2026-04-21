'use client';

import React from 'react';

interface DeleteConfirmModalProps {
  showDeleteModal: string | null;
  onShowDeleteModal: (messageId: string | null) => void;
  onDeleteMessage: (messageId: string) => void;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  showDeleteModal,
  onShowDeleteModal,
  onDeleteMessage
}) => {
  if (!showDeleteModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={() => onShowDeleteModal(null)} />
      <div className="relative bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">تأكيد الحذف</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">هل أنت متأكد من حذف هذه الرسالة؟</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => onShowDeleteModal(null)}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            إلغاء
          </button>
          <button
            onClick={() => onDeleteMessage(showDeleteModal)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
          >
            حذف
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
