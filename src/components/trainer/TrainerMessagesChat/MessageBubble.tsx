'use client';

import React from 'react';
import { CheckCheck, Edit, Trash2 } from 'lucide-react';

interface MessageBubbleProps {
  message: any;
  selectedMember: any;
  currentUser: any;
  formatDate: (date: string | Date) => string;
  formatTime: (date: string | Date) => string;
  isMyMessage: (message: any) => boolean;
  getMessageStatus: (message: any) => React.ReactNode;
  onMessageClick: (message: any) => void;
  onEditMessage: (message: any, e: React.MouseEvent) => void;
  onDeleteMessage: (messageId: string, e: React.MouseEvent) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  selectedMember,
  currentUser,
  formatDate,
  formatTime,
  isMyMessage,
  getMessageStatus,
  onMessageClick,
  onEditMessage,
  onDeleteMessage
}) => {
  return (
    <div 
      className={`flex ${isMyMessage(message) ? 'justify-end' : 'justify-start'} mb-2`}
      onClick={() => onMessageClick(message)}
    >
      <div 
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm cursor-pointer group relative ${
          isMyMessage(message)
            ? 'bg-gray-500 text-white'
            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
        }`}
      >
        {/* Message Content */}
        <div className="break-words">
          {message.subject && message.subject !== 'رسالة من المدرب' && (
            <div className={`font-semibold text-sm mb-1 ${isMyMessage(message) ? 'text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}>
              {message.subject === 'رسالة من العضو' && selectedMember?.name
                ? `رسالة من ${selectedMember.name}`
                : message.subject}
            </div>
          )}
          <p className="text-sm">{message.content || message.message}</p>
        </div>
        {/* Message Time and Status */}
        <div className={`flex items-center justify-end gap-1 mt-1 ${isMyMessage(message) ? 'text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
          <span className="text-xs">{formatTime(message.date)}</span>
          {getMessageStatus(message)}
        </div>
        {/* Message Actions (Hidden by default, shown on hover) */}
        {isMyMessage(message) && (
          <div className="absolute top-0 left-0 transform -translate-x-full opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-1 bg-white dark:bg-gray-700 rounded-lg shadow-lg p-1 mr-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle edit
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                title="تعديل"
              >
                <Edit className="w-3 h-3 text-gray-600 dark:text-gray-400" />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle delete
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                title="حذف"
              >
                <Trash2 className="w-3 h-3 text-red-500" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
