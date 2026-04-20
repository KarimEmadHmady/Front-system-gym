import React from 'react';
import { CheckCheck } from 'lucide-react';
import type { User } from '@/types/models';

interface Message {
  _id: string;
  fromUserId: string;
  userId: string;
  message: string;
  content?: string;
  subject?: string;
  date: Date | string;
  read: boolean;
}

interface Conversation {
  user1: User;
  user2: User;
  lastMessage?: Message;
  unreadCount: number;
}

interface MessageListProps {
  selectedConversation: Conversation;
  conversationMessages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  chatContainerRef: React.RefObject<HTMLDivElement | null>;
}

const MessageList: React.FC<MessageListProps> = ({
  selectedConversation,
  conversationMessages,
  messagesEndRef,
  chatContainerRef,
}) => {
  const formatTime = (date: string | Date) => {
    return new Date(date).toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = (date: string | Date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString('ar-EG');
    }
  };

  const isMyMessage = (message: Message) => {
    // In admin view, messages from user1 appear on the right
    // and messages from user2 appear on the left
    if (selectedConversation) {
      return message.fromUserId === selectedConversation.user1._id;
    }
    return false;
  };

  const getMessageStatus = (message: Message) => {
    if (isMyMessage(message)) {
      return (
        <CheckCheck className="w-4 h-4" style={{ color: message.read ? '#22c55e' : '#9ca3af' }} />
      );
    }
    return null;
  };

  return (
    <div 
      ref={chatContainerRef}
      className="flex-1 min-h-0 overflow-y-auto p-2 md:p-4 space-y-4 bg-gray-50 dark:bg-gray-900"
      style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23f3f4f6" fill-opacity="0.1"%3E%3Cpath d="m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}
    >
      {conversationMessages.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">Start conversation</div>
          <p className="text-gray-500 dark:text-gray-400">
            Start conversation between {selectedConversation.user1.name} and {selectedConversation.user2.name}
          </p>
        </div>
      ) : (
        conversationMessages.map((message, index) => {
          const showDate = index === 0 || 
            formatDate(conversationMessages[index - 1].date) !== formatDate(message.date);
          
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
              <div className={`flex ${isMyMessage(message) ? 'justify-end' : 'justify-start'} mb-2`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm cursor-pointer group relative ${
                  isMyMessage(message)
                    ? 'bg-gray-500 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                }`}>
                  {/* Message Content */}
                  <div className="break-words">
                    {message.subject && message.subject !== 'Message from admin' && (
                      <div className={`font-semibold text-sm mb-1 ${
                        isMyMessage(message) ? 'text-gray-100' : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {message.subject}
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

export default MessageList;
