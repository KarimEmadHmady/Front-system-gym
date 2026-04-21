'use client';

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
  X,
  Users
} from 'lucide-react';
import { userService } from '@/services';
import { useAuth } from '@/hooks/useAuth';
import type { Message } from '@/types';
import type { User } from '@/types/models';

import React, { useState, useEffect, useRef } from 'react';
import { messageService } from '@/services';
// Import extracted components
import MembersList from './MembersList';
import ChatArea from './ChatArea';
import MessageInput from './MessageInput';
import ChatHeader from './ChatHeader';
import { formatTime, formatDate, isMyMessage, getUnreadCount } from './utils';

const TrainerMessagesChat = () => {
  const { user: currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showMembersList, setShowMembersList] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedMember) {
      loadMessagesForMember(selectedMember._id);
    }
  }, [selectedMember]);

  // Scroll to bottom when selected member changes
  useEffect(() => {
    scrollToBottom();
  }, [selectedMember]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Show members list on desktop by default
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) { // md breakpoint
        setShowMembersList(true);
      }
    };

    // On initial mount, show members list even on small screens
    setShowMembersList(true);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // If members are loaded and we're on desktop (sidebar visible), auto-select first member when none selected
  useEffect(() => {
    if (showMembersList && members.length > 0 && !selectedMember) {
      setSelectedMember(members[0]);
    }
  }, [showMembersList, members, selectedMember]);

  // Show members list on desktop by default
  useEffect(() => {
    if (showMembersList && members.length > 0 && !selectedMember) {
      setSelectedMember(members[0]);
    }
  }, [showMembersList, members, selectedMember]);

  // Auto-mark messages as read when member is selected
  useEffect(() => {
    if (messages.length > 0 && selectedMember && currentUser) {
      const unread = messages.filter(
        m => !m.read && m.fromUserId === selectedMember._id && m.userId === currentUser.id
      );
      unread.forEach(m => markAsRead(m._id));
    }
  }, [messages, selectedMember, currentUser]);

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
      
      // جلب العملاء الصحيحين للمدرب
      const membersRes: any = await userService.getUsersByRole('member', { page: 1, limit: 1000 });
      const arr = Array.isArray(membersRes) ? membersRes : (membersRes?.data || []);
      
      const normalizeId = (val: any): string => {
        if (!val) return '';
        if (typeof val === 'string') return val;
        if (typeof val === 'object') return (val._id || val.id || '') as string;
        return String(val);
      };
      
      const me = normalizeId(currentUser.id);
      const filteredMembers = (arr || []).filter((m: any) => normalizeId(m?.trainerId) === me);
      
      setMembers(filteredMembers);
      
      // لا تقم باختيار أول عضو تلقائياً على الشاشات الصغيرة
      if (
        filteredMembers.length > 0 &&
        !selectedMember &&
        (typeof window === 'undefined' || window.innerWidth >= 768)
      ) {
        setSelectedMember(filteredMembers[0]);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const loadMessagesForMember = async (memberId: string) => {
    if (!currentUser?.id) return;
    
    try {
      const allMessages = await messageService.getMessagesForUser(currentUser.id);
      const memberMessages = allMessages
        .filter(m => (m.userId === memberId || m.fromUserId === memberId) && 
                    (m.userId === currentUser.id || m.fromUserId === currentUser.id))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      setMessages(memberMessages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في تحميل الرسائل');
    }
  };

  const handleSendMessage = async () => {
    if (!selectedMember || !newMessage.trim()) return;
    if (!currentUser?.id) return;
    
    try {
      setSending(true);
      const messageData = {
        message: newMessage,
        content: newMessage,
        subject: 'رسالة من المدرب',
        userId: selectedMember._id,
        fromUserId: currentUser.id
      };
      
      await messageService.createMessage(messageData);
      setNewMessage('');
      loadMessagesForMember(selectedMember._id);
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
      await messageService.markMessageAsRead(messageId);
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
          onClick={() => {
            setError(null);
            loadData();
          }}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400 text-lg">لا يوجد أعضاء مسجلين معك</p>
      </div>
    );
  }

  // تعديل: sidebar دائمًا ظاهر في md وما فوق
  return (
    <div className="flex h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 relative overflow-hidden flex-col md:flex-row">
      {/* Members List Sidebar */}
      <MembersList
        members={members}
        selectedMember={selectedMember}
        showMembersList={showMembersList}
        onMemberSelect={setSelectedMember}
        onToggleList={() => setShowMembersList(!showMembersList)}
        getUnreadCount={(memberId) => getUnreadCount(memberId, messages, currentUser)}
      />

      {/* Chat Area */}
      <ChatArea
        messages={messages}
        selectedMember={selectedMember}
        currentUser={currentUser}
        formatDate={formatDate}
        formatTime={formatTime}
        isMyMessage={(message) => isMyMessage(message, currentUser)}
        getMessageStatus={(message) => {
          if (isMyMessage(message, currentUser)) {
            return (
              <CheckCheck className="w-4 h-4" style={{ color: message.read ? '#22c55e' : '#9ca3af' }} />
            );
          }
          return null;
        }}
        handleMessageClick={handleMessageClick}
        onEditMessage={(message, e) => {
          e.stopPropagation();
          // Handle edit
        }}
        onDeleteMessage={(messageId, e) => {
          e.stopPropagation();
          // Handle delete
        }}
      />

      {/* Message Input */}
      <MessageInput
        newMessage={newMessage}
        sending={sending}
        onNewMessageChange={setNewMessage}
        onSendMessage={handleSendMessage}
        inputRef={inputRef as React.RefObject<HTMLInputElement>}
      />

      {/* No member selected state */}
      {!selectedMember && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">اختر عضواً لبدء المحادثة</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerMessagesChat;
