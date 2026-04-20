import React from 'react';
import { Calendar, User as UserIcon } from 'lucide-react';
import type { Message } from '@/types';
import type { User } from '@/types/models';

interface MessageModalsProps {
  showCreateModal: boolean;
  showEditModal: boolean;
  showDeleteModal: string | null;
  showViewModal: Message | null;
  editingMessage: Message | null;
  newMessage: { userId: string; message: string; subject: string };
  users: User[];
  getUserName: (userId: string) => string;
  getUserEmail: (userId: string) => string;
  formatDate: (date: Date | string) => string;
  onCloseCreateModal: () => void;
  onCloseEditModal: () => void;
  onCloseDeleteModal: () => void;
  onCloseViewModal: () => void;
  onCreateMessage: () => void;
  onEditMessage: () => void;
  onDeleteMessage: () => void;
  onNewMessageChange: (message: { userId: string; message: string; subject: string }) => void;
  onEditingMessageChange: (message: Message) => void;
}

const MessageModals: React.FC<MessageModalsProps> = ({
  showCreateModal,
  showEditModal,
  showDeleteModal,
  showViewModal,
  editingMessage,
  newMessage,
  users,
  getUserName,
  getUserEmail,
  formatDate,
  onCloseCreateModal,
  onCloseEditModal,
  onCloseDeleteModal,
  onCloseViewModal,
  onCreateMessage,
  onEditMessage,
  onDeleteMessage,
  onNewMessageChange,
  onEditingMessageChange,
}) => {
  return (
    <>
      {/* Create Message Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={onCloseCreateModal} />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <button
              onClick={onCloseCreateModal}
              className="absolute top-3 left-3 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">رسالة جديدة</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  المستلم
                </label>
                <select
                  value={newMessage.userId}
                  onChange={(e) => onNewMessageChange({ ...newMessage, userId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">اختر المستلم</option>
                  {users.map(user => (
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
                  onChange={(e) => onNewMessageChange({ ...newMessage, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent dark:bg-gray-700 dark:text-white mb-4"
                  placeholder="عنوان الرسالة"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  نص الرسالة
                </label>
                <textarea
                  value={newMessage.message}
                  onChange={(e) => onNewMessageChange({ ...newMessage, message: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="اكتب رسالتك هنا..."
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={onCloseCreateModal}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                الغاء
              </button>
              <button
                onClick={onCreateMessage}
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
          <div className="absolute inset-0 bg-black/50" onClick={onCloseEditModal} />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <button
              onClick={onCloseEditModal}
              className="absolute top-3 left-3 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">تعديل الرسالة</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  موضوع الرسالة
                </label>
                <input
                  type="text"
                  value={editingMessage.subject || ''}
                  onChange={(e) => onEditingMessageChange({ ...editingMessage, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent dark:bg-gray-700 dark:text-white mb-4"
                  placeholder="عنوان الرسالة..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  نص الرسالة
                </label>
                <textarea
                  value={editingMessage.message}
                  onChange={(e) => onEditingMessageChange({ ...editingMessage, message: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={onCloseEditModal}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                الغاء
              </button>
              <button
                onClick={onEditMessage}
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
          <div className="absolute inset-0 bg-black/50" onClick={onCloseDeleteModal} />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">تأكيد الحذف</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">هل أنت متأكد من حذف هذه الرسالة؟</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={onCloseDeleteModal}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={onDeleteMessage}
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
          <div className="absolute inset-0 bg-black/50" onClick={onCloseViewModal} />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">تفاصيل الرسالة</h3>
              <button
                onClick={onCloseViewModal}
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
                onClick={onCloseViewModal}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MessageModals;
