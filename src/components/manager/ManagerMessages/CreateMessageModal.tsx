'use client';

import React from 'react';
import type { User } from '@/types/models';

interface CreateMessageModalProps {
  showCreateModal: boolean;
  users: User[];
  newMessage: {
    userId: string;
    message: string;
    subject: string;
  };
  onClose: () => void;
  onUserIdChange: (userId: string) => void;
  onSubjectChange: (subject: string) => void;
  onMessageChange: (message: string) => void;
  onCreateMessage: () => void;
}

const CreateMessageModal: React.FC<CreateMessageModalProps> = ({
  showCreateModal,
  users,
  newMessage,
  onClose,
  onUserIdChange,
  onSubjectChange,
  onMessageChange,
  onCreateMessage
}) => {
  if (!showCreateModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">رسالة جديدة</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              المستلم
            </label>
            <select
              value={newMessage.userId}
              onChange={(e) => onUserIdChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">اختر المستلم</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>{user.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              موضوع الرسالة (اختياري)
            </label>
            <input
              type="text"
              value={newMessage.subject}
              onChange={(e) => onSubjectChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent dark:bg-gray-700 dark:text-white mb-4"
              placeholder="موضوع الرسالة..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              نص الرسالة
            </label>
            <textarea
              value={newMessage.message}
              onChange={(e) => onMessageChange(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="اكتب الرسالة هنا..."
            />
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            إلغاء
          </button>
          <button
            onClick={onCreateMessage}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
          >
            إرسال
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateMessageModal;
