'use client';

import React from 'react';

interface EditSessionModalProps {
  showEditModal: boolean;
  formData: any;
  onClose: () => void;
  onFormChange: (form: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const EditSessionModal: React.FC<EditSessionModalProps> = ({
  showEditModal,
  formData,
  onClose,
  onFormChange,
  onSubmit
}) => {
  if (!showEditModal) return null;

  return (
    <div className="fixed inset-0 bg-black/70 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">تعديل الحصة</h3>
          <form onSubmit={onSubmit} className="space-y-4">
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
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700"
              >
                حفظ
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditSessionModal;
