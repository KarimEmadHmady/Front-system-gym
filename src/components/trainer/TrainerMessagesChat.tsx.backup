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
  X,
  Users
} from 'lucide-react';

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

  // مرر للأسفل عند تغيير العضو المختار
  useEffect(() => {
    scrollToBottom();
  }, [selectedMember]);

  // مرر للأسفل عند تغيير الرسائل
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0 && selectedMember && currentUser) {
      const unread = messages.filter(
        m => !m.read && m.fromUserId === selectedMember._id && m.userId === currentUser.id
      );
      unread.forEach(m => markAsRead(m._id));
    }
  }, [messages, selectedMember, currentUser]);

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

  const getUnreadCount = (memberId: string) => {
    return messages.filter(m => 
      m.fromUserId === memberId && 
      m.userId === currentUser?.id && 
      !m.read
    ).length;
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
      <div
        className={`
          transition-all duration-300 overflow-hidden border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900
          w-full md:w-80
          ${showMembersList ? 'absolute z-10 h-full md:static md:z-auto md:block' : 'hidden md:block'}
        `}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">الأعضاء ({members.length})</h3>
          <button
            onClick={() => setShowMembersList(false)}
            className="md:hidden p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        <div className="overflow-y-auto h-full">
          {members.map((member) => {
            const unreadCount = getUnreadCount(member._id);
            return (
              <div
                key={member._id}
                onClick={() => {
                  setSelectedMember(member);
                  if (window.innerWidth < 768) setShowMembersList(false); // Hide on mobile after selection
                }}
                className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                  selectedMember?._id === member._id ? 'bg-gray-50 dark:bg-gray-900/20 border-r-4 border-r-gray-500' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {member.avatarUrl ? (
                      <img 
                        src={member.avatarUrl} 
                        alt={member.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className={`w-10 h-10 bg-gradient-to-r from-green-500 to-gray-600 rounded-full flex items-center justify-center text-white font-bold ${member.avatarUrl ? 'hidden' : ''}`}
                      style={{ display: member.avatarUrl ? 'none' : 'flex' }}
                    >
                      {member.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{member.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{member.email}</p>
                    </div>
                  </div>
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {selectedMember ? (
          <>
            {/* Chat Header - Fixed on mobile */}
            <div className="flex items-center justify-between p-2 md:p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex-shrink-0">
              <div className="flex items-center gap-2 md:gap-3">
                <button
                  onClick={() => setShowMembersList(true)}
                  className="p-1 md:p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors md:hidden"
                >
                  <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={() => setShowMembersList(!showMembersList)}
                  className="p-1 md:p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors hidden md:block"
                >
                  {showMembersList ? (
                    <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <Users className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-400" />
                  )}
                </button>
                {selectedMember.avatarUrl ? (
                  <img 
                    src={selectedMember.avatarUrl} 
                    alt={selectedMember.name}
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
                  className={`w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-green-500 to-gray-600 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-base ${selectedMember.avatarUrl ? 'hidden' : ''}`}
                  style={{ display: selectedMember.avatarUrl ? 'none' : 'flex' }}
                >
                  {selectedMember.name?.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm md:text-base">{selectedMember.name}</h3>
                  <p className="text-xs md:text-sm text-green-500">عضو</p>
                </div>
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <button className="p-1 md:p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                  <Phone className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button className="p-1 md:p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                  <Video className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button className="p-1 md:p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                  <MoreVertical className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
            {/* Messages Container */}
            <div 
              ref={chatContainerRef}
              className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900 scrollbar-hide"
              style={{ 
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23f3f4f6\" fill-opacity=\"0.1\"%3E%3Cpath d=\"m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">💬</div>
                  <p className="text-gray-500 dark:text-gray-400">ابدأ محادثة مع {selectedMember.name}</p>
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
                            {message.subject && message.subject !== 'رسالة من المدرب' && (
                              <div className={`font-semibold text-sm mb-1 ${
                                isMyMessage(message) ? 'text-gray-100' : 'text-gray-600 dark:text-gray-400'
                              }`}>
                                {message.subject === 'رسالة من العضو' && selectedMember?.name
                                  ? `رسالة من ${selectedMember.name}`
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
                                    // Handle edit
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
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
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
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">اختر عضواً لبدء المحادثة</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainerMessagesChat;
