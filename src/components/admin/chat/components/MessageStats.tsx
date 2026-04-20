import React from 'react';
import { Mail, MailOpen } from 'lucide-react';
import type { Message } from '@/types';

interface MessageStatsProps {
  messages: Message[];
}

const MessageStats: React.FC<MessageStatsProps> = ({ messages }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400"> اجمالى الرسائل</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{messages.length}</p>
          </div>
          <Mail className="w-8 h-8 text-gray-600" />
        </div>
      </div>
      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-green-600 dark:text-green-400">الرسائل المقروءة </p>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100">
              {messages.filter(m => m.read).length}
            </p>
          </div>
          <MailOpen className="w-8 h-8 text-green-600" />
        </div>
      </div>
      <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-orange-600 dark:text-orange-400">الرسائل غير المقروءة</p>
            <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
              {messages.filter(m => !m.read).length}
            </p>
          </div>
          <Mail className="w-8 h-8 text-orange-600" />
        </div>
      </div>
    </div>
  );
};

export default MessageStats;
