'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { expenseService } from '@/services';
import type { Expense } from '@/types';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import * as XLSX from 'xlsx';
import CustomAlert from '@/components/ui/CustomAlert';
import { useCustomAlert } from '@/hooks/useCustomAlert';

type SortOrder = 'asc' | 'desc';

const AdminExpenses: React.FC = () => {
  const { alertState, showSuccess, showError, showWarning, hideAlert } = useCustomAlert();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // List state
  const [items, setItems] = useState<Expense[]>([]);
  const [count, setCount] = useState(0);

  // Filters
  const [category, setCategory] = useState('');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [sort, setSort] = useState<SortOrder>('desc');
  const [limit, setLimit] = useState<number>(10);
  const [skip, setSkip] = useState<number>(0);

  // Create/Update state
  type ExpenseForm = {
    amount?: number;
    date?: string; // ISO date string yyyy-mm-dd
    category: string;
    paidTo?: string;
    notes?: string;
    imageUrl?: string; // Added for image preview/upload
  };

  const [form, setForm] = useState<ExpenseForm>({
    amount: undefined,
    date: undefined,
    category: '',
    paidTo: '',
    notes: '',
    imageUrl: '',
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Summary state
  const [summary, setSummary] = useState<{
    range: { from: string | null; to: string | null };
    totals: { expense: number };
    monthly: Array<{ year: number; month: number; expense: number }>;
  } | null>(null);

  // Delete confirmation & notifications
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const notify = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 2500);
  };

  // View modal state
  const [viewOpen, setViewOpen] = useState(false);
  const [viewExpense, setViewExpense] = useState<Expense | null>(null);

  // Keep server-side pagination stable. Some backends may filter by a different date field than expected.
  // We'll apply date-range filtering as a client-side fallback on the current page.
  const listParams = useMemo(() => ({
    category: category || undefined,
    minAmount: minAmount ? Number(minAmount) : undefined,
    maxAmount: maxAmount ? Number(maxAmount) : undefined,
    sort,
    limit,
    skip,
  }), [category, minAmount, maxAmount, sort, limit, skip]);

  // Treat dates as a range; if reversed, swap internally (without mutating inputs).
  const rawFrom = from || '';
  const rawTo = to || '';
  const effectiveFrom = rawFrom && rawTo && rawFrom > rawTo ? rawTo : rawFrom;
  const effectiveTo = rawFrom && rawTo && rawFrom > rawTo ? rawFrom : rawTo;

  const summaryParams = useMemo(() => ({
    category: category || undefined,
    from: effectiveFrom || undefined,
    to: effectiveTo || undefined,
    sort,
  }), [category, effectiveFrom, effectiveTo, sort]);

  const loadList = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await expenseService.list(listParams);
      setItems(res.results);
      setCount(res.count);
    } catch (e: any) {
      setError(e?.message || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const s = await expenseService.summary(summaryParams);
      setSummary(s);
    } catch (e: any) {
      setError(e?.message || 'Failed to load summary');
    } finally {
      setLoading(false);
    }
  };

  const displayedItems = useMemo(() => {
    const list = items || [];
    const hasDateFilter = Boolean(effectiveFrom || effectiveTo);
    if (!hasDateFilter) return list;

    const pad2 = (n: number) => String(n).padStart(2, '0');
    const toLocalYmd = (value: any) => {
      const d = new Date(value);
      if (isNaN(d.getTime())) return '';
      return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
    };

    return list.filter((row) => {
      const d = toLocalYmd((row as any)?.date);
      if (!d) return false;
      if (effectiveFrom && d < effectiveFrom) return false;
      if (effectiveTo && d > effectiveTo) return false;
      return true;
    });
  }, [items, effectiveFrom, effectiveTo]);

  useEffect(() => {
    loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setForm({ amount: undefined, date: undefined, category: '', paidTo: '', notes: '', imageUrl: '' });
    setSelectedId(null);
    setUploadedFile(null);
  };

  const onCreate = async () => {
    if (!form.amount || !form.category) {
      setError('amount and category are required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('amount', String(form.amount));
      formData.append('category', form.category);
      if (form.date) formData.append('date', form.date);
      if (form.paidTo) formData.append('paidTo', form.paidTo);
      if (form.notes) formData.append('notes', form.notes);
      if (uploadedFile) formData.append('image', uploadedFile);
      await expenseService.create(formData);
      resetForm();
      await loadList();
      notify('تم إضافة المصروف بنجاح');
    } catch (e: any) {
      setError(e?.message || 'Failed to create expense');
    } finally {
      setLoading(false);
    }
  };

  const onSelect = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const doc = await expenseService.getById(id);
      setViewExpense(doc);
      setViewOpen(true);
    } catch (e: any) {
      setError(e?.message || 'Failed to get expense');
    } finally {
      setLoading(false);
    }
  };

  const fillForEdit = async (id?: string) => {
    const expenseId = id || viewExpense?._id;
    if (!expenseId) return;
    
    setLoading(true);
    setError(null);
    try {
      const doc = await expenseService.getById(expenseId);
      setSelectedId(doc._id);
      setForm({
        amount: doc.amount,
        date: new Date(doc.date).toISOString().slice(0, 10),
        category: doc.category,
        paidTo: doc.paidTo,
        notes: doc.notes,
        imageUrl: (doc as any).imageUrl || '',
      });
      setUploadedFile(null);
      if (viewOpen) setViewOpen(false);
    } catch (e: any) {
      setError(e?.message || 'Failed to get expense');
    } finally {
      setLoading(false);
    }
  };

  const onUpdate = async () => {
    if (!selectedId) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      if (form.amount !== undefined) formData.append('amount', String(form.amount));
      if (form.category) formData.append('category', form.category);
      if (form.date) formData.append('date', form.date);
      if (form.paidTo) formData.append('paidTo', form.paidTo);
      if (form.notes) formData.append('notes', form.notes);
      if (uploadedFile) formData.append('image', uploadedFile);
      // Send request
      await expenseService.update(selectedId, formData);
      resetForm();
      await loadList();
      notify('تم حفظ التعديلات');
    } catch (e: any) {
      setError(e?.message || 'Failed to update expense');
    } finally {
      setLoading(false);
    }
  };
  
  const requestDelete = (id: string) => {
    setDeleteTargetId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    setLoading(true);
    setError(null);
    try {
      // Optimistic UI: remove locally first
      setItems((prev) => prev.filter((x) => x._id !== deleteTargetId));
      setCount((c) => Math.max(0, c - 1));
      await expenseService.delete(deleteTargetId);
      if (selectedId === deleteTargetId) resetForm();
      // Optionally re-fetch current page to stay consistent
      await loadList();
      notify('تم حذف المصروف');
    } catch (e: any) {
      setError(e?.message || 'Failed to delete expense');
      // If deletion failed, reload to restore accurate state
      await loadList();
    } finally {
      setLoading(false);
      setConfirmOpen(false);
      setDeleteTargetId(null);
    }
  };

  // دالة تصدير المصروفات إلى Excel
  const exportExpensesToExcel = () => {
    try {
      const exportData = displayedItems.map(row => {
        return {
          'التاريخ': row.date ? new Date(row.date).toLocaleDateString('ar-EG') : '',
          'التصنيف': row.category || '',
          'المبلغ (ج.م)': row.amount || 0,
          'المدفوع له': row.paidTo || '-',
          'ملاحظات': row.notes || '',
          'تاريخ الإنشاء': row.createdAt ? new Date(row.createdAt).toLocaleDateString('ar-EG') : '',
          'آخر تعديل': row.updatedAt ? new Date(row.updatedAt).toLocaleDateString('ar-EG') : '',
        };
      });
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'المصروفات');
      worksheet['!cols'] = [
        { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 30 }, { wch: 15 }, { wch: 15 }
      ];
      const fileName = `المصروفات_${new Date().toLocaleDateString('ar-EG').replace(/\//g, '-')}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      showSuccess('تم التصدير بنجاح', `تم تصدير ${exportData.length} سجل مصروف بنجاح`);
    } catch (error) {
      console.error('خطأ في تصدير المصروفات:', error);
      showError('خطأ في التصدير', 'حدث خطأ أثناء تصدير المصروفات');
    }
  };

  return (
    <div className="space-y-6">
      {/* المرشحات */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">التصنيف</label>
            <input
              className="px-1.5 py-0.5 rounded border dark:bg-gray-900 text-xs w-full h-8 min-w-[110px] sm:max-w-[160px] w-full"
              placeholder="مثال: rent"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">أدنى مبلغ</label>
            <input
              type="number"
              className="px-1.5 py-0.5 rounded border dark:bg-gray-900 text-xs w-full h-8 min-w-[110px] sm:max-w-[160px] w-full"
              placeholder="0"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">أقصى مبلغ</label>
            <input
              type="number"
              className="px-1.5 py-0.5 rounded border dark:bg-gray-900 text-xs w-full h-8 min-w-[110px] sm:max-w-[160px] w-full"
              placeholder="10000"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">من تاريخ</label>
            <input
              type="date"
              className="px-1.5 py-0.5 rounded border dark:bg-gray-900 text-xs w-full h-8 min-w-[110px] sm:max-w-[160px] w-full cursor-pointer"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              onClick={(e) => (e.currentTarget as HTMLInputElement).showPicker?.()}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">إلى تاريخ</label>
            <input
              type="date"
              className="px-1.5 py-0.5 rounded border dark:bg-gray-900 text-xs w-full h-8 min-w-[110px] sm:max-w-[160px] w-full cursor-pointer"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              onClick={(e) => (e.currentTarget as HTMLInputElement).showPicker?.()}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">الترتيب</label>
            <select
              className="px-1.5 py-0.5 rounded border dark:bg-gray-900 text-xs w-full h-8 min-w-[110px] sm:max-w-[160px] w-full"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOrder)}
            >
              <option value="desc">الأحدث</option>
              <option value="asc">الأقدم</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">الحد</label>
            <input
              type="number"
              className="px-1.5 py-0.5 rounded border dark:bg-gray-900 text-xs w-full h-8 min-w-[110px] sm:max-w-[160px] w-full"
              placeholder="20"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value || 0))}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">التخطي</label>
            <input
              type="number"
              className="px-1.5 py-0.5 rounded border dark:bg-gray-900 text-xs w-full h-8 min-w-[110px] sm:max-w-[160px] w-full"
              placeholder="0"
              value={skip}
              onChange={(e) => setSkip(Number(e.target.value || 0))}
            />
          </div>
          <div className="flex items-end">
            <button
              className="w-full px-1.5 py-0.5 rounded bg-gray-600 text-white text-xs h-8 min-w-[110px] sm:max-w-[160px] w-full"
              onClick={loadList}
              disabled={loading}
            >
              {loading ? 'جارِ التحميل...' : 'تحديث'}
            </button>
          </div>
          <div className="flex items-end">
            <button
              className="w-full px-1.5 py-0.5 rounded border text-xs h-8 min-w-[110px] sm:max-w-[160px] w-full"
              onClick={() => {
                setCategory('');
                setMinAmount('');
                setMaxAmount('');
                setFrom('');
                setTo('');
                setSort('desc');
                setLimit(10);
                setSkip(0);
                setError(null);
                setTimeout(() => {
                  loadList();
                  loadSummary();
                }, 0);
              }}
              disabled={loading}
            >
              إلغاء الفلاتر
            </button>
          </div>
          <div className="flex items-end">
            <button
              className="w-full px-1.5 py-0.5 rounded border text-xs h-8 min-w-[110px] sm:max-w-[160px] w-full"
              onClick={() => { setSkip(0); loadSummary(); }}
              disabled={loading}
            >
              ملخص
            </button>
          </div>
          <div className="flex  mt-4">
        <button
          onClick={exportExpensesToExcel}
          disabled={displayedItems.length === 0}
          className="px-4 py-2 rounded bg-green-600 text-white text-sm disabled:opacity-50 shadow hover:bg-green-700 transition-colors"
        >
          تصدير البيانات
        </button>
      </div>
        </div>
      </div>

      {/* Create / Update */}
      {selectedId == null && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">إضافة مصروف</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600" type="number" placeholder="المبلغ"
              value={form.amount as any || ''}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value === '' ? undefined : Number(e.target.value) }))} />
            <input
              className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600 cursor-pointer"
              type="date"
              value={form.date || ''}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              onClick={(e) => (e.currentTarget as HTMLInputElement).showPicker?.()}
            />
            <input className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600" placeholder="التصنيف"
              value={form.category || ''}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
            <input className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600" placeholder="المدفوع له"
              value={form.paidTo || ''}
              onChange={(e) => setForm((f) => ({ ...f, paidTo: e.target.value }))} />
            <input className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600" placeholder="ملاحظات"
              value={form.notes || ''}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
            <div className="flex flex-col mt-2 mb-2">
              <label className="text-xs text-gray-700 dark:text-gray-300 mb-1"> اضافة صورة فاتورة او مرفق (اختياري) </label>
              <input
                type="file"
                accept="image/*"
                onChange={e => setUploadedFile(e.target.files?.[0] || null)}
              />
              {uploadedFile ? (
                <img src={URL.createObjectURL(uploadedFile)} alt="preview" style={{ width: 90, marginTop: 8 }} className="rounded border mt-1" />
              ) : form.imageUrl ? (
                <img src={form.imageUrl} alt="current" style={{ width: 90, marginTop: 8, opacity: 0.75 }} className="rounded border mt-1" />
              ) : null}
              {(uploadedFile || form.imageUrl) && (
                <button type="button" className="text-xs text-red-500 mt-1" onClick={() => { setUploadedFile(null); setForm(f => ({ ...f, imageUrl: '' })); }}>
                  إزالة الصورة
                </button>
              )}
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50" onClick={onCreate} disabled={loading}>إنشاء</button>
          </div>
        </div>
      )}
      {selectedId != null && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-lg w-full p-6 relative animate-fade-in">
            <button onClick={resetForm} className="absolute -top-4 -right-4 bg-white border border-gray-200 rounded-full shadow p-2 text-xl text-black hover:bg-gray-100" title="إغلاق">✕</button>
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">تعديل مصروف</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600" type="number" placeholder="المبلغ"
                value={form.amount as any || ''}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value === '' ? undefined : Number(e.target.value) }))} />
              <input
                className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600 cursor-pointer"
                type="date"
                value={form.date || ''}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                onClick={(e) => (e.currentTarget as HTMLInputElement).showPicker?.()}
              />
              <input className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600" placeholder="التصنيف"
                value={form.category || ''}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
              <input className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600" placeholder="المدفوع له"
                value={form.paidTo || ''}
                onChange={(e) => setForm((f) => ({ ...f, paidTo: e.target.value }))} />
              <input className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600" placeholder="ملاحظات"
                value={form.notes || ''}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
              <div className="flex flex-col mt-2 mb-2">
                <label className="text-xs text-gray-700 dark:text-gray-300 mb-1"> اضافة صورة فاتورة او مرفق (اختياري) </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setUploadedFile(e.target.files?.[0] || null)}
                />
                {uploadedFile ? (
                  <img src={URL.createObjectURL(uploadedFile)} alt="preview" style={{ width: 90, marginTop: 8 }} className="rounded border mt-1" />
                ) : form.imageUrl ? (
                  <img src={form.imageUrl} alt="current" style={{ width: 90, marginTop: 8, opacity: 0.75 }} className="rounded border mt-1" />
                ) : null}
                {(uploadedFile || form.imageUrl) && (
                  <button type="button" className="text-xs text-red-500 mt-1" onClick={() => { setUploadedFile(null); setForm(f => ({ ...f, imageUrl: '' })); }}>
                    إزالة الصورة
                  </button>
                )}
              </div>
            </div>
            <div className="mt-3 flex gap-2 justify-end">
              <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50" onClick={onUpdate} disabled={loading}>حفظ</button>
              <button className="px-4 py-2 border rounded" onClick={resetForm} disabled={loading}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* الملخص */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
          <div className="text-sm text-gray-500">إجمالي المصروفات</div>
          <div className="text-2xl font-semibold">ج.م{new Intl.NumberFormat().format(summary?.totals.expense || 0)}</div>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
          <div className="text-sm text-gray-500">النطاق الزمني</div>
          <div className="text-sm">{summary?.range.from || '-'} → {summary?.range.to || '-'}</div>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
          <div className="text-sm text-gray-500">عدد السجلات</div>
          <div className="text-2xl font-semibold">{new Intl.NumberFormat().format(count)}</div>
        </div>
      </div>

      {/* القائمة */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-auto">
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">المصروفات ({displayedItems.length})</h3>
          {loading && <span className="text-sm text-gray-500">جارِ التحميل...</span>}
        </div>
        {error && (
          <div className="alert alert-error mb-3">
            <span>{error}</span>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-2 text-center">التاريخ</th>
                <th className="px-4 py-2 text-center">التصنيف</th>
                <th className="px-4 py-2 text-center">المبلغ</th>
                <th className="px-4 py-2 text-center">المدفوع له</th>
                <th className="px-4 py-2 text-center">ملاحظات</th>
                <th className="px-4 py-2 text-center">صورة</th>
                <th className="px-4 py-2 text-right">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {displayedItems.map((row) => (
                <tr key={row._id} className={`border-t border-gray-200 dark:border-gray-700 ${selectedId === row._id ? 'bg-gray-50 dark:bg-gray-900/40' : ''}`}>
                  <td className="px-4 py-2 text-sm text-center">{new Date(row.date).toLocaleDateString()}</td>
                  <td className="px-4 py-2 text-center">{row.category}</td>
                  <td className="px-4 py-2 text-center">ج.م{new Intl.NumberFormat().format(row.amount)}</td>
                  <td className="px-4 py-2 text-center">{row.paidTo || '-'}</td>
                  <td className="px-4 py-2 text-center">{row.notes || '-'}</td>
                  <td className="px-4 py-2 text-center">
                    {(row as any).imageUrl ? <img src={(row as any).imageUrl} alt="المصروف" style={{width:40, height:40, objectFit:'cover', borderRadius:4, border:'1px solid #ccc'}} /> : '-'}
                  </td>
                  <td className="px-4 py-2 text-right space-x-2">
                    <button className="px-3 py-1 rounded bg-gray-600 text-white text-sm disabled:opacity-60" onClick={() => onSelect(row._id)} disabled={loading}>عرض</button>
                    <button className="px-3 py-1 rounded bg-green-600 text-white text-sm disabled:opacity-60" onClick={() => fillForEdit(row._id)} disabled={loading}>تعديل</button>
                    <button className="px-3 py-1 rounded bg-red-600 text-white text-sm disabled:opacity-60" onClick={() => requestDelete(row._id)} disabled={loading}>حذف</button>
                  </td>
                </tr>
              ))}
              {displayedItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-500">لا توجد بيانات</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {(() => {
          const pageSize = limit || 10;
          const currentPage = Math.floor((skip || 0) / pageSize) + 1;
          const totalPages = Math.max(1, Math.ceil((count || 0) / pageSize));
          const hasClientDateFilter = Boolean(effectiveFrom || effectiveTo);
          const totalForUi = hasClientDateFilter ? displayedItems.length : (count || 0);
          const start = totalForUi > 0 ? 1 : 0;
          const end = totalForUi;
          return (
            <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-700 dark:text-gray-300">
              <div>
                عرض {start} إلى {end} من {new Intl.NumberFormat().format(totalForUi)} نتيجة
                {hasClientDateFilter ? ' (بعد الفلترة)' : ''} • صفحة {currentPage} من {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 rounded border dark:border-gray-700 disabled:opacity-50" disabled={(skip === 0) || loading} onClick={() => { setSkip(Math.max(0, skip - pageSize)); loadList(); }}>السابق</button>
                <button className="px-3 py-1 rounded border dark:border-gray-700 disabled:opacity-50" disabled={((skip + pageSize) >= count) || loading} onClick={() => { setSkip(skip + pageSize); loadList(); }}>التالي</button>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Summary */}
      {summary && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">ملخص المصروفات</h3>
          <div className="mb-2 text-sm text-gray-600 dark:text-gray-300">
            النطاق: {summary.range.from || '-'} → {summary.range.to || '-'}
          </div>
          <div className="font-medium">الإجمالي: ج.م{new Intl.NumberFormat().format(summary.totals.expense)}</div>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr>
                  <th className="px-3 py-2">السنة</th>
                  <th className="px-3 py-2">الشهر</th>
                  <th className="px-3 py-2">المصروف</th>
                </tr>
              </thead>
              <tbody>
                {summary.monthly.map((m, i) => (
                  <tr key={`${m.year}-${m.month}-${i}`} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="px-3 py-2">{m.year}</td>
                    <td className="px-3 py-2">{m.month}</td>
                    <td className="px-3 py-2">ج.م{new Intl.NumberFormat().format(m.expense)}</td>
                  </tr>
                ))}
                {summary.monthly.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-sm text-gray-500">لا توجد بيانات شهرية</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {/* Success toast */}
      {successMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded shadow-lg">
          {successMessage}
        </div>
      )}

      {/* View Expense Modal */}
      {viewOpen && viewExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-xl w-full mx-4 p-6 relative animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-200">💸</span>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">تفاصيل المصروف</h2>
              </div>
              <button onClick={() => setViewOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl">×</button>
            </div>

            {/* Body */}
            <div className="text-sm">
              <div className="divide-y divide-gray-200 dark:divide-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2 text-gray-500">
                    <span>📅</span>
                    <span>التاريخ</span>
                  </div>
                  <div className="font-medium">{new Date(viewExpense.date).toLocaleDateString()}</div>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2 text-gray-500">
                    <span>🏷️</span>
                    <span>التصنيف</span>
                  </div>
                  <div className="font-medium">{viewExpense.category}</div>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2 text-gray-500">
                    <span>💰</span>
                    <span>المبلغ</span>
                  </div>
                  <div className="font-semibold text-red-600 dark:text-red-400">ج.م{new Intl.NumberFormat().format(viewExpense.amount)}</div>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2 text-gray-500">
                    <span>👤</span>
                    <span>المدفوع له</span>
                  </div>
                  <div className="font-medium">{viewExpense.paidTo || '-'}</div>
                </div>
                <div className="px-4 py-3">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <span>📝</span>
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
                  <div className="text-gray-500">تم الإنشاء</div>
                  <div className="font-medium">{new Date(viewExpense.createdAt as any).toLocaleString()}</div>
                </div>
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/40">
                  <div className="text-gray-500">آخر تحديث</div>
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
      )}

      {/* Delete confirmation */}
      <ConfirmationDialog
        isOpen={confirmOpen}
        onClose={() => { setConfirmOpen(false); setDeleteTargetId(null); }}
        onConfirm={confirmDelete}
        title="تأكيد الحذف"
        message="هل أنت متأكد من حذف هذا المصروف؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="حذف"
        cancelText="إلغاء"
        type="danger"
        isLoading={loading}
      />
      <CustomAlert
        isOpen={alertState.isOpen}
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
        onClose={hideAlert}
      />
    </div>
  );
};

export default AdminExpenses;


