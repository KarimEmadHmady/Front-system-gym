'use client';

import React, { useState, useEffect } from 'react';
import { messageService } from '@/services';
import { userService } from '@/services';
import { useAuth } from '@/hooks/useAuth';
import type { Message } from '@/types';
import type { User } from '@/types/models';
import { Mail } from 'lucide-react';

// Import extracted components
import MessagesHeader from './MessagesHeader';
import MessagesFilters from './MessagesFilters';
import MessageTable from './MessageTable';
import CreateMessageModal from './CreateMessageModal';
import EditMessageModal from './EditMessageModal';
import ViewMessageModal from './ViewMessageModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import { getUserName, getUserEmail, getUserPhone, formatDate } from './utils';

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

  // Filter messages
  const filteredMessages = messages.filter(message => {
    const searchLower = searchTerm.toLowerCase();
    const senderName = getUserName(message.fromUserId, members, currentUser).toLowerCase();
    const receiverName = getUserName(message.userId, members, currentUser).toLowerCase();
    const senderPhone = getUserPhone(message.fromUserId, members, currentUser).toLowerCase();
    const receiverPhone = getUserPhone(message.userId, members, currentUser).toLowerCase();
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
      <MessagesHeader onShowCreateModal={() => setShowCreateModal(true)} />

      {/* Filters */}
      <MessagesFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterStatus={filterStatus}
        onFilterChange={setFilterStatus}
      />

      {/* Messages Table */}
      <MessageTable
        filteredMessages={filteredMessages}
        currentUser={currentUser}
        getUserName={(userId) => getUserName(userId, members, currentUser)}
        getUserEmail={(userId) => getUserEmail(userId, members, currentUser)}
        getUserPhone={(userId) => getUserPhone(userId, members, currentUser)}
        formatDate={formatDate}
        onViewMessage={handleViewMessage}
        onMarkAsRead={handleMarkAsRead}
        onEditMessage={(message) => {
          setEditingMessage(message);
          setShowEditModal(true);
        }}
        onDeleteMessage={(messageId) => setShowDeleteModal(messageId)}
      />

      {filteredMessages.length === 0 && (
        <div className="text-center py-12">
          <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">لا توجد رسائل</p>
        </div>
      )}

      {/* Create Message Modal */}
      <CreateMessageModal
        showCreateModal={showCreateModal}
        newMessage={newMessage}
        members={members}
        onShowCreateModal={setShowCreateModal}
        onNewMessageChange={setNewMessage}
        onCreateMessage={handleCreateMessage}
      />

      {/* Edit Message Modal */}
      <EditMessageModal
        showEditModal={showEditModal}
        editingMessage={editingMessage}
        onShowEditModal={setShowEditModal}
        onEditingMessageChange={setEditingMessage}
        onEditMessage={handleEditMessage}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        showDeleteModal={showDeleteModal}
        onShowDeleteModal={setShowDeleteModal}
        onDeleteMessage={handleDeleteMessage}
      />

      {/* View Message Modal */}
      <ViewMessageModal
        showViewModal={showViewModal}
        getUserName={(userId) => getUserName(userId, members, currentUser)}
        getUserEmail={(userId) => getUserEmail(userId, members, currentUser)}
        formatDate={formatDate}
        onShowViewModal={setShowViewModal}
      />

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
