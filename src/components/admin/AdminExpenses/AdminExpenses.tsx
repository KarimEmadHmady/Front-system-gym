'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { expenseService } from '@/services';
import type { Expense } from '@/types';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import CustomAlert from '@/components/ui/CustomAlert';
import { useCustomAlert } from '@/hooks/useCustomAlert';
import ExpenseFilters from './ExpenseFilters';
import ExpenseFormComponent from './ExpenseForm';
import ExpenseSummary from './ExpenseSummary';
import ExpenseTable from './ExpenseTable';
import ExpenseViewModal from './ExpenseViewModal';
import ExpenseExport from './ExpenseExport';

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
    date?: string;
    category: string;
    paidTo?: string;
    notes?: string;
    imageUrl?: string;
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

  useEffect(() => {
    loadList();
  }, [category, minAmount, maxAmount]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-filter when dates change
  useEffect(() => {
    loadList();
  }, [from, to]); // eslint-disable-line react-hooks-exhaustive-deps

  // Auto-filter when sort or pagination changes
  useEffect(() => {
    loadList();
  }, [sort, limit, skip]); // eslint-disable-line react-hooks-exhaustive-deps

  const resetForm = () => {
    setForm({ amount: undefined, date: undefined, category: '', paidTo: '', notes: '', imageUrl: '' });
    setSelectedId(null);
    setUploadedFile(null);
  };

  const onCreate = async () => {
    if (!form.amount || !form.category) {
      setError('المبلغ والفئة مطلوبة');
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
      notify('تم إنشاء المصروف بنجاح');
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
      notify('تم تحديث المصروف بنجاح');
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
      notify('تم حذف المصروف بنجاح');
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

  const clearFilters = () => {
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
  };

  const handlePreviousPage = () => {
    setSkip(Math.max(0, skip - (limit || 10)));
    loadList();
  };

  const handleNextPage = () => {
    setSkip(skip + (limit || 10));
    loadList();
  };

  return (
    <div className="space-y-6">
      <ExpenseFilters
        category={category}
        setCategory={setCategory}
        minAmount={minAmount}
        setMinAmount={setMinAmount}
        maxAmount={maxAmount}
        setMaxAmount={setMaxAmount}
        from={from}
        setFrom={setFrom}
        to={to}
        setTo={setTo}
        sort={sort}
        setSort={setSort}
        limit={limit}
        setLimit={setLimit}
        skip={skip}
        setSkip={setSkip}
        loading={loading}
        onLoadList={loadList}
        onLoadSummary={loadSummary}
        onClearFilters={clearFilters}
        onExport={() => {}}
        displayedItemsLength={displayedItems.length}
      />

      {/* Export Button */}
      <div className="flex mt-4">
        <ExpenseExport displayedItems={displayedItems} />
      </div>

      {/* Create / Update */}
      {selectedId == null && (
        <ExpenseFormComponent
          form={form}
          setForm={setForm}
          uploadedFile={uploadedFile}
          setUploadedFile={setUploadedFile}
          loading={loading}
          isEdit={false}
          onSubmit={onCreate}
          onCancel={resetForm}
        />
      )}
      
      {selectedId != null && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-lg w-full p-6 relative animate-fade-in">
            <button onClick={resetForm} className="absolute -top-4 -right-4 bg-white border border-gray-200 rounded-full shadow p-2 text-xl text-black hover:bg-gray-100" title="إغلاق">×</button>
            <ExpenseFormComponent
              form={form}
              setForm={setForm}
              uploadedFile={uploadedFile}
              setUploadedFile={setUploadedFile}
              loading={loading}
              isEdit={true}
              onSubmit={onUpdate}
              onCancel={resetForm}
            />
          </div>
        </div>
      )}

      <ExpenseSummary summary={summary} count={count} />

      <ExpenseTable
        displayedItems={displayedItems}
        loading={loading}
        error={error}
        selectedId={selectedId}
        limit={limit}
        skip={skip}
        count={count}
        effectiveFrom={effectiveFrom}
        effectiveTo={effectiveTo}
        onSelect={onSelect}
        onEdit={fillForEdit}
        onDelete={requestDelete}
        onPreviousPage={handlePreviousPage}
        onNextPage={handleNextPage}
      />

      <ExpenseViewModal
        viewOpen={viewOpen}
        viewExpense={viewExpense}
        setViewOpen={setViewOpen}
        fillForEdit={fillForEdit}
      />

      {/* Success toast */}
      {successMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded shadow-lg">
          {successMessage}
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmationDialog
        isOpen={confirmOpen}
        onClose={() => { setConfirmOpen(false); setDeleteTargetId(null); }}
        onConfirm={confirmDelete}
        title="حذف المصروف"
        message="هل أنت متأكد من حذف هذا المصروف؟ هذا الإجراء لا يمكن التراجع عنه."
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
