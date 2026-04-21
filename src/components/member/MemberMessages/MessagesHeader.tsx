'use client';

import React from 'react';
import { Send } from 'lucide-react';

interface MessagesHeaderProps {
  trainer: {
    _id: string;
    name: string;
  } | null;
  onShowSendModal: () => void;
}

const MessagesHeader: React.FC<MessagesHeaderProps> = ({
  trainer,
  onShowSendModal
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">الرسائل</h2>
      {trainer && (
        <button
          onClick={onShowSendModal}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
        >
          <Send className="w-4 h-4" />
          <span>إرسال رسالة جديدة</span>
        </button>
      )}
    </div>
  );
};

export default MessagesHeader;
