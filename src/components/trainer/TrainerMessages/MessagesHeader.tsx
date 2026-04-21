'use client';

import React from 'react';
import { MessageSquare, Plus } from 'lucide-react';

interface MessagesHeaderProps {
  onShowCreateModal: () => void;
}

const MessagesHeader: React.FC<MessagesHeaderProps> = ({ onShowCreateModal }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-3">
        <MessageSquare className="w-8 h-8 text-gray-600" />
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">رسائلي مع الأعضاء</h3>
      </div>
      <button
        onClick={onShowCreateModal}
        className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span>رسالة جديدة</span>
      </button>
    </div>
  );
};

export default MessagesHeader;
