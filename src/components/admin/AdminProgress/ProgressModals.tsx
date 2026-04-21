'use client';

import React from 'react';
import type { ClientProgress } from '@/types/models';

// ===== Delete Confirmation Modal =====
type DeleteProps = {
  onClose: () => void;
  onConfirm: () => void;
};

export const DeleteProgressModal = ({ onClose, onConfirm }: DeleteProps) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div className="absolute inset-0 bg-black/40" onClick={onClose} />
    <div className="relative z-10 bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
      <div className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">تأكيد حذف السجل</div>
      <div className="mb-6 text-gray-700 dark:text-gray-300">هل أنت متأكد أنك تريد حذف هذا السجل؟ لا يمكن التراجع.</div>
      <div className="flex justify-center gap-3">
        <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-800">إلغاء</button>
        <button onClick={onConfirm} className="px-4 py-2 rounded bg-red-600 text-white">تأكيد الحذف</button>
      </div>
    </div>
  </div>
);

// ===== Progress Details Modal =====
type DetailsProps = {
  progress: ClientProgress;
  onClose: () => void;
};

export const ProgressDetailsModal = ({ progress, onClose }: DetailsProps) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div className="absolute inset-0 bg-black/40" onClick={onClose} />
    <div className="relative z-10 bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-lg overflow-y-auto max-h-[80vh]">
      <div className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">تفاصيل سجل التقدم</div>
      <div className="grid grid-cols-2 gap-4">
        <div><span className="font-bold">التاريخ:</span> {new Date(progress.date).toLocaleDateString()}</div>
        <div><span className="font-bold">الوزن:</span> {progress.weight ?? '-'}</div>
        <div><span className="font-bold">نسبة الدهون:</span> {progress.bodyFatPercentage ?? '-'}</div>
        <div><span className="font-bold">الكتلة العضلية:</span> {progress.muscleMass ?? '-'}</div>
        <div><span className="font-bold">مقاس الوسط:</span> {progress.waist ?? '-'}</div>
        <div><span className="font-bold">مقاس الصدر:</span> {progress.chest ?? '-'}</div>
        <div><span className="font-bold">مقاس الذراع:</span> {progress.arms ?? '-'}</div>
        <div><span className="font-bold">مقاس الرجل:</span> {progress.legs ?? '-'}</div>
        <div><span className="font-bold">تغير الوزن:</span> {progress.weightChange ?? '-'}</div>
        <div><span className="font-bold">تغير الدهون:</span> {progress.fatChange ?? '-'}</div>
        <div><span className="font-bold">تغير الكتلة العضلية:</span> {progress.muscleChange ?? '-'}</div>
        <div><span className="font-bold">الحالة العامة:</span> {progress.status ?? '-'}</div>
        <div className="col-span-2"><span className="font-bold">ملاحظات:</span> {progress.notes ?? '-'}</div>
        <div className="col-span-2"><span className="font-bold">نصيحة المدرب:</span> {progress.advice ?? '-'}</div>
        {progress.image?.url && (
          <div className="col-span-2">
            <span className="font-bold">صورة التقدم:</span>
            <div className="mt-2">
              <img src={progress.image.url} alt="صورة التقدم" className="w-64 h-64 object-cover rounded-md border" />
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-end mt-6">
        <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-800">إغلاق</button>
      </div>
    </div>
  </div>
);