'use client';

import React from 'react';
import { MessageSquare, Edit, Trash2, Calendar, User as UserIcon } from 'lucide-react';

interface MessageCardProps {
  message: any;
  currentUser: any;
  trainer: any;
  getUserName: (userId: string) => string;
  getUserEmail: (userId: string) => string;
  getUserPhone: (userId: string) => string;
  formatDate: (date: Date | string) => string;
  onViewMessage: (message: any) => void;
  onEditMessage: (message: any) => void;
  onDeleteMessage: (message: any) => void;
}

const MessageCard: React.FC<MessageCardProps> = ({
  message,
  currentUser,
  trainer,
  getUserName,
  getUserEmail,
  getUserPhone,
  formatDate,
  onViewMessage,
  onEditMessage,
  onDeleteMessage
}) => {
  return (
    <div
      key={message._id}
      className={`border rounded-lg p-4 shadow-sm transition hover:shadow-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 relative ${
        !message.read ? 'ring-2 ring-red-200 dark:ring-red-400' : ''
      }`}
    >
      {/* المرسل والمستلم جنب بعض في الأعلى */}
      <div className="flex gap-2 mb-4">
        {/* المرسل */}
        <div className="w-1/2 bg-gray-50 dark:bg-gray-900 rounded-lg p-2">
          <span className="text-xs text-gray-400 mb-1 block">المرسل</span>
          <div className="flex items-center gap-1">
            <div className="w-5 h-5 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
              <UserIcon className="w-3 h-3 text-gray-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900 dark:text-white text-[11px] truncate">
                {getUserName(message.fromUserId)}
              </p>
              <p className="text-[9px] text-gray-500 dark:text-gray-400 truncate">
                {getUserEmail(message.fromUserId)}
              </p>
            </div>
          </div>
        </div>

        {/* المستلم */}
        <div className="w-1/2 bg-gray-50 dark:bg-gray-900 rounded-lg p-2">
          <span className="text-xs text-gray-400 mb-1 block">المستلم</span>
          <div className="flex items-center gap-1">
            <div className="w-5 h-5 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
              <UserIcon className="w-3 h-3 text-green-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900 dark:text-white text-[11px] truncate">
                {getUserName(message.userId)}
              </p>
              <p className="text-[9px] text-gray-500 dark:text-gray-400 truncate">
                {getUserEmail(message.userId)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* عرض الرسالة */}
      <div className="mb-4">
        <button
          onClick={() => onViewMessage(message)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 dark:bg-gray-900/20 dark:hover:bg-gray-900/30 text-gray-600 dark:text-gray-400 rounded-lg text-sm font-medium transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          <span>عرض الرسالة</span>
        </button>
      </div>

      {/* الحالة والأزرار */}
      <div className="flex items-center justify-between mb-3">
        {/* الحالة */}
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            message.read
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
          }`}
        >
          {message.read ? 'مقروءة' : 'غير مقروءة'}
        </span>

        {/* أزرار التعديل والحذف */}
        {message.fromUserId === currentUser?.id && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEditMessage(message)}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors"
              title="تعديل"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDeleteMessage(message)}
              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
              title="حذف"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* التاريخ في الأسفل */}
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
        <Calendar className="w-4 h-4" />
        <span>{formatDate(message.date)}</span>
      </div>
    </div>
  );
};

export default MessageCard;
