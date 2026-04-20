import React from 'react';
import { 
  MailOpen, 
  Edit, 
  Trash2, 
  Calendar,
  User as UserIcon,
  MessageSquare
} from 'lucide-react';
import type { Message } from '@/types';
import type { User } from '@/types/models';

interface MessageTableProps {
  paginatedMessages: Message[];
  users: User[];
  getUserName: (userId: string) => string;
  getUserEmail: (userId: string) => string;
  getUserPhone: (userId: string) => string;
  formatDate: (date: Date | string) => string;
  onMarkAsRead: (messageId: string) => void;
  onEditMessage: (message: Message) => void;
  onDeleteMessage: (messageId: string) => void;
  onViewMessage: (message: Message) => void;
  onShowChatBubble: (user1: string, user2: string) => void;
}

const MessageTable: React.FC<MessageTableProps> = ({
  paginatedMessages,
  users,
  getUserName,
  getUserEmail,
  getUserPhone,
  formatDate,
  onMarkAsRead,
  onEditMessage,
  onDeleteMessage,
  onViewMessage,
  onShowChatBubble,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-center py-2 px-2 font-semibold text-gray-900 dark:text-white ">Sender</th>
            <th className="text-center py-2 px-2 font-semibold text-gray-900 dark:text-white ">Recipient</th>
            <th className="text-center py-2 px-2 font-semibold text-gray-900 dark:text-white ">Preview</th>
            <th className="text-center py-2 px-2 font-semibold text-gray-900 dark:text-white ">Date</th>
            <th className="text-center py-2 px-2 font-semibold text-gray-900 dark:text-white ">Status</th>
            <th className="text-center py-2 px-2 font-semibold text-gray-900 dark:text-white ">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedMessages.map((message) => (
            <tr key={message._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td className="py-2 px-2 whitespace-nowrap max-w-[120px] truncate text-center">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{getUserName(message.fromUserId)}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{getUserEmail(message.fromUserId)}</p>
                  </div>
                </div>
              </td>
              <td className="py-2 px-2 whitespace-nowrap max-w-[120px] truncate text-center">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{getUserName(message.userId)}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{getUserEmail(message.userId)}</p>
                  </div>
                </div>
              </td>
              <td className="py-2 px-2 whitespace-nowrap max-w-[100px] truncate text-center">
                <div className="flex items-center space-x-1 justify-center w-100%">
                  <button
                    onClick={() => onViewMessage(message)}
                    className="flex items-center space-x-1 px-2 py-1 bg-gray-50 hover:bg-gray-100 dark:bg-gray-900/20 dark:hover:bg-gray-900/30 text-gray-600 dark:text-gray-400 rounded-lg text-xs font-medium transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>View Message</span>
                  </button>
                </div>
              </td>
              <td className="py-2 px-2 whitespace-nowrap max-w-[90px] truncate text-center">
                <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(message.date)}</span>
                </div>
              </td>
              <td className="py-2 px-2 whitespace-nowrap max-w-[70px] truncate text-center">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  message.read 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                }`}>
                  {message.read ? 'Read' : 'Unread'}
                </span>
              </td>
              <td className="py-2 px-2 whitespace-nowrap max-w-[90px] truncate text-center">
                <div className="flex items-center space-x-1 justify-center">
                  {!message.read && (
                    <button
                      onClick={() => onMarkAsRead(message._id)}
                      className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 dark:hover:bg-green-900 rounded"
                      title="Mark as read"
                    >
                      <MailOpen className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => onEditMessage(message)}
                    className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 rounded"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteMessage(message._id)}
                    className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onShowChatBubble(message.fromUserId, message.userId)}
                    className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 rounded"
                    title="Show Chat"
                  >
                    Chat
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MessageTable;
