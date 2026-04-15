'use client';

import React, { useState } from 'react';
import { expenseService } from '@/services';

type ExpenseForm = {
  amount?: number;
  date?: string; // yyyy-mm-dd
  category: string;
  paidTo?: string;
  notes?: string;
};

const ManagerAddExpense: React.FC = () => {
  const [form, setForm] = useState<ExpenseForm>({ category: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const notify = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 2500);
  };

  const reset = () => {
    setForm({ category: '' });
    setFile(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.amount || !form.category) {
      setError('المبلغ والتصنيف مطلوبان');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('amount', String(form.amount));
      formData.append('category', form.category);
      if (form.date) formData.append('date', form.date);
      if (form.paidTo) formData.append('paidTo', form.paidTo);
      if (form.notes) formData.append('notes', form.notes);
      if (file) formData.append('image', file);
      await expenseService.create(formData);
      reset();
      notify('تم إضافة المصروف بنجاح');
    } catch (e: any) {
      setError(e?.message || 'فشل في إضافة المصروف');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-200">💸</span>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">إضافة مصروف</h2>
        </div>

        {error && (
          <div className="mb-3 text-sm text-red-600">{error}</div>
        )}

        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 dark:text-gray-300 mb-1">المبلغ</label>
            <input
              type="number"
              className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600"
              placeholder="0"
              value={(form.amount as any) || ''}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value === '' ? undefined : Number(e.target.value) }))}
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600 dark:text-gray-300 mb-1">التاريخ</label>
            <input
              type="date"
              className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600"
              value={form.date || ''}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600 dark:text-gray-300 mb-1">التصنيف</label>
            <input
              className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600"
              placeholder="مثال: rent"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600 dark:text-gray-300 mb-1">المدفوع له</label>
            <input
              className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600"
              placeholder="اسم الجهة"
              value={form.paidTo || ''}
              onChange={(e) => setForm((f) => ({ ...f, paidTo: e.target.value }))}
            />
          </div>

          <div className="md:col-span-2 flex flex-col">
            <label className="text-sm text-gray-600 dark:text-gray-300 mb-1">ملاحظات</label>
            <textarea
              rows={3}
              className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600"
              placeholder="اكتب أي ملاحظات"
              value={form.notes || ''}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </div>

          <div className="md:col-span-2 flex flex-col">
            <label className="text-sm text-gray-600 dark:text-gray-300 mb-1"> اضافة صورة فاتورة او مرفق (اختياري) </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            {file && (
              <img src={URL.createObjectURL(file)} alt="المعاينة" style={{ width: 80, marginTop: 6, borderRadius: 4, border: '1px solid #ccc' }} />
            )}
            {file && (
              <button type="button" className="text-xs text-red-500 mt-1" onClick={() => setFile(null)}>
                إزالة الصورة
              </button>
            )}
          </div>

          <div className="md:col-span-2 flex justify-end gap-3">
            <button type="button" className="px-4 py-2 border rounded" onClick={reset} disabled={loading}>مسح</button>
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50" disabled={loading}>
              {loading ? 'جارٍ الإضافة...' : 'إضافة مصروف'}
            </button>
          </div>
        </form>
      </div>

      {success && (
        <div className="fixed bottom-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded shadow-lg">
          {success}
        </div>
      )}
    </div>
  );
};

export default ManagerAddExpense;


