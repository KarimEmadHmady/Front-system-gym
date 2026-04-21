'use client';

import React from 'react';

interface SessionModalProps {
  showCreateModal: boolean;
  formData: any;
  isSubmitting: boolean;
  clients: any[];
  onClose: () => void;
  onFormChange: (form: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const SessionModal: React.FC<SessionModalProps> = ({
  showCreateModal,
  formData,
  isSubmitting,
  clients,
  onClose,
  onFormChange,
  onSubmit
}) => {
  if (!showCreateModal) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">إضافة حصة جديدة</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            {/* العميل */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                العميل
              </label>
              <select
                value={formData.userId}
                onChange={(e) => onFormChange({ ...formData, userId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                <option value="">اختر العميل</option>
                {clients?.filter(u => u.role === 'member').length === 0 ? (
                  <option value="" disabled>لا يوجد عملاء متاحين</option>
                ) : (
                  clients?.filter(u => u.role === 'member').map(user => (
                    <option key={user._id} value={user._id}>{user.name}</option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                التاريخ
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => onFormChange({...formData, date: e.target.value})}
                onClick={(e) => e.currentTarget.showPicker?.()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-pointer"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  وقت البداية
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => onFormChange({...formData, startTime: e.target.value})}
                  onClick={(e) => e.currentTarget.showPicker?.()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-pointer"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  وقت النهاية
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => onFormChange({...formData, endTime: e.target.value})}
                  onClick={(e) => e.currentTarget.showPicker?.()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-pointer"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                نوع الحصة
              </label>
              <select
                value={formData.sessionType}
                onChange={(e) => onFormChange({...formData, sessionType: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="شخصية">شخصية</option>
                <option value="جماعية">جماعية</option>
                <option value="أونلاين">أونلاين</option>
                <option value="تغذية">تغذية</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                السعر
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => onFormChange({...formData, price: Number(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                الوصف
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => onFormChange({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    جاري الإضافة...
                  </>
                ) : (
                  'إضافة'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SessionModal;
