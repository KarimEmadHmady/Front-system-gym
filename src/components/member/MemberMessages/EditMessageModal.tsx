'use client';

import React from 'react';
import { X } from 'lucide-react';

interface EditMessageModalProps {
  showEditModal: boolean;
  selectedMessage: any;
  editMessage: {
    content: string;
    subject: string;
  };
  sending: boolean;
  onClose: () => void;
  onMessageChange: (message: any) => void;
  onUpdateMessage: () => void;
}

const EditMessageModal: React.FC<EditMessageModalProps> = ({
  showEditModal,
  selectedMessage,
  editMessage,
  sending,
  onClose,
  onMessageChange,
  onUpdateMessage
}) => {
  if (!showEditModal || !selectedMessage) return null;

  return (
    <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            تعديل الرسالة
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          <div className="mb-4">
            <input
              type="text"
              placeholder="موضوع الرسالة"
              value={editMessage.subject}
              onChange={(e) => onMessageChange({ ...editMessage, subject: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent dark:bg-gray-700 dark:text-white mb-4"
            />
            <textarea
              placeholder="اكتب رسالتك هنا..."
              value={editMessage.content}
              onChange={(e) => onMessageChange({ ...editMessage, content: e.target.value })}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            disabled={sending}
          >
            إلغاء
          </button>
          <button
            onClick={onUpdateMessage}
            disabled={sending || !editMessage.content.trim()}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded-lg flex items-center space-x-2"
          >
            {sending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>جاري التحديث...</span>
              </>
            ) : (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>تحديث</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditMessageModal;
