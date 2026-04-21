'use client';

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

interface MessageTableProps {
  filteredMessages: Message[];
  getUserName: (userId: string) => string;
  getUserEmail: (userId: string) => string;
  formatDate: (date: Date | string) => string;
  onViewMessage: (message: Message) => void;
  onMarkAsRead: (messageId: string) => void;
  onEditMessage: (message: Message) => void;
  onDeleteMessage: (messageId: string) => void;
}

const MessageTable: React.FC<MessageTableProps> = ({
  filteredMessages,
  getUserName,
  getUserEmail,
  formatDate,
  onViewMessage,
  onMarkAsRead,
  onEditMessage,
  onDeleteMessage
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white text-start">المرسل</th>
            <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white text-start">المستلم</th>
            <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white text-start">معاينة</th>
            <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white text-start">التاريخ</th>
            <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white text-start">الحالة</th>
            <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white text-start">الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {filteredMessages.map((message) => (
            <tr key={message._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td className="py-4 px-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{getUserName(message.fromUserId)}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{getUserEmail(message.fromUserId)}</p>
                  </div>
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{getUserName(message.userId)}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{getUserEmail(message.userId)}</p>
                  </div>
                </div>
              </td>
              <td className="py-4 px-4">
                <button
                  onClick={() => onViewMessage(message)}
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-900/20 dark:hover:bg-gray-900/30 text-gray-600 dark:text-gray-400 rounded-lg text-sm font-medium transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>عرض الرسالة</span>
                </button>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(message.date)}</span>
                </div>
              </td>
              <td className="py-4 px-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  message.read 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                }`}>
                  {message.read ? 'مقروءة' : 'غير مقروءة'}
                </span>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center space-x-2">
                  {!message.read && (
                    <button
                      onClick={() => onMarkAsRead(message._id)}
                      className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 dark:hover:bg-green-900 rounded"
                      title="تحديد كمقروءة"
                    >
                      <MailOpen className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => onEditMessage(message)}
                    className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 rounded"
                    title="تعديل"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteMessage(message._id)}
                    className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
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
