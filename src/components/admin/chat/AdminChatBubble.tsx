import React, { useMemo, useRef, useState, useEffect } from 'react';
import type { Message } from '@/types';
import type { User } from '@/types/models';

interface AdminChatBubbleProps {
  user1: string;
  user2: string;
  messages: Message[];
  users: User[];
  currentUser: { _id: string; name: string; email: string; role: string } | null;
  onClose: () => void;
}

const AdminChatBubble: React.FC<AdminChatBubbleProps> = ({ user1, user2, messages, users, currentUser, onClose }) => {
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversationMessages = useMemo(() => {
    return messages.filter(
      m =>
        (m.fromUserId === user1 && m.userId === user2) ||
        (m.fromUserId === user2 && m.userId === user1)
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [messages, user1, user2]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages]);

  const getUserName = (userId: string) => users.find(u => u._id === userId)?.name || 'مستخدم غير معروف';

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;
    try {
      setSending(true);
      await (await import('@/services')).messageService.createMessage({
        fromUserId: currentUser._id,
        userId: user1 === currentUser._id ? user2 : user1,
        message: newMessage,
        subject: ''
      });
      setNewMessage('');
      // لا نعيد تحميل كل البيانات هنا، نعتمد على parent
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-gray-600 rounded-full flex items-center justify-center text-white font-bold">
            {getUserName(user1).charAt(0)}
          </div>
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-gray-600 rounded-full flex items-center justify-center text-white font-bold">
            {getUserName(user2).charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{getUserName(user1)} &amp; {getUserName(user2)}</h3>
          </div>
          <button onClick={onClose} className="ml-auto p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">إغلاق</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
          {conversationMessages.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">لا توجد رسائل بين هذين المستخدمين</div>
          ) : (
            conversationMessages.map((message, idx) => (
              <div key={message._id} className={`flex ${message.fromUserId === currentUser?._id ? 'justify-end' : 'justify-start'} mb-2`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm group relative ${
                  message.fromUserId === currentUser?._id
                    ? 'bg-gray-500 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                }`}>
                  <div className="break-words">
                    {message.subject && (
                      <div className={`font-semibold text-sm mb-1 ${message.fromUserId === currentUser?._id ? 'text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}>{message.subject}</div>
                    )}
                    <p className="text-sm">{message.message}</p>
                  </div>
                  <div className={`flex items-center justify-end gap-1 mt-1 ${message.fromUserId === currentUser?._id ? 'text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
                    <span className="text-xs">{new Date(message.date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                placeholder="اكتب رسالة..."
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-500 text-right"
                disabled={sending}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending}
              className="p-3 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full transition-colors"
            >
              إرسال
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminChatBubble;
