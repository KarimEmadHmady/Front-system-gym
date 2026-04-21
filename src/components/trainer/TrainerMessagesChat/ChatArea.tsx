'use client';

import React, { useRef } from 'react';
import { Send, Edit, Trash2 } from 'lucide-react';

interface ChatAreaProps {
  messages: any[];
  selectedMember: any;
  currentUser: any;
  formatDate: (date: string | Date) => string;
  formatTime: (date: string | Date) => string;
  isMyMessage: (message: any) => boolean;
  getMessageStatus: (message: any) => React.ReactNode;
  handleMessageClick: (message: any) => void;
  onEditMessage: (message: any, e: React.MouseEvent) => void;
  onDeleteMessage: (messageId: string, e: React.MouseEvent) => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  selectedMember,
  currentUser,
  formatDate,
  formatTime,
  isMyMessage,
  getMessageStatus,
  handleMessageClick,
  onEditMessage,
  onDeleteMessage
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  return (
    <div 
      className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900 scrollbar-hide"
      style={{ 
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cpath d=\"m36 34v-4h-2v4h-4v2h4v4h2v4h2v4h2v4h2V6h4V4h-4zm0-30V0h-2v4h-4v2h4v4h2v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v4h2v4h2V6h4V4h-4zM6 4V0H4v4H0v2h4v4h2v4h2v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/svg%3E")',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}
    >
      {messages.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💬</div>
          <p className="text-gray-500 dark:text-gray-400">ابدأ محادثة مع {selectedMember.name}</p>
        </div>
      ) : (
        messages.map((message, index) => {
          const showDate = index === 0 || 
            formatDate(messages[index - 1].date) !== formatDate(message.date);
          return (
            <div key={message._id}>
              {/* Date Separator */}
              {showDate && (
                <div className="flex justify-center mb-4">
                  <span className="bg-white dark:bg-gray-800 px-3 py-1 rounded-full text-xs text-gray-500 dark:text-gray-400 shadow-sm">
                    {formatDate(message.date)}
                  </span>
                </div>
              )}
              {/* Message Bubble */}
              <div 
                className={`flex ${isMyMessage(message) ? 'justify-end' : 'justify-start'} mb-2`}
                onClick={() => handleMessageClick(message)}
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
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatArea;
