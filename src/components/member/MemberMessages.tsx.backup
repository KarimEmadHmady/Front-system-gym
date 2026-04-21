'use client';

import React, { useState, useEffect } from 'react';
import { messageService } from '@/services';
import { userService } from '@/services';
import { useAuth } from '@/hooks/useAuth';
import type { Message } from '@/types';
import type { User } from '@/types/models';
import { 
  Mail, 
  MailOpen, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Calendar,
  User as UserIcon,
  MessageSquare,
  Send,
  X,
  AlertTriangle
} from 'lucide-react';

const MemberMessages = () => {
  const { user: currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [trainer, setTrainer] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'read' | 'unread'>('all');
  
  // Modal states
  const [showMessagePopup, setShowMessagePopup] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);
  
  // Form states
  const [newMessage, setNewMessage] = useState({
    content: '',
    subject: ''
  });
  const [editMessage, setEditMessage] = useState({
    content: '',
    subject: ''
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

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
        messagesData = allMessages.filter(
          m => (m.userId === trainerData._id || m.fromUserId === trainerData._id)
        );
      }
      setMessages(messagesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  // Message actions
  const handleViewMessage = (message: Message) => {
    setSelectedMessage(message);
    setShowMessagePopup(true);
    // Mark as read if not already read
    if (!message.read && message.userId === currentUser?.id) {
      markAsRead(message._id);
    }
  };

  const handleSendMessage = async () => {
    if (!trainer || !newMessage.content.trim()) return;
    if (!currentUser?.id) {
      setError('لم يتم العثور على معرف المستخدم');
      return;
    }
    
    try {
      setSending(true);
      const messageData = {
        message: newMessage.content,
        content: newMessage.content,
        subject: newMessage.subject || 'رسالة من العضو',
        userId: trainer._id,
        fromUserId: currentUser.id
      };
      
      await messageService.createMessage(messageData);
      setNewMessage({ content: '', subject: '' });
      setShowSendModal(false);
      loadData(); // Reload messages
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في إرسال الرسالة');
    } finally {
      setSending(false);
    }
  };

  const handleEditMessage = async () => {
    if (!selectedMessage || !editMessage.content.trim()) return;
    
    try {
      setSending(true);
      await messageService.updateMessage(selectedMessage._id, {
        content: editMessage.content,
        subject: editMessage.subject
      });
      setShowEditModal(false);
      setSelectedMessage(null);
      loadData(); // Reload messages
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في تعديل الرسالة');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async () => {
    if (!messageToDelete) return;
    
    try {
      await messageService.deleteMessage(messageToDelete._id);
      setShowDeleteConfirm(false);
      setMessageToDelete(null);
      loadData(); // Reload messages
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في حذف الرسالة');
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await messageService.markAsRead(messageId);
      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? { ...msg, read: true } : msg
      ));
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  };

  const openEditModal = (message: Message) => {
    setSelectedMessage(message);
    setEditMessage({
      content: message.content || message.message,
      subject: message.subject || ''
    });
    setShowEditModal(true);
  };

  const openDeleteConfirm = (message: Message) => {
    setMessageToDelete(message);
    setShowDeleteConfirm(true);
  };

  // Helper functions
  const getUserName = (userId: string) => {
    if (trainer && trainer._id === userId) return trainer.name;
    if (currentUser?.id === userId) return currentUser.name;
    return 'مستخدم غير معروف';
  };
  const getUserEmail = (userId: string) => {
    if (trainer && trainer._id === userId) return trainer.email;
    if (currentUser?.id === userId) return currentUser.email;
    return '';
  };
  const getUserPhone = (userId: string) => {
    if (trainer && trainer._id === userId) return (trainer as any).phone || '';
    if (currentUser?.id === userId) return (currentUser as any).phone || '';
    return '';
  };
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter messages
  const filteredMessages = messages.filter(message => {
    const searchLower = searchTerm.toLowerCase();
    const senderName = getUserName(message.fromUserId).toLowerCase();
    const receiverName = getUserName(message.userId).toLowerCase();
    const senderPhone = getUserPhone(message.fromUserId).toLowerCase();
    const receiverPhone = getUserPhone(message.userId).toLowerCase();
    const matchesSearch = searchTerm === '' || 
      senderName.includes(searchLower) ||
      receiverName.includes(searchLower) ||
      senderPhone.includes(searchLower) ||
      receiverPhone.includes(searchLower);
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'read' && message.read) ||
      (filterStatus === 'unread' && !message.read);
    return matchesSearch && matchesFilter;
  });

  if (!currentUser) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">جاري تحميل بيانات المستخدم...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">جاري تحميل الرسائل...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-center py-12">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              loadData();
            }}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }
  
  if (!trainer) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-center py-12">
          <div className="text-orange-500 text-6xl mb-4">👨‍🏫</div>
          <p className="text-orange-600 text-lg mb-4">لا يوجد مدرب مرتبط بك حالياً</p>
          <p className="text-gray-500 dark:text-gray-400">يرجى التواصل مع الإدارة لربط مدرب بك</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      {/* Header with Send Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">الرسائل</h2>
        {trainer && (
          <button
            onClick={() => setShowSendModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>إرسال رسالة جديدة</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="البحث بالاسم أو رقم الهاتف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">جميع الرسائل</option>
            <option value="read">مقروءة</option>
            <option value="unread">غير مقروءة</option>
          </select>
        </div>
      </div>

      {/* Messages Cards */}
      <div className="space-y-4">
        {filteredMessages.length === 0 && (
          <div className="text-center py-12">
            <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">لا توجد رسائل</p>
          </div>
        )}
        {filteredMessages.map((message) => (
          <div
            key={message._id}
            className={`border rounded-lg p-4 shadow-sm transition hover:shadow-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 relative ${!message.read ? 'ring-2 ring-red-200 dark:ring-red-400' : ''}`}
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
                    <p className="font-medium text-gray-900 dark:text-white text-[11px] truncate">{getUserName(message.fromUserId)}</p>
                    <p className="text-[9px] text-gray-500 dark:text-gray-400 truncate">{getUserEmail(message.fromUserId)}</p>
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
                    <p className="font-medium text-gray-900 dark:text-white text-[11px] truncate">{getUserName(message.userId)}</p>
                    <p className="text-[9px] text-gray-500 dark:text-gray-400 truncate">{getUserEmail(message.userId)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* عرض الرسالة */}
            <div className="mb-4">
              <button
                onClick={() => handleViewMessage(message)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 dark:bg-gray-900/20 dark:hover:bg-gray-900/30 text-gray-600 dark:text-gray-400 rounded-lg text-sm font-medium transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>عرض الرسالة</span>
              </button>
            </div>

            {/* الحالة والأزرار */}
            <div className="flex items-center justify-between mb-3">
              {/* الحالة */}
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                message.read
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
              }`}>
                {message.read ? 'مقروءة' : 'غير مقروءة'}
              </span>
              
              {/* أزرار التعديل والحذف */}
              {message.fromUserId === currentUser?.id && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(message)}
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors"
                    title="تعديل"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openDeleteConfirm(message)}
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
        ))}
      </div>

      {/* Message View Popup */}
      {showMessagePopup && selectedMessage && (
        <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {selectedMessage.subject || 'رسالة'}
              </h3>
              <button
                onClick={() => setShowMessagePopup(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {getUserName(selectedMessage.fromUserId)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(selectedMessage.date)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                  {selectedMessage.content || selectedMessage.message}
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowMessagePopup(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                إغلاق
              </button>
              {selectedMessage.fromUserId === currentUser?.id && (
                <button
                  onClick={() => {
                    setShowMessagePopup(false);
                    openEditModal(selectedMessage);
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                >
                  تعديل
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Send Message Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                إرسال رسالة جديدة
              </h3>
              <button
                onClick={() => setShowSendModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  إلى: {trainer?.name}
                </label>
                <input
                  type="text"
                  placeholder="موضوع الرسالة (اختياري)"
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent dark:bg-gray-700 dark:text-white mb-4"
                />
                <textarea
                  placeholder="اكتب رسالتك هنا..."
                  value={newMessage.content}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowSendModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                disabled={sending}
              >
                إلغاء
              </button>
              <button
                onClick={handleSendMessage}
                disabled={sending || !newMessage.content.trim()}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded-lg flex items-center space-x-2"
              >
                {sending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>جاري الإرسال...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>إرسال</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Message Modal */}
      {showEditModal && selectedMessage && (
        <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                تعديل الرسالة
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="موضوع الرسالة"
                  value={editMessage.subject}
                  onChange={(e) => setEditMessage(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent dark:bg-gray-700 dark:text-white mb-4"
                />
                <textarea
                  placeholder="اكتب رسالتك هنا..."
                  value={editMessage.content}
                  onChange={(e) => setEditMessage(prev => ({ ...prev, content: e.target.value }))}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                disabled={sending}
              >
                إلغاء
              </button>
              <button
                onClick={handleEditMessage}
                disabled={sending || !editMessage.content.trim()}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded-lg flex items-center space-x-2"
              >
                {sending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>جاري التحديث...</span>
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4" />
                    <span>تحديث</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && messageToDelete && (
        <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    تأكيد الحذف
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    هل أنت متأكد من حذف هذه الرسالة؟
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                  {messageToDelete.content || messageToDelete.message}
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                إلغاء
              </button>
              <button
                onClick={handleDeleteMessage}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>حذف</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberMessages;
