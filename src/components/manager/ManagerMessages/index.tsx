'use client';

import React, { useState, useEffect } from 'react';
import { messageService } from '@/services';
import { userService } from '@/services';
import { useAuth } from '@/hooks/useAuth';
import type { Message } from '@/types';
import type { User } from '@/types/models';
import { Mail } from 'lucide-react';

// Import extracted components
import MessageHeader from './MessageHeader';
import MessageStats from './MessageStats';
import MessageFilters from './MessageFilters';
import MessageTable from './MessageTable';
import CreateMessageModal from './CreateMessageModal';
import EditMessageModal from './EditMessageModal';
import DeleteMessageModal from './DeleteMessageModal';
import ViewMessageModal from './ViewMessageModal';
import { setUsersCache, getUserName, getUserEmail, getUserPhone } from './userUtils';

const ManagerMessages = () => {
  const { user: currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
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

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [messagesData, usersData] = await Promise.all([
        messageService.getAllMessages(),
        userService.getAll()
      ]);
      setMessages(messagesData);
      const usersArray = Array.isArray(usersData.data) ? usersData.data as User[] : Array.isArray(usersData) ? usersData as User[] : [];
      setUsers(usersArray);
      setUsersCache(usersArray);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  // Filter messages
  const filteredMessages = messages.filter(message => {
    // البحث عن شخص معين (بالاسم أو رقم الهاتف)
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

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      {/* Header */}
      <MessageHeader onCreateMessage={() => setShowCreateModal(true)} />

      {/* Stats */}
      <MessageStats messages={messages} />

      {/* Filters */}
      <MessageFilters
        searchTerm={searchTerm}
        filterStatus={filterStatus}
        onSearchChange={setSearchTerm}
        onFilterChange={setFilterStatus}
      />

      {/* Messages Table */}
      <MessageTable
        filteredMessages={filteredMessages}
        getUserName={getUserName}
        getUserEmail={getUserEmail}
        formatDate={formatDate}
        onViewMessage={handleViewMessage}
        onMarkAsRead={handleMarkAsRead}
        onEditMessage={(message) => {
          setEditingMessage(message);
          setShowEditModal(true);
        }}
        onDeleteMessage={setShowDeleteModal}
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
        users={users}
        newMessage={newMessage}
        onClose={() => setShowCreateModal(false)}
        onUserIdChange={(userId) => setNewMessage({ ...newMessage, userId })}
        onSubjectChange={(subject) => setNewMessage({ ...newMessage, subject })}
        onMessageChange={(message) => setNewMessage({ ...newMessage, message })}
        onCreateMessage={handleCreateMessage}
      />

      {/* Edit Message Modal */}
      <EditMessageModal
        showEditModal={showEditModal}
        editingMessage={editingMessage}
        onClose={() => setShowEditModal(false)}
        onSubjectChange={(subject) => setEditingMessage({ ...editingMessage!, subject })}
        onMessageChange={(message) => setEditingMessage({ ...editingMessage!, message })}
        onUpdateMessage={handleEditMessage}
      />

      {/* Delete Confirmation Modal */}
      <DeleteMessageModal
        showDeleteModal={showDeleteModal}
        onClose={() => setShowDeleteModal(null)}
        onConfirmDelete={() => {
          if (showDeleteModal) {
            handleDeleteMessage(showDeleteModal);
          }
        }}
      />

      {/* View Message Modal */}
      <ViewMessageModal
        showViewModal={showViewModal}
        onClose={() => setShowViewModal(null)}
        getUserName={getUserName}
        getUserEmail={getUserEmail}
        formatDate={formatDate}
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

export default ManagerMessages;
