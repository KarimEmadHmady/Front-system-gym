'use client';

import React from 'react';
import { ArrowLeft, Users } from 'lucide-react';

interface ChatHeaderProps {
  selectedMember: any;
  showMembersList: boolean;
  onToggleList: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  selectedMember,
  showMembersList,
  onToggleList
}) => {
  return (
    <div className="flex items-center justify-between p-2 md:p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex-shrink-0">
      <div className="flex items-center gap-2 md:gap-3">
        <button
          onClick={onToggleList}
          className="p-1 md:p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors md:hidden"
        >
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-400" />
        </button>
        {selectedMember.avatarUrl ? (
          <img 
            src={selectedMember.avatarUrl} 
            alt={selectedMember.name}
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
          className={`w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-green-500 to-gray-600 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-base ${selectedMember.avatarUrl ? 'hidden' : ''}`}
          style={{ display: selectedMember.avatarUrl ? 'none' : 'flex' }}
        >
          {selectedMember.name?.charAt(0)}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm md:text-base">{selectedMember.name}</h3>
          <p className="text-xs md:text-sm text-green-500">عضو</p>
        </div>
      </div>
      <button
        onClick={onToggleList}
        className="p-1 md:p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors hidden md:block"
      >
        {showMembersList ? (
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-400" />
        ) : (
          <Users className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-400" />
        )}
      </button>
    </div>
  );
};

export default ChatHeader;
