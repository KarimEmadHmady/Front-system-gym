import React from 'react';

interface OfflineAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OfflineAlertModal: React.FC<OfflineAlertModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-sm p-6 z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xl">📱</div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">حفظ أوفلاين</h4>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
          تم حفظ الدفعة مؤقتًا أوفلاين، وسيتم مزامنتها تلقائيًا عند عودة الاتصال بالإنترنت.
        </p>
        <div className="flex items-center justify-end gap-2">
          <button 
            onClick={onClose} 
            className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-700 text-white"
          >
            موافق
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfflineAlertModal;
