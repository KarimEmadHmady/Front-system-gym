'use client';

import React from 'react';
import { Calendar, User as UserIcon } from 'lucide-react';

interface ViewMessageModalProps {
  showViewModal: any;
  getUserName: (userId: string) => string;
  getUserEmail: (userId: string) => string;
  formatDate: (date: Date | string) => string;
  onShowViewModal: (message: any) => void;
}

const ViewMessageModal: React.FC<ViewMessageModalProps> = ({
  showViewModal,
  getUserName,
  getUserEmail,
  formatDate,
  onShowViewModal
}) => {
  if (!showViewModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={() => onShowViewModal(null)} />
      <div className="relative bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">تفاصيل الرسالة</h3>
          <button
            onClick={() => onShowViewModal(null)}
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
            onClick={() => onShowViewModal(null)}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewMessageModal;
