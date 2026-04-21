'use client';

import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

interface MessageListProps {
  messages: any[];
  currentUser: any;
  trainer: any;
  formatDate: (date: string | Date) => string;
  formatTime: (date: string | Date) => string;
  isMyMessage: (message: any) => boolean;
  getMessageStatus: (message: any) => React.ReactNode;
  handleMessageClick: (message: any) => void;
  selectedMessage: any;
  setSelectedMessage: (message: any) => void;
  showMessageActions: (show: boolean) => void;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUser,
  trainer,
  formatDate,
  formatTime,
  isMyMessage,
  getMessageStatus,
  handleMessageClick,
  selectedMessage,
  setSelectedMessage,
  showMessageActions
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
      {messages.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💬</div>
          <p className="text-gray-500 dark:text-gray-400 text-lg">ابدأ محادثة مع مدربك</p>
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
                    {message.subject && message.subject !== 'رسالة من العضو' && (
                      <div className={`font-semibold text-sm mb-1 ${
                        isMyMessage(message) ? 'text-gray-100' : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {message.subject === 'رسالة من المدرب' && trainer?.name
                          ? `رسالة من ${trainer.name}`
                          : message.subject
                        }
                      </div>
                    )}
                    <p className="text-sm">{message.content || message.message}</p>
                  </div>
                  
                  {/* Message Time and Status */}
                  <div className={`flex items-center justify-end gap-1 mt-1 ${
                    isMyMessage(message) ? 'text-gray-100' : 'text-gray-500 dark:text-gray-400'
                  }`}>
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
                            setSelectedMessage(message);
                            showMessageActions(true);
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
    </div>
  );
};

export default MessageList;
