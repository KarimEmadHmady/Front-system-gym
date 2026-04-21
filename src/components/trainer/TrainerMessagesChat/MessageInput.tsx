'use client';

import React from 'react';
import { Send } from 'lucide-react';

interface MessageInputProps {
  newMessage: string;
  sending: boolean;
  onNewMessageChange: (message: string) => void;
  onSendMessage: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
}

const MessageInput: React.FC<MessageInputProps> = ({
  newMessage,
  sending,
  onNewMessageChange,
  onSendMessage,
  inputRef
}) => {
  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => onNewMessageChange(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && onSendMessage()}
            placeholder="اكتب رسالة..."
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-500 text-right disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={sending}
          />
        </div>
        <button
          onClick={onSendMessage}
          disabled={!newMessage.trim() || sending}
          className="p-3 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full transition-colors"
        >
          {sending ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
