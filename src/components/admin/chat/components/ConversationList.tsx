import React from 'react';
import { X, Users } from 'lucide-react';
import type { User, Message } from '@/types/models';

interface Conversation {
  user1: User;
  user2: User;
  lastMessage?: Message;
  unreadCount: number;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  showConversationsList: boolean;
  onConversationSelect: (conversation: Conversation) => void;
  onCloseList: () => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversation,
  showConversationsList,
  onConversationSelect,
  onCloseList,
}) => {
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

  return (
    <div className={`${showConversationsList ? 'w-full md:w-80 h-1/2 md:h-full' : 'w-0 h-0'} transition-all duration-300 overflow-hidden border-r md:border-r border-b md:border-b-0 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 ${showConversationsList ? 'block md:relative' : 'hidden'}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white">المحادثات ({conversations.length})</h3>
        <button
          onClick={onCloseList}
          className="md:hidden p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
      
      <div className="overflow-y-auto h-full">
        {conversations.map((conversation, idx) => (
          <div
            key={conversation.user1._id + '-' + conversation.user2._id}
            onClick={() => {
              onConversationSelect(conversation);
              // On mobile, hide conversation list after selection
              if (window.innerWidth < 768) {
                onCloseList();
              }
            }}
            className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
              selectedConversation && 
              ((selectedConversation.user1._id === conversation.user1._id && selectedConversation.user2._id === conversation.user2._id) ||
               (selectedConversation.user1._id === conversation.user2._id && selectedConversation.user2._id === conversation.user1._id))
              ? 'bg-gray-50 dark:bg-gray-900/20 border-r-4 border-r-gray-500' : ''
            }`}
          >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3">
                {conversation.user1.avatarUrl ? (
                  <img 
                    src={conversation.user1.avatarUrl} 
                    alt={conversation.user1.name}
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className={`w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-green-500 to-gray-600 rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm ${conversation.user1.avatarUrl ? 'hidden' : ''}`}
                  style={{ display: conversation.user1.avatarUrl ? 'none' : 'flex' }}
                >
                  {conversation.user1.name?.charAt(0)}
                </div>
                {conversation.user2.avatarUrl ? (
                  <img 
                    src={conversation.user2.avatarUrl} 
                    alt={conversation.user2.name}
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className={`w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-gray-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm ${conversation.user2.avatarUrl ? 'hidden' : ''}`}
                  style={{ display: conversation.user2.avatarUrl ? 'none' : 'flex' }}
                >
                  {conversation.user2.name?.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 dark:text-white text-xs md:text-sm truncate">
                    {conversation.user1.name} & {conversation.user2.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {conversation.lastMessage?.message || 'No messages'}
                  </p>
                </div>
              </div>
              {conversation.unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {conversation.unreadCount}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversationList;
