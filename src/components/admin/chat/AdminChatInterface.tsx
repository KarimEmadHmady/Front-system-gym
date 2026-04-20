'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { messageService } from '@/services';
import { userService } from '@/services';
import { useAuth } from '@/hooks/useAuth';
import type { Message, User } from '@/types/models';
import { Users } from 'lucide-react';
import ConversationList from './components/ConversationList';
import ChatHeader from './components/ChatHeader';
import MessageList from './components/MessageList';
import MessageInput from './components/MessageInput';

// نوع المحادثة
interface Conversation {
  user1: User;
  user2: User;
  lastMessage?: Message;
  unreadCount: number;
}

const AdminChatInterface = () => {
  const { user: currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showConversationsList, setShowConversationsList] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  // مرر للأسفل عند تغيير المحادثة المختارة
  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation]);

  // Show conversations list on desktop by default, on mobile show it first
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) { // md breakpoint
        setShowConversationsList(true);
      } else {
        // على الموبايل، اعرض قائمة المحادثات إذا لم يتم اختيار محادثة بعد
        setShowConversationsList(!selectedConversation);
      }
    };

    handleResize(); // Check on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [selectedConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [messagesData, usersData] = await Promise.all([
        messageService.getAllMessages(),
        userService.getAll()
      ]);
      setMessages(messagesData);
      setUsers(Array.isArray(usersData.data) ? usersData.data as User[] : Array.isArray(usersData) ? usersData as User[] : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  // تجميع كل المحادثات (كل اثنين بينهم رسائل)
  const conversations = useMemo(() => {
    const pairs = new Map<string, Conversation>();
    
    messages.forEach(msg => {
      const user1 = users.find(u => u._id === msg.fromUserId);
      const user2 = users.find(u => u._id === msg.userId);
      
      if (!user1 || !user2) return;
      
      const pairKey = [msg.fromUserId, msg.userId].sort().join('-');
      
      if (!pairs.has(pairKey)) {
        pairs.set(pairKey, {
          user1,
          user2,
          lastMessage: msg,
          unreadCount: 0
        });
      } else {
        const existing = pairs.get(pairKey)!;
        if (new Date(msg.date) > new Date(existing.lastMessage?.date || 0)) {
          existing.lastMessage = msg;
        }
      }
    });
    
    // حساب عدد الرسائل غير المقروءة لكل محادثة
    pairs.forEach((conversation, pairKey) => {
      const [userId1, userId2] = pairKey.split('-');
      const unreadCount = messages.filter(m => 
        ((m.fromUserId === userId1 && m.userId === userId2) || 
         (m.fromUserId === userId2 && m.userId === userId1)) && 
        !m.read
      ).length;
      conversation.unreadCount = unreadCount;
    });
    
    return Array.from(pairs.values()).sort((a, b) => 
      new Date(b.lastMessage?.date || 0).getTime() - new Date(a.lastMessage?.date || 0).getTime()
    );
  }, [messages, users]);

  // رسائل المحادثة المختارة
  const conversationMessages = useMemo(() => {
    if (!selectedConversation) return [];
    return messages.filter(
      m =>
        (m.fromUserId === selectedConversation.user1._id && m.userId === selectedConversation.user2._id) ||
        (m.fromUserId === selectedConversation.user2._id && m.userId === selectedConversation.user1._id)
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [messages, selectedConversation]);

  // إرسال رسالة جديدة
  const handleSendMessage = async () => {
    if (!selectedConversation || !newMessage.trim() || !currentUser) return;
    
    try {
      setSending(true);
      const messageData = {
        message: newMessage,
        content: newMessage,
        subject: 'رسالة من الأدمن',
        userId: selectedConversation.user1._id === (currentUser as any)._id ? selectedConversation.user2._id : selectedConversation.user1._id,
        fromUserId: (currentUser as any)._id || (currentUser as any).id
      };
      
      await messageService.createMessage(messageData);
      setNewMessage('');
      loadData(); // إعادة تحميل البيانات لتحديث الرسائل
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في إرسال الرسالة');
    } finally {
      setSending(false);
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

  if (conversations.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400 text-lg">لا يوجد محادثات</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[400px] md:h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 relative overflow-hidden">
      <ConversationList
        conversations={conversations}
        selectedConversation={selectedConversation}
        showConversationsList={showConversationsList}
        onConversationSelect={setSelectedConversation}
        onCloseList={() => setShowConversationsList(false)}
      />

      <div className="flex-1 flex flex-col min-h-0">
        {selectedConversation ? (
          <>
            <ChatHeader
              selectedConversation={selectedConversation}
              showConversationsList={showConversationsList}
              onToggleConversationsList={() => setShowConversationsList(!showConversationsList)}
              onBackToList={() => {
                setShowConversationsList(true);
                setSelectedConversation(null);
              }}
            />

            <MessageList
              selectedConversation={selectedConversation}
              conversationMessages={conversationMessages}
              messagesEndRef={messagesEndRef}
              chatContainerRef={chatContainerRef}
            />

            <MessageInput
              newMessage={newMessage}
              onMessageChange={setNewMessage}
              onSendMessage={handleSendMessage}
              sending={sending}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Select a conversation to view messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChatInterface;
