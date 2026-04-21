'use client';

import React from 'react';
import { X } from 'lucide-react';

interface MessageViewModalProps {
  showMessage: boolean;
  selectedMessage: any;
  trainer: any;
  getUserName: (userId: string) => string;
  formatDate: (date: Date | string) => string;
  onClose: () => void;
  onEditMessage: () => void;
}

const MessageViewModal: React.FC<MessageViewModalProps> = ({
  showMessage,
  selectedMessage,
  trainer,
  getUserName,
  formatDate,
  onClose,
  onEditMessage
}) => {
  if (!showMessage || !selectedMessage) return null;

  return (
    <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {selectedMessage.subject || 'رسالة'}
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
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center">
                <div className="w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center">
                  <div className="text-white text-xs font-bold">
                    {getUserName(selectedMessage.fromUserId).charAt(0)}
                  </div>
                </div>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {getUserName(selectedMessage.fromUserId)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(selectedMessage.date)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
              {selectedMessage.content || selectedMessage.message}
            </p>
          </div>
        </div>
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            إغلاق
          </button>
          {selectedMessage.fromUserId === trainer?._id && (
            <button
              onClick={() => {
                onClose();
                onEditMessage();
              }}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
            >
              تعديل
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageViewModal;
