'use client';

import React from 'react';
import { Phone, Video, MoreVertical } from 'lucide-react';

interface ChatHeaderProps {
  trainer: {
    _id: string;
    name: string;
    avatarUrl?: string;
  } | null;
  onCallClick?: () => void;
  onVideoClick?: () => void;
  onShowChatActions: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  trainer,
  onCallClick,
  onVideoClick,
  onShowChatActions
}) => {
  return (
    <div className="flex items-center justify-between p-2 md:p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
      <div className="flex items-center gap-2 md:gap-3">
        {trainer && trainer.avatarUrl ? (
          <img 
            src={trainer.avatarUrl} 
            alt={trainer.name || ''}
            className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        ) : null}
        {trainer && (
          <div 
            className={`w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-green-500 to-gray-600 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-base ${trainer.avatarUrl ? 'hidden' : ''}`}
            style={{ display: trainer.avatarUrl ? 'none' : 'flex' }}
          >
            {trainer.name?.charAt(0)}
          </div>
        )}
        {trainer && (
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm md:text-base">{trainer.name || ''}</h3>
            {/* <p className="text-xs md:text-sm text-green-500 dark:text-green-400">متصل</p> */}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-1 md:gap-2">
        <button className="p-1 md:p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
          <Phone className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <button className="p-1 md:p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
          <Video className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <button 
          onClick={onShowChatActions}
          className="p-1 md:p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors relative"
        >
          <MoreVertical className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
