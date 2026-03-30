'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { revenueService, userService } from '@/services';
import type { User } from '@/types/models';

type RevenueForm = {
  amount?: number;
  date?: string; // yyyy-mm-dd
  paymentMethod?: 'cash' | 'card' | 'transfer' | 'bank_transfer' | 'other';
  sourceType?: 'subscription' | 'purchase' | 'invoice' | 'other';
  userId?: string;
  notes?: string;
};

const ManagerAddRevenue: React.FC = () => {
  const [form, setForm] = useState<RevenueForm>({ paymentMethod: 'cash', sourceType: 'other' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const userOptions = useMemo(() => users.map(u => ({ value: u._id, label: `${u.name}${u.phone ? ` - ${u.phone}` : ''}` })), [users]);

  useEffect(() => {
    (async () => {
      try {
        const res = await userService.getUsers({ limit: 200 });
        const list = Array.isArray(res) ? res : [];
        setUsers(list);
      } catch {
        // ignore
      }
    })();
  }, []);

  const notify = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(null), 2500); };

  const reset = () => setForm({ paymentMethod: 'cash', sourceType: 'other' });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.amount || !form.sourceType) {
      setError('المبلغ ونوع المصدر مطلوبان');
      return;
    }
    setLoading(true);
    try {
      const payload: any = {
        amount: Number(form.amount),
        sourceType: form.sourceType,
        paymentMethod: form.paymentMethod || 'cash',
        userId: form.userId || undefined,
        notes: form.notes || undefined,
      };
      if (form.date) payload.date = form.date;
      await revenueService.create(payload);
      reset();
      notify('تم إضافة الدخل بنجاح');
    } catch (e: any) {
      setError(e?.message || 'فشل في إضافة الدخل');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-200">💰</span>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">إضافة دخل</h2>
        </div>

        {error && (<div className="mb-3 text-sm text-red-600">{error}</div>)}

        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 dark:text-gray-300 mb-1">المبلغ</label>
            <input type="number" className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600" placeholder="0" value={(form.amount as any) || ''} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value === '' ? undefined : Number(e.target.value) }))} required />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600 dark:text-gray-300 mb-1">التاريخ</label>
            <input type="date" className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600" value={form.date || ''} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600 dark:text-gray-300 mb-1">نوع المصدر</label>
            <select className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600" value={form.sourceType} onChange={(e) => setForm((f) => ({ ...f, sourceType: e.target.value as any }))} required>
              <option value="subscription">اشتراك</option>
              <option value="purchase">شراء</option>
              <option value="invoice">فاتورة</option>
              <option value="other">أخرى</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600 dark:text-gray-300 mb-1">طريقة الدفع</label>
            <select className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600" value={form.paymentMethod} onChange={(e) => setForm((f) => ({ ...f, paymentMethod: e.target.value as any }))}>
              <option value="cash">نقدي</option>
              <option value="card">بطاقة</option>
              <option value="transfer">تحويل</option>
              <option value="bank_transfer">حوالة بنكية</option>
              <option value="other">أخرى</option>
            </select>
          </div>

          <div className="flex flex-col md:col-span-2">
            <label className="text-sm text-gray-600 dark:text-gray-300 mb-1">العميل (اختياري)</label>
            <select className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600" value={form.userId || ''} onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))}>
              <option value="">بدون عميل</option>
              {userOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 flex flex-col">
            <label className="text-sm text-gray-600 dark:text-gray-300 mb-1">ملاحظات</label>
            <textarea rows={3} className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600" placeholder="اكتب أي ملاحظات" value={form.notes || ''} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
          </div>

          <div className="md:col-span-2 flex justify-end gap-3">
            <button type="button" className="px-4 py-2 border rounded" onClick={reset} disabled={loading}>مسح</button>
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50" disabled={loading}>{loading ? 'جارٍ الإضافة...' : 'إضافة دخل'}</button>
          </div>
        </form>
      </div>

      {success && (
        <div className="fixed bottom-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded shadow-lg">{success}</div>
      )}
    </div>
  );
};

export default ManagerAddRevenue;


