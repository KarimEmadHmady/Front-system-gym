'use client';

import React from 'react';
import type { SessionFormData } from './types';
import type { User } from '@/types/models';

type Props = {
  formData: SessionFormData;
  setFormData: React.Dispatch<React.SetStateAction<SessionFormData>>;
  // create-only props
  isCreate?: boolean;
  trainers?: User[];
  trainersLoading?: boolean;
  trainerClients?: User[];
  clientsLoading?: boolean;
  onTrainerChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

const SessionFormFields = ({
  formData,
  setFormData,
  isCreate = false,
  trainers = [],
  trainersLoading = false,
  trainerClients = [],
  clientsLoading = false,
  onTrainerChange,
}: Props) => {
  return (
    <div className="space-y-4">
      {/* Trainer + Client selects — create only */}
      {isCreate && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المدرب</label>
            {trainersLoading ? (
              <div className="text-gray-600">جاري تحميل المدربين...</div>
            ) : (
              <select
                value={formData.trainerId}
                onChange={onTrainerChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                <option value="">اختر المدرب</option>
                {trainers.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
            )}
          </div>

          {formData.trainerId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المتدرب</label>
              {clientsLoading ? (
                <div className="text-gray-600">جاري تحميل المتدربين...</div>
              ) : trainerClients.length === 0 ? (
                <div className="text-gray-500">لا يوجد متدربين لهذا المدرب</div>
              ) : (
                <select
                  value={formData.userId}
                  onChange={e => setFormData(f => ({ ...f, userId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                >
                  <option value="">اختر المتدرب</option>
                  {trainerClients.filter(u => u.role === 'member').map(u => (
                    <option key={u._id} value={u._id}>{u.name}</option>
                  ))}
                </select>
              )}
            </div>
          )}
        </>
      )}

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">التاريخ</label>
        <input
          type="date"
          value={formData.date}
          onChange={e => setFormData(f => ({ ...f, date: e.target.value }))}
          onClick={e => e.currentTarget.showPicker?.()}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-pointer"
          required
        />
      </div>

      {/* Start / End Time */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">وقت البداية</label>
          <input
            type="time"
            value={formData.startTime}
            onChange={e => setFormData(f => ({ ...f, startTime: e.target.value }))}
            onClick={e => e.currentTarget.showPicker?.()}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-pointer"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">وقت النهاية</label>
          <input
            type="time"
            value={formData.endTime}
            onChange={e => setFormData(f => ({ ...f, endTime: e.target.value }))}
            onClick={e => e.currentTarget.showPicker?.()}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-pointer"
            required
          />
        </div>
      </div>

      {/* Session Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نوع الحصة</label>
        <select
          value={formData.sessionType}
          onChange={e => setFormData(f => ({ ...f, sessionType: e.target.value as any }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="شخصية">شخصية</option>
          <option value="جماعية">جماعية</option>
          <option value="أونلاين">أونلاين</option>
          <option value="تغذية">تغذية</option>
        </select>
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">السعر</label>
        <input
          type="number"
          value={formData.price}
          onChange={e => setFormData(f => ({ ...f, price: Number(e.target.value) }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الوصف</label>
        <textarea
          value={formData.description}
          onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          rows={3}
        />
      </div>
    </div>
  );
};

export default SessionFormFields;