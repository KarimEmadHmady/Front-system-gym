'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { revenueService, userService } from '@/services';
import type { Revenue } from '@/services/revenueService';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import type { User } from '@/types/models';
import * as XLSX from 'xlsx';
import CustomAlert from '@/components/ui/CustomAlert';
import { useCustomAlert } from '@/hooks/useCustomAlert';

import type { SortOrder, RevenueForm, SummaryData } from './types';
import RevenueFilters from './RevenueFilters';
import AddRevenueForm from './AddRevenueForm';
import EditRevenueModal from './EditRevenueModal';
import RevenueSummary from './RevenueSummary';
import RevenueTable from './RevenueTable';
import ViewRevenueModal from './ViewRevenueModal';

const INITIAL_FORM: RevenueForm = {
  amount: undefined,
  date: undefined,
  paymentMethod: 'cash',
  sourceType: 'other',
  notes: '',
};

const AdminRevenue: React.FC = () => {
  const { alertState, showSuccess, showError, hideAlert } = useCustomAlert();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // List state
  const [items, setItems] = useState<Revenue[]>([]);
  const [count, setCount] = useState(0);

  // Filters
  const [sourceType, setSourceType] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [sort, setSort] = useState<SortOrder>('desc');
  const [limit, setLimit] = useState(10);
  const [skip, setSkip] = useState(0);

  // Form / edit state
  const [form, setForm] = useState<RevenueForm>({ ...INITIAL_FORM });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Summary
  const [summary, setSummary] = useState<SummaryData | null>(null);

  // Delete & notifications
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const notify = (msg: string) => { setSuccessMessage(msg); setTimeout(() => setSuccessMessage(null), 2500); };

  // Users
  const [users, setUsers] = useState<User[]>([]);
  const userMap = useMemo(() => {
    const map: Record<string, User> = {};
    users.forEach(u => { map[u._id] = u; });
    return map;
  }, [users]);
  const members = useMemo(() => users.filter(u => (u as any).role === 'member'), [users]);

  // View modal
  const [viewOpen, setViewOpen] = useState(false);
  const [viewRevenue, setViewRevenue] = useState<Revenue | null>(null);

  // ── Derived date values ──────────────────────────────────────────────────
  const effectiveFrom = from && to && from > to ? to : from;
  const effectiveTo = from && to && from > to ? from : to;

  const listParams = useMemo(() => ({
    sourceType: sourceType || undefined,
    paymentMethod: paymentMethod || undefined,
    minAmount: minAmount ? Number(minAmount) : undefined,
    maxAmount: maxAmount ? Number(maxAmount) : undefined,
    sort,
    limit,
    skip,
  }), [sourceType, paymentMethod, minAmount, maxAmount, sort, limit, skip]);

  const summaryParams = useMemo(() => ({
    sourceType: sourceType || undefined,
    paymentMethod: paymentMethod || undefined,
    from: effectiveFrom || undefined,
    to: effectiveTo || undefined,
    sort,
  }), [sourceType, paymentMethod, effectiveFrom, effectiveTo, sort]);

  // ── Filtered display list ────────────────────────────────────────────────
  const displayedItems = useMemo(() => {
    const list = items || [];
    if (!effectiveFrom && !effectiveTo) return list;
    const pad2 = (n: number) => String(n).padStart(2, '0');
    const toLocalYmd = (value: any) => {
      const d = new Date(value);
      if (isNaN(d.getTime())) return '';
      return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
    };
    return list.filter(row => {
      const d = toLocalYmd((row as any)?.date);
      if (!d) return false;
      if (effectiveFrom && d < effectiveFrom) return false;
      if (effectiveTo && d > effectiveTo) return false;
      return true;
    });
  }, [items, effectiveFrom, effectiveTo]);

  // ── Data loaders ─────────────────────────────────────────────────────────
  const loadList = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await revenueService.list(listParams);
      setItems(res.results);
      setCount(res.count);
    } catch (e: any) {
      setError(e?.message || 'Failed to load revenue');
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const s = await revenueService.summary(summaryParams as any);
      setSummary(s);
    } catch (e: any) {
      setError(e?.message || 'Failed to load summary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadList(); }, []);
  useEffect(() => { loadList(); }, [listParams.sourceType, listParams.paymentMethod, listParams.minAmount, listParams.maxAmount, listParams.sort, listParams.limit, listParams.skip]); // eslint-disable-line

  useEffect(() => {
    (async () => {
      try {
        const res = await userService.getUsers({ page: 1, limit: 500, sortBy: 'name', sortOrder: 'asc' } as any);
        const list = Array.isArray(res) ? res : Array.isArray((res as any)?.data) ? (res as any).data : Array.isArray((res as any)?.results) ? (res as any).results : [];
        setUsers(list);
      } catch { setUsers([]); }
    })();
  }, []);

  // ── CRUD ─────────────────────────────────────────────────────────────────
  const resetForm = () => { setForm({ ...INITIAL_FORM }); setSelectedId(null); };

  const onCreate = async () => {
    if (!form.amount || !form.sourceType) { setError('المبلغ ونوع المصدر مطلوبان'); return; }
    setLoading(true);
    setError(null);
    try {
      const payload: any = { amount: Number(form.amount), sourceType: form.sourceType, paymentMethod: form.paymentMethod || 'cash', userId: form.userId || undefined, notes: form.notes || undefined };
      if (form.date) payload.date = form.date;
      await revenueService.create(payload);
      resetForm();
      await loadList();
      notify('تم إضافة الدخل بنجاح');
    } catch (e: any) {
      setError(e?.message || 'Failed to create revenue');
    } finally {
      setLoading(false);
    }
  };

  const onSelect = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const doc = await revenueService.getById(id);
      setViewRevenue(doc);
      setViewOpen(true);
    } catch (e: any) {
      setError(e?.message || 'Failed to get revenue');
    } finally {
      setLoading(false);
    }
  };

  const onUpdate = async () => {
    if (!selectedId) return;
    setLoading(true);
    setError(null);
    try {
      const payload: any = { amount: form.amount !== undefined ? Number(form.amount) : undefined, sourceType: form.sourceType || undefined, paymentMethod: form.paymentMethod || undefined, userId: form.userId || undefined, notes: form.notes || undefined };
      if (form.date) payload.date = form.date;
      await revenueService.update(selectedId, payload);
      resetForm();
      await loadList();
      notify('تم حفظ التعديلات');
    } catch (e: any) {
      setError(e?.message || 'Failed to update revenue');
    } finally {
      setLoading(false);
    }
  };

  const requestDelete = (id: string) => { setDeleteTargetId(id); setConfirmOpen(true); };
  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    setLoading(true);
    setError(null);
    try {
      setItems(prev => prev.filter(x => x._id !== deleteTargetId));
      setCount(c => Math.max(0, c - 1));
      await revenueService.delete(deleteTargetId);
      if (selectedId === deleteTargetId) resetForm();
      await loadList();
      notify('تم حذف سجل الدخل');
    } catch (e: any) {
      setError(e?.message || 'Failed to delete revenue');
      await loadList();
    } finally {
      setLoading(false);
      setConfirmOpen(false);
      setDeleteTargetId(null);
    }
  };

  const fillForEdit = () => {
    if (!viewRevenue) return;
    setSelectedId(viewRevenue._id);
    setForm({
      amount: viewRevenue.amount,
      date: String(viewRevenue.date).slice(0, 10),
      paymentMethod: viewRevenue.paymentMethod,
      sourceType: viewRevenue.sourceType,
      userId: viewRevenue.userId,
      notes: viewRevenue.notes,
    });
    setViewOpen(false);
  };

  // ── Export ────────────────────────────────────────────────────────────────
  const exportRevenueToExcel = () => {
    try {
      const exportData = displayedItems.map(row => {
        const user = row.userId ? userMap[row.userId] : undefined;
        return {
          'التاريخ': row.date ? new Date(row.date).toLocaleDateString('ar-EG') : '',
          'المبلغ (ج.م)': row.amount || 0,
          'طريقة الدفع': row.paymentMethod || '',
          'نوع المصدر': row.sourceType || '',
          'العميل': user?.name || row.userId || '-',
          'هاتف العميل': user?.phone || '-',
          'ملاحظات': row.notes || '',
          'تاريخ الإنشاء': row.createdAt ? new Date(row.createdAt).toLocaleDateString('ar-EG') : '',
          'آخر تعديل': row.updatedAt ? new Date(row.updatedAt).toLocaleDateString('ar-EG') : '',
        };
      });
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'الدخل');
      worksheet['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 30 }, { wch: 15 }, { wch: 15 }];
      XLSX.writeFile(workbook, `الدخل_${new Date().toLocaleDateString('ar-EG').replace(/\//g, '-')}.xlsx`);
      showSuccess('تم التصدير بنجاح', `تم تصدير ${exportData.length} سجل دخل بنجاح`);
    } catch {
      showError('خطأ في التصدير', 'حدث خطأ أثناء تصدير الدخل');
    }
  };

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <RevenueFilters
        sourceType={sourceType} setSourceType={setSourceType}
        paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod}
        minAmount={minAmount} setMinAmount={setMinAmount}
        maxAmount={maxAmount} setMaxAmount={setMaxAmount}
        from={from} setFrom={setFrom}
        to={to} setTo={setTo}
        sort={sort} setSort={setSort}
        limit={limit} setLimit={setLimit}
        loading={loading}
        displayedCount={displayedItems.length}
        onRefresh={loadList}
        onSkipReset={() => setSkip(0)}
        onClearFilters={() => {
          setSourceType(''); setPaymentMethod(''); setMinAmount(''); setMaxAmount('');
          setFrom(''); setTo(''); setSort('desc'); setLimit(10); setSkip(0); setError(null);
          setTimeout(() => { loadList(); loadSummary(); }, 0);
        }}
        onLoadSummary={() => { setSkip(0); loadSummary(); }}
        onExport={exportRevenueToExcel}
      />

      {selectedId == null && (
        <AddRevenueForm form={form} setForm={setForm} members={members} loading={loading} onCreate={onCreate} />
      )}

      {selectedId != null && (
        <EditRevenueModal
          form={form}
          setForm={setForm}
          userDisplayName={userMap[form.userId || '']?.name || form.userId || ''}
          loading={loading}
          onUpdate={onUpdate}
          onCancel={resetForm}
        />
      )}

      <RevenueSummary summary={summary} count={count} />

      <RevenueTable
        displayedItems={displayedItems}
        userMap={userMap}
        count={count}
        skip={skip}
        limit={limit}
        loading={loading}
        error={error}
        selectedId={selectedId}
        hasDateFilter={Boolean(effectiveFrom || effectiveTo)}
        onView={onSelect}
        onDelete={requestDelete}
        onPrev={() => { setSkip(Math.max(0, skip - limit)); loadList(); }}
        onNext={() => { setSkip(skip + limit); loadList(); }}
      />

      {successMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded shadow-lg">{successMessage}</div>
      )}

      {viewOpen && viewRevenue && (
        <ViewRevenueModal
          revenue={viewRevenue}
          userMap={userMap}
          onClose={() => setViewOpen(false)}
          onEdit={fillForEdit}
        />
      )}

      <ConfirmationDialog
        isOpen={confirmOpen}
        onClose={() => { setConfirmOpen(false); setDeleteTargetId(null); }}
        onConfirm={confirmDelete}
        title="تأكيد الحذف"
        message="هل أنت متأكد من حذف هذا السجل؟ لا يمكن التراجع عن هذا الإجراء."
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

export default AdminRevenue;