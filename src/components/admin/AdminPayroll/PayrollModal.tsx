import React from 'react';
import type { Payroll } from '@/services/payrollService';
import type { User } from '@/types/models';

interface PayrollModalProps {
  viewOpen: boolean;
  viewDoc: Payroll | null;
  userMap: Record<string, User>;
  onSetViewOpen: (open: boolean) => void;
  onFillForEdit: () => void;
}

const PayrollModal: React.FC<PayrollModalProps> = ({
  viewOpen,
  viewDoc,
  userMap,
  onSetViewOpen,
  onFillForEdit
}) => {
  if (!viewOpen || !viewDoc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-xl w-full mx-4 p-6 relative animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50 text-gray-600 dark:bg-gray-900/30 dark:text-gray-200">🧾</span>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">تفاصيل قيد الرواتب</h2>
          </div>
          <button 
            onClick={() => onSetViewOpen(false)} 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="text-sm">
          <div className="divide-y divide-gray-200 dark:divide-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2 text-gray-500">
                <span>👤</span>
                <span>الموظف</span>
              </div>
              <div className="font-medium">
                {userMap[viewDoc.employeeId]?.name || viewDoc.employeeId}
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2 text-gray-500">
                <span>💰</span>
                <span>الراتب</span>
              </div>
              <div className="font-semibold text-green-700 dark:text-green-400">
                ج.م{new Intl.NumberFormat().format(viewDoc.salaryAmount)}
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2 text-gray-500">
                <span>📅</span>
                <span>التاريخ</span>
              </div>
              <div className="font-medium">
                {new Date(viewDoc.paymentDate).toLocaleDateString()}
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2 text-gray-500">
                <span>🎁</span>
                <span>المكافآت</span>
              </div>
              <div className="font-medium">{viewDoc.bonuses ?? '-'}</div>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2 text-gray-500">
                <span>➖</span>
                <span>الخصومات</span>
              </div>
              <div className="font-medium">{viewDoc.deductions ?? '-'}</div>
            </div>
            <div className="px-4 py-3">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <span>📝</span>
                <span>ملاحظات</span>
              </div>
              <div className="font-medium whitespace-pre-wrap">
                {viewDoc.notes || '-'}
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/40">
              <div className="text-gray-500">تم الإنشاء</div>
              <div className="font-medium">
                {viewDoc.createdAt ? new Date(viewDoc.createdAt as any).toLocaleString() : '-'}
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/40">
              <div className="text-gray-500">آخر تحديث</div>
              <div className="font-medium">
                {viewDoc.updatedAt ? new Date(viewDoc.updatedAt as any).toLocaleString() : '-'}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 mt-6">
          <button 
            className="px-4 py-2 border rounded" 
            onClick={() => onSetViewOpen(false)}
          >
            إغلاق
          </button>
          <button 
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700" 
            onClick={onFillForEdit}
          >
            تعديل هذا القيد
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayrollModal;
