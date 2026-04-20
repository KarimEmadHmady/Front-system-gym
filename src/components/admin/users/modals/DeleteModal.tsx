import React from 'react';
import type { User as UserModel } from '@/types/models';
import type { DeleteModalProps } from './types';

export const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  deleteType,
  confirmDelete,
  user,
}) => {
  if (!isOpen) return null;

  const getDeleteTypeText = () => {
    switch (deleteType) {
      case 'soft':
        return {
          title: 'Deactivate User',
          description: 'This will mark the user as inactive but keep their data. They can be reactivated later.',
          buttonText: 'Deactivate',
          buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
          icon: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zM12 8a1 1 0 012 0v4a1 1 0 11-2 0V8z',
        };
      case 'hard':
        return {
          title: 'Delete User Permanently',
          description: 'This will permanently delete the user and all their data. This action cannot be undone.',
          buttonText: 'Delete Permanently',
          buttonColor: 'bg-red-600 hover:bg-red-700',
          icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
        };
      default:
        return {
          title: 'Delete User',
          description: 'Are you sure you want to perform this action?',
          buttonText: 'Confirm',
          buttonColor: 'bg-gray-600 hover:bg-gray-700',
          icon: 'M12 9v2m0 4h.01',
        };
    }
  };

  const deleteTypeInfo = getDeleteTypeText();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6 z-10">
        <button
          onClick={onClose}
          className="absolute top-3 left-3 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="flex items-start gap-3 mb-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            deleteType === 'hard' 
              ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-200'
              : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-200'
          }`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d={deleteTypeInfo.icon} />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {deleteTypeInfo.title}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              {deleteTypeInfo.description}
            </p>
            {user && (
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded p-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user.email}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            className={`px-4 py-2 text-white rounded transition-colors ${deleteTypeInfo.buttonColor}`}
          >
            {deleteTypeInfo.buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};
