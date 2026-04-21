'use client';

import React from 'react';
import type { RevenueForm } from './types';
import type { User } from '@/types/models';

type Props = {
  form: RevenueForm;
  setForm: React.Dispatch<React.SetStateAction<RevenueForm>>;
  members: User[];
  readonlyUser?: boolean;
  userDisplayName?: string;
};

const RevenueFormFields = ({ form, setForm, members, readonlyUser = false, userDisplayName }: Props) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <input
        className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600"
        type="number"
        placeholder="المبلغ"
        value={(form.amount as any) || ''}
        onChange={e => setForm(f => ({ ...f, amount: e.target.value === '' ? undefined : Number(e.target.value) }))}
      />
      <input
        className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600 cursor-pointer"
        type="date"
        value={form.date || ''}
        onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
        onClick={e => (e.currentTarget as HTMLInputElement).showPicker?.()}
      />
      <select className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600" value={form.sourceType} onChange={e => setForm(f => ({ ...f, sourceType: e.target.value as any }))}>
        <option value="subscription">اشتراك</option>
        <option value="purchase">شراء</option>
        <option value="invoice">فاتورة</option>
        <option value="other">أخرى</option>
      </select>
      <select className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600" value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value as any }))}>
        <option value="cash">نقدي</option>
        <option value="card">بطاقة</option>
        <option value="transfer">تحويل</option>
        <option value="bank_transfer">حوالة بنكية</option>
        <option value="other">أخرى</option>
      </select>
      {readonlyUser ? (
        <input
          type="text"
          className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600 bg-gray-100 text-gray-700"
          value={userDisplayName || form.userId || ''}
          disabled
          readOnly
        />
      ) : (
        <select className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600" value={form.userId || ''} onChange={e => setForm(f => ({ ...f, userId: e.target.value }))}>
          <option value="">اختر عميلاً (اختياري)</option>
          {members.map(u => (
            <option key={u._id} value={u._id}>{u.name}{u.phone ? ` - ${u.phone}` : ''}</option>
          ))}
        </select>
      )}
      <input
        className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600"
        placeholder="ملاحظات"
        value={form.notes || ''}
        onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
      />
    </div>
  );
};

export default RevenueFormFields;