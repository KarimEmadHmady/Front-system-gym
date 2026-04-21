'use client';

import React, { useState, useEffect } from 'react';
import { messageService } from '@/services';
import { userService } from '@/services';
import { useAuth } from '@/hooks/useAuth';
import type { Message } from '@/types';
import type { User } from '@/types/models';

// Import extracted components
import MessagesHeader from './MessagesHeader';
import MessagesFilters from './MessagesFilters';
import MessageCard from './MessageCard';
import MessageViewModal from './MessageViewModal';
import SendMessageModal from './SendMessageModal';
import EditMessageModal from './EditMessageModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import { getUserName, getUserEmail, getUserPhone, formatDate } from './utils';

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
      setMessages(prev => 
        prev.map(msg => 
          msg._id === messageId ? { ...msg, read: true } : msg
        )
      );
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

  // Filter messages
  const filteredMessages = messages.filter(message => {
    const searchLower = searchTerm.toLowerCase();
    const senderName = getUserName(message.fromUserId, trainer, currentUser).toLowerCase();
    const receiverName = getUserName(message.userId, trainer, currentUser).toLowerCase();
    const senderPhone = getUserPhone(message.fromUserId, trainer, currentUser).toLowerCase();
    const receiverPhone = getUserPhone(message.userId, trainer, currentUser).toLowerCase();
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
      <MessagesHeader
        trainer={trainer}
        onShowSendModal={() => setShowSendModal(true)}
      />

      {/* Filters */}
      <MessagesFilters
        searchTerm={searchTerm}
        filterStatus={filterStatus}
        onSearchChange={setSearchTerm}
        onFilterChange={setFilterStatus}
      />

      {/* Messages Cards */}
      <div className="space-y-4">
        {filteredMessages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">لا توجد رسائل</p>
          </div>
        )}
        {filteredMessages.map((message) => (
          <MessageCard
            key={message._id}
            message={message}
            currentUser={currentUser}
            trainer={trainer}
            getUserName={(userId) => getUserName(userId, trainer, currentUser)}
            getUserEmail={(userId) => getUserEmail(userId, trainer, currentUser)}
            getUserPhone={(userId) => getUserPhone(userId, trainer, currentUser)}
            formatDate={formatDate}
            onViewMessage={handleViewMessage}
            onEditMessage={openEditModal}
            onDeleteMessage={openDeleteConfirm}
          />
        ))}
      </div>

      {/* Message View Popup */}
      {showMessagePopup && selectedMessage && (
        <MessageViewModal
          showMessage={showMessagePopup}
          selectedMessage={selectedMessage}
          trainer={trainer}
          getUserName={(userId) => getUserName(userId, trainer, currentUser)}
          formatDate={formatDate}
          onClose={() => setShowMessagePopup(false)}
          onEditMessage={() => {
            setShowMessagePopup(false);
            openEditModal(selectedMessage);
          }}
        />
      )}

      {/* Send Message Modal */}
      {showSendModal && (
        <SendMessageModal
          showSendModal={showSendModal}
          trainer={trainer}
          newMessage={newMessage}
          sending={sending}
          onClose={() => setShowSendModal(false)}
          onMessageChange={setNewMessage}
          onSendMessage={handleSendMessage}
        />
      )}

      {/* Edit Message Modal */}
      {showEditModal && selectedMessage && (
        <EditMessageModal
          showEditModal={showEditModal}
          selectedMessage={selectedMessage}
          editMessage={editMessage}
          sending={sending}
          onClose={() => setShowEditModal(false)}
          onMessageChange={setEditMessage}
          onUpdateMessage={handleEditMessage}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && messageToDelete && (
        <DeleteConfirmModal
          showDeleteConfirm={showDeleteConfirm}
          messageToDelete={messageToDelete}
          onClose={() => setShowDeleteConfirm(false)}
          onDeleteMessage={handleDeleteMessage}
        />
      )}
    </div>
  );
};

export default MemberMessages;
