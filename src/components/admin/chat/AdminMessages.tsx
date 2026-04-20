'use client';

import React, { useState, useEffect } from 'react';
import { messageService } from '@/services';
import { userService } from '@/services';
import { useAuth } from '@/hooks/useAuth';
import type { Message } from '@/types';
import type { User } from '@/types/models';
import * as XLSX from 'xlsx';
import { 
  Plus, 
  Download,
  MessageSquare
} from 'lucide-react';
import AdminChatBubble from './AdminChatBubble';
import AdminChatInterface from './AdminChatInterface';
import VideoTutorial from '../../VideoTutorial';
import MessageStats from './components/MessageStats';
import MessageFilters from './components/MessageFilters';
import MessageTable from './components/MessageTable';
import MessageModals from './components/MessageModals';

const AdminMessages = () => {
  const { user: currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'read' | 'unread'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
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
  const [showChatBubble, setShowChatBubble] = useState<{user1: string, user2: string} | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'chat'>('chat');

  // Helper functions
  const getUserName = (userId: string) => {
    const user = users.find(u => u._id === userId);
    return user ? user.name : 'مستخدم غير معروف';
  };

  const getUserEmail = (userId: string) => {
    const user = users.find(u => u._id === userId);
    return user ? user.email : '';
  };

  const getUserPhone = (userId: string) => {
    const user = users.find(u => u._id === userId);
    return user ? (user.phone || '') : '';
  };

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
      setUsers(Array.isArray(usersData.data) ? usersData.data as User[] : Array.isArray(usersData) ? usersData as User[] : []);
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

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const pageCount = Math.max(1, Math.ceil(filteredMessages.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredMessages.length);
  const paginatedMessages = filteredMessages.slice(startIndex, endIndex);

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

  // تصدير البيانات إلى Excel
  const handleExportToExcel = () => {
    const exportData = filteredMessages.map((message) => {
      const dateObj = new Date(message.date);
      return {
        'المرسل': getUserName(message.fromUserId),
        'إيميل المرسل': getUserEmail(message.fromUserId),
        'هاتف المرسل': getUserPhone(message.fromUserId),
        'المستلم': getUserName(message.userId),
        'إيميل المستلم': getUserEmail(message.userId),
        'هاتف المستلم': getUserPhone(message.userId),
        'الموضوع': message.subject || '-',
        'نص الرسالة': message.message,
        'التاريخ': dateObj.toLocaleDateString('en-GB'),
        'الساعة': dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        'الحالة': message.read ? 'مقروءة' : 'غير مقروءة'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'الرسائل');
    
    // تصدير الملف
    const fileName = `الرسائل_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
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
       <VideoTutorial 
        videoId="KM1KmXm6jJ8"
        title=" تواصل سهل بين المدرب والعميل في لحظة " 
         position="bottom-right"
        buttonText="شرح"
       />
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <div className="flex items-center space-x-3">
          <MessageSquare className="w-8 h-8 text-gray-600" />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة الرسائل</h3>
        </div>
        <div className="flex items-center space-x-1 md:space-x-2">
          <button
            onClick={() => setViewMode(viewMode === 'table' ? 'chat' : 'table')}
            className="flex items-center space-x-1 md:space-x-2 px-2 md:px-4 py-1 md:py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-xs md:text-sm font-medium transition-colors"
          >
            <MessageSquare className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">{viewMode === 'table' ? 'عرض الشات' : 'عرض تفاصيل الرسائل'}</span>
            <span className="sm:hidden">{viewMode === 'table' ? 'شات' : 'جدول'}</span>
          </button>
          <button
            onClick={handleExportToExcel}
            disabled={filteredMessages.length === 0}
            className="flex items-center space-x-1 md:space-x-2 px-2 md:px-4 py-1 md:py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg text-xs md:text-sm font-medium transition-colors"
          >
            <Download className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">تصدير Excel</span>
            <span className="sm:hidden">Excel</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-1 md:space-x-2 px-2 md:px-4 py-1 md:py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-xs md:text-sm font-medium transition-colors"
          >
            <Plus className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">رسالة جديدة</span>
            <span className="sm:hidden">رسالة</span>
          </button>
        </div>
      </div>

      <MessageStats messages={messages} />

      {/* Show Chat Interface or Table */}
      {viewMode === 'chat' ? (
        <AdminChatInterface />
      ) : (
        <>
          <MessageFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterStatus={filterStatus}
            onFilterChange={setFilterStatus}
          />

          <MessageTable
            paginatedMessages={paginatedMessages}
            users={users}
            getUserName={getUserName}
            getUserEmail={getUserEmail}
            getUserPhone={getUserPhone}
            formatDate={formatDate}
            onMarkAsRead={handleMarkAsRead}
            onEditMessage={(message) => {
              setEditingMessage(message);
              setShowEditModal(true);
            }}
            onDeleteMessage={setShowDeleteModal}
            onViewMessage={handleViewMessage}
            onShowChatBubble={(user1, user2) => setShowChatBubble({ user1, user2 })}
          />

          {filteredMessages.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 text-sm text-gray-700 dark:text-gray-300">
              <div>
                Showing {startIndex + 1} to {endIndex} of {filteredMessages.length} results
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1 rounded border border-gray-300 dark:border-gray-700 disabled:opacity-50"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span>
                  Page {currentPage} of {pageCount}
                </span>
                <button
                  className="px-3 py-1 rounded border border-gray-300 dark:border-gray-700 disabled:opacity-50"
                  onClick={() => setCurrentPage(p => Math.min(pageCount, p + 1))}
                  disabled={currentPage === pageCount}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {filteredMessages.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">No messages</p>
            </div>
          )}
        </>
      )}

      <MessageModals
        showCreateModal={showCreateModal}
        showEditModal={showEditModal}
        showDeleteModal={showDeleteModal}
        showViewModal={showViewModal}
        editingMessage={editingMessage}
        newMessage={newMessage}
        users={users}
        getUserName={getUserName}
        getUserEmail={getUserEmail}
        formatDate={formatDate}
        onCloseCreateModal={() => setShowCreateModal(false)}
        onCloseEditModal={() => setShowEditModal(false)}
        onCloseDeleteModal={() => setShowDeleteModal(null)}
        onCloseViewModal={() => setShowViewModal(null)}
        onCreateMessage={handleCreateMessage}
        onEditMessage={handleEditMessage}
        onDeleteMessage={() => handleDeleteMessage(showDeleteModal!)}
        onNewMessageChange={setNewMessage}
        onEditingMessageChange={setEditingMessage}
      />

      {showChatBubble && (
        <AdminChatBubble
          user1={showChatBubble.user1}
          user2={showChatBubble.user2}
          messages={messages}
          users={users}
          currentUser={currentUser ? { ...currentUser, _id: (currentUser as any).id || (currentUser as any)._id } : null}
          onClose={() => setShowChatBubble(null)}
        />
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

export default AdminMessages;


