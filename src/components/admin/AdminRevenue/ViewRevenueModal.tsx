'use client';

import React from 'react';
import type { Revenue } from '@/services/revenueService';
import type { User } from '@/types/models';

type Props = {
  revenue: Revenue;
  userMap: Record<string, User>;
  onClose: () => void;
  onEdit: () => void;
};

const ViewRevenueModal = ({ revenue, userMap, onClose, onEdit }: Props) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-xl w-full mx-4 p-6 relative animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-200">💰</span>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">تفاصيل الدخل</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl">×</button>
        </div>

        <div className="text-sm">
          <div className="divide-y divide-gray-200 dark:divide-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2 text-gray-500"><span>📅</span><span>التاريخ</span></div>
              <div className="font-medium">{new Date(revenue.date).toLocaleDateString()}</div>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2 text-gray-500"><span>💰</span><span>المبلغ</span></div>
              <div className="font-semibold text-green-600 dark:text-green-400">ج.م{new Intl.NumberFormat().format(revenue.amount)}</div>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2 text-gray-500"><span>💳</span><span>طريقة الدفع</span></div>
              <div className="font-medium">{revenue.paymentMethod}</div>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2 text-gray-500"><span>🏷️</span><span>نوع المصدر</span></div>
              <div className="font-medium">{revenue.sourceType}</div>
            </div>
            <div className="px-4 py-3">
              <div className="flex items-center gap-2 text-gray-500 mb-1"><span>👤</span><span>العميل</span></div>
              <div className="font-medium">
                {revenue.userId && userMap[revenue.userId] ? (
                  <div>
                    <div>{userMap[revenue.userId].name}</div>
                    <div className="text-xs text-gray-500">{userMap[revenue.userId].phone || '-'}</div>
                  </div>
                ) : '-'}
              </div>
            </div>
            <div className="px-4 py-3">
              <div className="flex items-center gap-2 text-gray-500 mb-1"><span>📝</span><span>ملاحظات</span></div>
              <div className="font-medium whitespace-pre-wrap">{revenue.notes || '-'}</div>
            </div>
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/40">
              <div className="text-gray-500">تم الإنشاء</div>
              <div className="font-medium">{new Date(revenue.createdAt as any).toLocaleString()}</div>
            </div>
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/40">
              <div className="text-gray-500">آخر تحديث</div>
              <div className="font-medium">{new Date(revenue.updatedAt as any).toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button className="px-4 py-2 border rounded" onClick={onClose}>إغلاق</button>
          <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700" onClick={onEdit}>تعديل هذا السجل</button>
        </div>
      </div>
    </div>
  );
};

export default ViewRevenueModal;