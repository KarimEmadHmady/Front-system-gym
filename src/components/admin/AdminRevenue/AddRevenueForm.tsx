'use client';

import React from 'react';
import type { RevenueForm } from './types';
import type { User } from '@/types/models';
import RevenueFormFields from './RevenueFormFields';

type Props = {
  form: RevenueForm;
  setForm: React.Dispatch<React.SetStateAction<RevenueForm>>;
  members: User[];
  loading: boolean;
  onCreate: () => void;
};

const AddRevenueForm = ({ form, setForm, members, loading, onCreate }: Props) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">إضافة دخل</h3>
      <RevenueFormFields form={form} setForm={setForm} members={members} />
      <div className="mt-3 flex gap-2">
        <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50" onClick={onCreate} disabled={loading}>
          إنشاء
        </button>
      </div>
    </div>
  );
};

export default AddRevenueForm;