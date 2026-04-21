import React from 'react';

interface DeleteWorkoutProps {
  planId: string | null;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
}

export const DeleteWorkoutModal: React.FC<DeleteWorkoutProps> = ({ planId, onClose, onConfirm }) => {
  if (!planId) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">تأكيد الحذف</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">هل أنت متأكد من حذف هذه الخطة؟</p>
        <div className="mt-6 flex justify-end space-x-2">
          <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded" onClick={onClose}>إلغاء</button>
          <button
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
            onClick={async () => { await onConfirm(planId); onClose(); }}
          >
            حذف
          </button>
        </div>
      </div>
    </div>
  );
};

interface DeleteDietProps {
  planId: string | null;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
}

export const DeleteDietModal: React.FC<DeleteDietProps> = ({ planId, onClose, onConfirm }) => {
  if (!planId) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">تأكيد حذف الخطة الغذائية</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">هل أنت متأكد من حذف هذه الخطة الغذائية؟</p>
        <div className="mt-6 flex justify-end space-x-2">
          <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded" onClick={onClose}>إلغاء</button>
          <button
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
            onClick={async () => { await onConfirm(planId); onClose(); }}
          >
            حذف
          </button>
        </div>
      </div>
    </div>
  );
};