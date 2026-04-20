import React from 'react';
import { ArrowLeft, Users, Phone, Video, MoreVertical } from 'lucide-react';
import type { User, Message } from '@/types/models';

interface Conversation {
  user1: User;
  user2: User;
  lastMessage?: Message;
  unreadCount: number;
}

interface ChatHeaderProps {
  selectedConversation: Conversation;
  showConversationsList: boolean;
  onToggleConversationsList: () => void;
  onBackToList: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  selectedConversation,
  showConversationsList,
  onToggleConversationsList,
  onBackToList,
}) => {
  return (
    <div className="flex items-center justify-between p-2 md:p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
      <div className="flex items-center gap-2 md:gap-3">
        <button
          onClick={onBackToList}
          className="p-1 md:p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors md:hidden"
        >
          <ArrowLeft className="w-3 h-3 md:w-5 md:h-5 text-gray-600 dark:text-gray-400" />
        </button>
        
        <button
          onClick={onToggleConversationsList}
          className="p-1 md:p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors hidden md:block"
        >
          {showConversationsList ? (
            <ArrowLeft className="w-3 h-3 md:w-5 md:h-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <Users className="w-3 h-3 md:w-5 md:h-5 text-gray-600 dark:text-gray-400" />
          )}
        </button>
        
        {selectedConversation.user1.avatarUrl ? (
          <img 
            src={selectedConversation.user1.avatarUrl} 
            alt={selectedConversation.user1.name}
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
          className={`w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-green-500 to-gray-600 rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm ${selectedConversation.user1.avatarUrl ? 'hidden' : ''}`}
          style={{ display: selectedConversation.user1.avatarUrl ? 'none' : 'flex' }}
        >
          {selectedConversation.user1.name?.charAt(0)}
        </div>
        {selectedConversation.user2.avatarUrl ? (
          <img 
            src={selectedConversation.user2.avatarUrl} 
            alt={selectedConversation.user2.name}
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
          className={`w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-gray-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm ${selectedConversation.user2.avatarUrl ? 'hidden' : ''}`}
          style={{ display: selectedConversation.user2.avatarUrl ? 'none' : 'flex' }}
        >
          {selectedConversation.user2.name?.charAt(0)}
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white text-[12px] md:text-base truncate">
            {selectedConversation.user1.name} & {selectedConversation.user2.name}
          </h3>
          <p className="text-xs md:text-sm text-green-500">Conversation</p>
        </div>
      </div>
      
      <div className="flex items-center gap-1 md:gap-2">
        <button className="p-1 md:p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
          <Phone className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <button className="p-1 md:p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
          <Video className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <button className="p-1 md:p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
          <MoreVertical className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
