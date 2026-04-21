'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  showDeleteConfirm: boolean;
  messageToDelete: any;
  onClose: () => void;
  onDeleteMessage: () => void;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  showDeleteConfirm,
  messageToDelete,
  onClose,
  onDeleteMessage
}) => {
  if (!showDeleteConfirm || !messageToDelete) return null;

  return (
    <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                تأكيد الحذف
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                هل أنت متأكد من حذف هذه الرسالة؟
              </p>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
              {messageToDelete.content || messageToDelete.message}
            </p>
          </div>
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              إلغاء
            </button>
            <button
              onClick={onDeleteMessage}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center space-x-2"
            >
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>حذف</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
