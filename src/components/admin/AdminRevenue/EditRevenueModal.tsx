'use client';

import React from 'react';
import type { RevenueForm } from './types';
import type { User } from '@/types/models';
import RevenueFormFields from './RevenueFormFields';

type Props = {
  form: RevenueForm;
  setForm: React.Dispatch<React.SetStateAction<RevenueForm>>;
  userDisplayName: string;
  loading: boolean;
  onUpdate: () => void;
  onCancel: () => void;
};

const EditRevenueModal = ({ form, setForm, userDisplayName, loading, onUpdate, onCancel }: Props) => {
  return (
    <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-lg w-full p-6 relative animate-fade-in">
        <button onClick={onCancel} className="absolute -top-4 -right-4 bg-white border border-gray-200 rounded-full shadow p-2 text-xl text-black hover:bg-gray-100" title="إغلاق">✕</button>
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">تعديل دخل</h3>
        <RevenueFormFields
          form={form}
          setForm={setForm}
          members={[]}
          readonlyUser
          userDisplayName={userDisplayName}
        />
        <div className="mt-3 flex gap-2 justify-end">
          <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50" onClick={onUpdate} disabled={loading}>حفظ</button>
          <button className="px-4 py-2 border rounded" onClick={onCancel} disabled={loading}>إلغاء</button>
        </div>
      </div>
    </div>
  );
};

export default EditRevenueModal;