'use client';

import React, { useState, useEffect, useRef } from 'react';
import { messageService } from '@/services';
import { userService } from '@/services';
import { useAuth } from '@/hooks/useAuth';
import type { Message } from '@/types';
import type { User } from '@/types/models';

// Import extracted components
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { formatTime, formatDate, isMyMessage, getMessageStatus } from './utils';

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
    // Only auto-scroll if user is near the bottom already
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
      // Append new message locally without refetching whole list
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
      // Keep focus in input for quick consecutive messages
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
      <ChatHeader
        trainer={trainer}
        onShowChatActions={() => setShowChatActions(!showChatActions)}
      />

      {/* Messages Container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23f3f4f6" fill-opacity="0.1"%3E%3Cpath d="m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}
      >
        <MessageList
          messages={messages}
          currentUser={currentUser}
          trainer={trainer}
          formatDate={formatDate}
          formatTime={formatTime}
          isMyMessage={(message) => isMyMessage(message, currentUser)}
          getMessageStatus={(message) => {
            const status = getMessageStatus(message, currentUser);
            if (status === 'read') {
              return (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586V7a1 1 0 10-2 0v5.586l3.293-3.293a1 1 0 011.414 0z"/>
                </svg>
              );
            } else if (status === 'unread') {
              return (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
                  <path d="M15 7v2a4 4 0 01-4 4H9l-3 3v-3H4a4 4 0 01-4-4V7a4 4 0 014-4h7a4 4 0 014 4z"/>
                </svg>
              );
            }
            return null;
          }}
          handleMessageClick={handleMessageClick}
          selectedMessage={selectedMessage}
          setSelectedMessage={setSelectedMessage}
          showMessageActions={setShowMessageActions}
        />
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput
        newMessage={newMessage}
        onMessageChange={setNewMessage}
        onSendMessage={handleSendMessage}
        sending={sending}
      />
    </div>
  );
};

export default MemberMessagesChat;
