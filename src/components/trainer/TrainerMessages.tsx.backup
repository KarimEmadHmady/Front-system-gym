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
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Calendar,
  User as UserIcon,
  MessageSquare
} from 'lucide-react';

const TrainerMessages = () => {
  const { user: currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<User[]>([]); // أعضاء الترينر فقط
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'read' | 'unread'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [showViewModal, setShowViewModal] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [newMessage, setNewMessage] = useState({
    userId: '',
    message: '',
    subject: ''
  });

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
      
      // جلب الرسائل
      const messagesData = await messageService.getMessagesForUser(currentUser.id);
      
      // تصفية الرسائل: فقط بين الترينر وأعضاءه
      const memberIds = new Set(filteredMembers.map((m: any) => normalizeId(m._id)));
      const filteredMessages = messagesData.filter(
        (m: Message) => memberIds.has(m.userId) || memberIds.has(m.fromUserId)
      );
      
      setMessages(filteredMessages);
      setMembers(filteredMembers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getUserName = (userId: string) => {
    const user = members.find(u => u._id === userId) || (currentUser && (currentUser.id === userId ? currentUser : null));
    return user ? user.name : 'مستخدم غير معروف';
  };
  const getUserEmail = (userId: string) => {
    const user = members.find(u => u._id === userId) || (currentUser && (currentUser.id === userId ? currentUser : null));
    return user ? user.email : '';
  };
  const getUserPhone = (userId: string) => {
    const user = members.find(u => u._id === userId) || (currentUser && (currentUser.id === userId ? currentUser : null));
    return user ? ((user as any).phone || '') : '';
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

  // Message actions
  const handleCreateMessage = async () => {
    if (!newMessage.userId || !newMessage.message) return;
    if (!currentUser?.id) {
      setError('لم يتم العثور على معرف المستخدم');
      return;
    }
    try {
      await messageService.createMessage({
        userId: newMessage.userId,
        fromUserId: currentUser.id,
        message: newMessage.message,
        subject: newMessage.subject
      });
      setNewMessage({ userId: '', message: '', subject: '' });
      setShowCreateModal(false);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في إنشاء الرسالة');
    }
  };

  const handleEditMessage = async () => {
    if (!editingMessage) return;
    if (editingMessage.fromUserId !== currentUser?.id) return;
    try {
      await messageService.updateMessage(editingMessage._id, {
        content: editingMessage.message,
        subject: editingMessage.subject || ''
      });
      setEditingMessage(null);
      setShowEditModal(false);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في تعديل الرسالة');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    const msg = messages.find(m => m._id === messageId);
    if (!msg || msg.fromUserId !== currentUser?.id) return;
    try {
      await messageService.deleteMessage(messageId);
      setShowDeleteModal(null);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في حذف الرسالة');
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await messageService.markMessageAsRead(messageId);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في تحديث حالة الرسالة');
    }
  };

  const handleViewMessage = (message: Message) => {
    setShowViewModal(message);
    // إذا كانت الرسالة مرسلة للترينر وليست من إرساله هو وكانت غير مقروءة
    if (
      !message.read &&
      message.userId === currentUser?.id &&
      message.fromUserId !== currentUser?.id
    ) {
      handleMarkAsRead(message._id);
    }
  };

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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <MessageSquare className="w-8 h-8 text-gray-600" />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">رسائلي مع الأعضاء</h3>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>رسالة جديدة</span>
        </button>
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

      {/* Messages Table */}
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
                    onClick={() => handleViewMessage(message)}
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
                    {/* {!message.read && (
                      <button
                        onClick={() => handleMarkAsRead(message._id)}
                        className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 dark:hover:bg-green-900 rounded"
                        title="تحديد كمقروءة"
                      >
                        <MailOpen className="w-4 h-4" />
                      </button>
                    )} */}
                    {/* تعديل/حذف فقط للرسائل التي أرسلها الترينر */}
                    {message.fromUserId === currentUser?.id && (
                      <>
                        <button
                          onClick={() => {
                            setEditingMessage(message);
                            setShowEditModal(true);
                          }}
                          className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 rounded"
                          title="تعديل"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteModal(message._id)}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredMessages.length === 0 && (
        <div className="text-center py-12">
          <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">لا توجد رسائل</p>
        </div>
      )}

      {/* Create Message Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCreateModal(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">رسالة جديدة</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  المستلم
                </label>
                <select
                  value={newMessage.userId}
                  onChange={(e) => setNewMessage({ ...newMessage, userId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">اختر المستلم</option>
                  {members.map(user => (
                    <option key={user._id} value={user._id}>{user.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  موضوع الرسالة (اختياري)
                </label>
                <input
                  type="text"
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent dark:bg-gray-700 dark:text-white mb-4"
                  placeholder="موضوع الرسالة..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  نص الرسالة
                </label>
                <textarea
                  value={newMessage.message}
                  onChange={(e) => setNewMessage({ ...newMessage, message: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="اكتب الرسالة هنا..."
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                إلغاء
              </button>
              <button
                onClick={handleCreateMessage}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
              >
                إرسال
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Message Modal */}
      {showEditModal && editingMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowEditModal(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">تعديل الرسالة</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  موضوع الرسالة
                </label>
                <input
                  type="text"
                  value={editingMessage.subject || ''}
                  onChange={(e) => setEditingMessage({ ...editingMessage, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent dark:bg-gray-700 dark:text-white mb-4"
                  placeholder="موضوع الرسالة..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  نص الرسالة
                </label>
                <textarea
                  value={editingMessage.message}
                  onChange={(e) => setEditingMessage({ ...editingMessage, message: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                إلغاء
              </button>
              <button
                onClick={handleEditMessage}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
              >
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeleteModal(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">تأكيد الحذف</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">هل أنت متأكد من حذف هذه الرسالة؟</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleDeleteMessage(showDeleteModal)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Message Modal */}
      {showViewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowViewModal(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">تفاصيل الرسالة</h3>
              <button
                onClick={() => setShowViewModal(null)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Message Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">المرسل</h4>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{getUserName(showViewModal.fromUserId)}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{getUserEmail(showViewModal.fromUserId)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">المستلم</h4>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{getUserName(showViewModal.userId)}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{getUserEmail(showViewModal.userId)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                {showViewModal.subject && (
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">موضوع الرسالة</h4>
                )}
                {showViewModal.subject && (
                  <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg mb-4 border border-gray-200 dark:border-gray-800">
                    <p className="text-gray-900 dark:text-gray-100 font-medium">
                      {showViewModal.subject}
                    </p>
                  </div>
                )}
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">نص الرسالة</h4>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed">
                    {showViewModal.message}
                  </p>
                </div>
              </div>

              {/* Message Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">تاريخ الإرسال</h4>
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(showViewModal.date)}</span>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">حالة القراءة</h4>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    showViewModal.read 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                  }`}>
                    {showViewModal.read ? 'مقروءة' : 'غير مقروءة'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowViewModal(null)}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
          <button onClick={() => setError(null)} className="ml-2 text-red-700 hover:text-red-900">
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default TrainerMessages;


