'use client';

import React, { useState, useEffect, useRef } from 'react';
import { messageService } from '@/services';
import { userService } from '@/services';
import { useAuth } from '@/hooks/useAuth';
import type { Message } from '@/types';
import type { User } from '@/types/models';
import { 
  Send,
  MoreVertical,
  Phone,
  Video,
  Search,
  ArrowLeft,
  Check,
  CheckCheck,
  Clock,
  Edit,
  Trash2,
  X
} from 'lucide-react';

const MemberMessagesChat = () => {
  const { user: currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [trainer, setTrainer] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showChatActions, setShowChatActions] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showMessageActions, setShowMessageActions] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const initialScrollDone = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  useEffect(() => {
    const container = chatContainerRef.current;
    // Force scroll to bottom on first load
    if (!initialScrollDone.current) {
      scrollToBottom();
      initialScrollDone.current = true;
      return;
    }
    // Only auto-scroll if the user is near the bottom already
    if (!container) return;
    const threshold = 120; // px from bottom
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    if (distanceFromBottom <= threshold) {
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0 && trainer && currentUser) {
      const unread = messages.filter(
        m => !m.read && m.fromUserId === trainer._id && m.userId === currentUser.id
      );
      unread.forEach(m => markAsRead(m._id));
    }
  }, [messages, trainer, currentUser]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadData = async () => {
    if (!currentUser?.id) {
      setError('لم يتم العثور على معرف المستخدم');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      let trainerData: User | null = null;
      if ((currentUser as any)?.trainerId) {
        trainerData = await userService.getUser((currentUser as any).trainerId);
      }
      setTrainer(trainerData);
      
      let messagesData: Message[] = [];
      if (trainerData) {
        const allMessages = await messageService.getMessagesForUser(currentUser.id);
        messagesData = allMessages
          .filter(m => (m.userId === trainerData._id || m.fromUserId === trainerData._id))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      }
      setMessages(messagesData);
      // Ensure first open starts at bottom
      requestAnimationFrame(() => {
        scrollToBottom();
      });
      initialScrollDone.current = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!trainer || !newMessage.trim()) return;
    if (!currentUser?.id) return;
    
    try {
      setSending(true);
      const messageData = {
        message: newMessage,
        content: newMessage,
        subject: 'رسالة من العضو',
        userId: trainer._id,
        fromUserId: currentUser.id
      };
      
      const created = await messageService.createMessage(messageData);
      // Append new message locally without refetching the whole list
      const now = new Date().toISOString();
      const createdMessage: Message = {
        _id: (created && (created as any)._id) || `temp-${Date.now()}`,
        message: newMessage,
        content: newMessage,
        subject: 'رسالة من العضو',
        userId: trainer._id as any,
        fromUserId: currentUser.id as any,
        date: (created && (created as any).date) || (now as any),
        read: false,
      } as any;
      setMessages((prev) => [...prev, createdMessage]);
      setNewMessage('');
      // Keep focus in the input for quick consecutive messages
      requestAnimationFrame(() => inputRef.current?.focus());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في إرسال الرسالة');
    } finally {
      setSending(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await messageService.markAsRead(messageId);
      setMessages(prev => 
        prev.map(msg => 
          msg._id === messageId ? { ...msg, read: true } : msg
        )
      );
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  };

  const handleMessageClick = (message: Message) => {
    if (!message.read && message.userId === currentUser?.id) {
      markAsRead(message._id);
    }
  };

  const formatTime = (date: string | Date) => {
    return new Date(date).toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = (date: string | Date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'اليوم';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'أمس';
    } else {
      return messageDate.toLocaleDateString('ar-EG');
    }
  };

  const isMyMessage = (message: Message) => {
    return message.fromUserId === currentUser?.id;
  };

  const getMessageStatus = (message: Message) => {
    if (isMyMessage(message)) {
      return (
        <CheckCheck className="w-4 h-4" style={{ color: message.read ? '#22c55e' : '#9ca3af' }} />
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">{error}</div>
        <button 
          onClick={loadData}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  if (!trainer) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 text-lg">لم يتم تعيين مدرب لك بعد</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-2 md:p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center gap-2 md:gap-3">
          {trainer.avatarUrl ? (
            <img 
              src={trainer.avatarUrl} 
              alt={trainer.name}
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
            className={`w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-green-500 to-gray-600 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-base ${trainer.avatarUrl ? 'hidden' : ''}`}
            style={{ display: trainer.avatarUrl ? 'none' : 'flex' }}
          >
            {trainer.name?.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm md:text-base">{trainer.name}</h3>
            {/* <p className="text-xs md:text-sm text-green-500">متصل</p> */}
          </div>
        </div>
        
        <div className="flex items-center gap-1 md:gap-2">
          <button className="p-1 md:p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
            <Phone className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button className="p-1 md:p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
            <Video className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button 
            onClick={() => setShowChatActions(!showChatActions)}
            className="p-1 md:p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors relative"
          >
            <MoreVertical className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23f3f4f6" fill-opacity="0.1"%3E%3Cpath d="m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}
      >
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-gray-500 dark:text-gray-400">ابدأ محادثة مع مدربك</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const showDate = index === 0 || 
              formatDate(messages[index - 1].date) !== formatDate(message.date);
            
            return (
              <div key={message._id}>
                {/* Date Separator */}
                {showDate && (
                  <div className="flex justify-center mb-4">
                    <span className="bg-white dark:bg-gray-800 px-3 py-1 rounded-full text-xs text-gray-500 dark:text-gray-400 shadow-sm">
                      {formatDate(message.date)}
                    </span>
                  </div>
                )}
                
                {/* Message Bubble */}
                <div 
                  className={`flex ${isMyMessage(message) ? 'justify-end' : 'justify-start'} mb-2`}
                  onClick={() => handleMessageClick(message)}
                >
                  <div 
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm cursor-pointer group relative ${
                      isMyMessage(message)
                        ? 'bg-gray-500 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {/* Message Content */}
                    <div className="break-words">
                      {message.subject && message.subject !== 'رسالة من العضو' && (
                        <div className={`font-semibold text-sm mb-1 ${
                          isMyMessage(message) ? 'text-gray-100' : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {message.subject === 'رسالة من المدرب' && trainer?.name
                            ? `رسالة من ${trainer.name}`
                            : message.subject}
                        </div>
                      )}
                      <p className="text-sm">{message.content || message.message}</p>
                    </div>
                    
                    {/* Message Time and Status */}
                    <div className={`flex items-center justify-end gap-1 mt-1 ${
                      isMyMessage(message) ? 'text-gray-100' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      <span className="text-xs">{formatTime(message.date)}</span>
                      {getMessageStatus(message)}
                    </div>

                    {/* Message Actions (Hidden by default, shown on hover) */}
                    {isMyMessage(message) && (
                      <div className="absolute top-0 left-0 transform -translate-x-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-1 bg-white dark:bg-gray-700 rounded-lg shadow-lg p-1 mr-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMessage(message);
                              setShowMessageActions(true);
                            }}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                            title="تعديل"
                          >
                            <Edit className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle delete
                            }}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                            title="حذف"
                          >
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
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
            {sending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberMessagesChat;
