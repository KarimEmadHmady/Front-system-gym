'use client';

import React from 'react';
import type { Expense } from '@/types';

interface ExpenseViewModalProps {
  viewOpen: boolean;
  viewExpense: Expense | null;
  setViewOpen: (open: boolean) => void;
  fillForEdit: (id: string) => void;
}

const ExpenseViewModal: React.FC<ExpenseViewModalProps> = ({
  viewOpen,
  viewExpense,
  setViewOpen,
  fillForEdit,
}) => {
  if (!viewOpen || !viewExpense) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-xl w-full mx-4 p-6 relative animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-200">*</span>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">تفاصيل المصروف</h2>
          </div>
          <button onClick={() => setViewOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl">×</button>
        </div>

        {/* Body */}
        <div className="text-sm">
          <div className="divide-y divide-gray-200 dark:divide-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2 text-gray-500">
                <span>التاريخ</span>
              </div>
              <div className="font-medium">{new Date(viewExpense.date).toLocaleDateString()}</div>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2 text-gray-500">
                <span>الفئة</span>
              </div>
              <div className="font-medium">{viewExpense.category}</div>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2 text-gray-500">
                <span>المبلغ</span>
              </div>
              <div className="font-semibold text-red-600 dark:text-red-400">EGP{new Intl.NumberFormat().format(viewExpense.amount)}</div>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2 text-gray-500">
                <span>المدفوع لـ</span>
              </div>
              <div className="font-medium">{viewExpense.paidTo || '-'}</div>
            </div>
            <div className="px-4 py-3">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <span>ملاحظات</span>
              </div>
              <div className="font-medium whitespace-pre-wrap">{viewExpense.notes || '-'}</div>
            </div>
            {(viewExpense as any)?.imageUrl && (
              <div style={{ textAlign: "center", margin: "12px 0" }}>
                <img src={(viewExpense as any).imageUrl} alt="صورة المصروف" style={{ maxWidth: 160, maxHeight: 120, borderRadius: 8, border: '1px solid #ddd' }} />
              </div>
            )}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/40">
              <div className="text-gray-500">تاريخ الإنشاء</div>
              <div className="font-medium">{new Date(viewExpense.createdAt as any).toLocaleString()}</div>
            </div>
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/40">
              <div className="text-gray-500">تاريخ التحديث</div>
              <div className="font-medium">{new Date(viewExpense.updatedAt as any).toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 mt-6">
          <button className="px-4 py-2 border rounded" onClick={() => setViewOpen(false)}>إغلاق</button>
          <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700" onClick={() => fillForEdit(viewExpense._id)}>تعديل هذا المصروف</button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseViewModal;
