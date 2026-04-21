'use client';

import React from 'react';

interface DeleteConfirmModalProps {
  loading: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ loading, onClose, onConfirm }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
    <div className="relative z-10 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
      <div className="w-12 h-12 bg-red-600/10 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <span className="text-red-400 text-xl font-bold">!</span>
      </div>
      <h3 className="text-base font-semibold text-white mb-2">تأكيد حذف السجل</h3>
      <p className="text-sm text-slate-400 mb-6">هل أنت متأكد أنك تريد حذف هذا السجل؟ لا يمكن التراجع.</p>
      <div className="flex justify-center gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg text-sm bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 transition-colors"
        >
          إلغاء
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="px-4 py-2 rounded-lg text-sm bg-red-600 hover:bg-red-500 text-white font-medium disabled:opacity-40 transition-colors"
        >
          {loading ? 'جاري الحذف...' : 'تأكيد الحذف'}
        </button>
      </div>
    </div>
  </div>
);

export default DeleteConfirmModal;