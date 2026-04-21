'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { payrollService, userService } from '@/services';
import type { Payroll } from '@/services/payrollService';
import type { User } from '@/types/models';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import * as XLSX from 'xlsx';
import CustomAlert from '@/components/ui/CustomAlert';
import { useCustomAlert } from '@/hooks/useCustomAlert';

import PayrollFilters from './PayrollFilters';
import PayrollForm from './PayrollForm';
import PayrollTable from './PayrollTable';
import PayrollSummary from './PayrollSummary';
import PayrollModal from './PayrollModal';
import PayrollPagination from './PayrollPagination';

type SortOrder = 'asc' | 'desc';

const AdminPayroll: React.FC = () => {
  const { alertState, showSuccess, showError, showWarning, hideAlert } = useCustomAlert();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data state
  const [rows, setRows] = useState<Payroll[]>([]);
  const [count, setCount] = useState(0);

  // Users
  const [users, setUsers] = useState<User[]>([]);
  const userMap = useMemo(() => {
    const m: Record<string, User> = {};
    users.forEach(u => { m[u._id] = u; });
    return m;
  }, [users]);

  // Filters
  const [employeeId, setEmployeeId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [sort, setSort] = useState<SortOrder>('desc');
  const [limit, setLimit] = useState<number>(10);
  const [skip, setSkip] = useState<number>(0);
  const [roleFilter, setRoleFilter] = useState<string>('');
  

  // IMPORTANT:
  // Some backends filter payroll list by different date field (e.g. createdAt vs paymentDate).
  // To avoid "no data" surprises, we keep server-side list pagination stable and apply
  // date/role filtering as a client-side fallback on current page.
  const listParams = useMemo(
    () => ({
      employeeId: employeeId || undefined,
      sort,
      limit,
      skip,
    }),
    [employeeId, sort, limit, skip]
  );

  // Treat dates as an actual range (start/end).
  // If only one side is set, it's an open-ended filter.
  const rawFrom = from || '';
  const rawTo = to || '';
  // Ensure range is always valid (from <= to) when both are present
  const effectiveFrom = rawFrom && rawTo && rawFrom > rawTo ? rawTo : rawFrom;
  const effectiveTo = rawFrom && rawTo && rawFrom > rawTo ? rawFrom : rawTo;

  const summaryParams = useMemo(
    () => ({
      employeeId: employeeId || undefined,
      from: effectiveFrom || undefined,
      to: effectiveTo || undefined,
      sort,
    }),
    [employeeId, effectiveFrom, effectiveTo, sort]
  );

  const filteredUsers = useMemo(() => {
    if (!roleFilter) return users;
    return users.filter(u => (u as any).role === roleFilter);
  }, [users, roleFilter]);

  // قائمة الموظفين للإنشاء/التعديل (المدربين والمديرين فقط)
  const payrollUsers = useMemo(() => {
    const base = users.filter(
      (u) => (u as any).role === 'trainer' || (u as any).role === 'manager'
    );
    if (!roleFilter) return base;
    return base.filter((u) => (u as any).role === roleFilter);
  }, [users, roleFilter]);

  // إذا تم تغيير فلتر الدور، وتبيّن أن الموظف المختار لا يطابق الدور الحالي: امسح الاختيار
  useEffect(() => {
    if (!employeeId) return;
    if (!roleFilter) return;
    const current = users.find((u) => u._id === employeeId);
    if (!current) return;
    if ((current as any).role !== roleFilter) {
      setEmployeeId('');
      setSkip(0);
    }
  }, [roleFilter, employeeId, users]);

  // Create/Update form
  type PayrollForm = {
    employeeId?: string;
    salaryAmount?: number;
    paymentDate?: string; // yyyy-mm-dd
    bonuses?: number;
    deductions?: number;
    notes?: string;
  };
  const [form, setForm] = useState<PayrollForm>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Summary
  const [summary, setSummary] = useState<{
    range: { from: string | null; to: string | null };
    totals: { payroll: number };
    monthly: Array<{ year: number; month: number; payroll: number }>;
  } | null>(null);

  // View modal
  const [viewOpen, setViewOpen] = useState(false);
  const [viewDoc, setViewDoc] = useState<Payroll | null>(null);

  // Delete confirm & toast
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const notify = (msg: string) => { setSuccessMessage(msg); setTimeout(() => setSuccessMessage(null), 2500); };

  const loadUsers = async () => {
    try {
      const res = await userService.getUsers({ page: 1, limit: 500, sortBy: 'name', sortOrder: 'asc' } as any);
      const list: User[] =
        Array.isArray(res)
          ? (res as any)
          : Array.isArray((res as any)?.data)
            ? (res as any).data
            : Array.isArray((res as any)?.results)
              ? (res as any).results
              : [];
      setUsers(list);
    } catch { /* ignore */ }
  };

  const loadList = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await payrollService.list(listParams);
      setRows(res.results);
      setCount(res.count);
    } catch (e: any) {
      setError(e?.message || 'Failed to load payroll');
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const s = await payrollService.summary(summaryParams);
      console.log('SUMMARY MONTHLY:', s.monthly); // ✅
      setSummary(s);
    } catch (e: any) {
      setError(e?.message || 'Failed to load summary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    loadList();
    loadSummary(); // تحميل الملخص تلقائياً عند أول تحميل
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // تحديث القائمة تلقائياً عند تغيير الفلاتر (بدون الحاجة لزر "تحديث")
  useEffect(() => {
    // Reset pagination when filters change (except skip itself)
    loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listParams.employeeId, listParams.sort, listParams.limit, listParams.skip]);

  // تحميل الملخص تلقائياً عند تغيير الفلاتر
  useEffect(() => {
    loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summaryParams.employeeId, summaryParams.from, summaryParams.to, summaryParams.sort]);

  const displayedRows = useMemo(() => {
    const list = rows || [];
    const fromStr = effectiveFrom;
    const toStr = effectiveTo;
    const hasDateFilter = Boolean(fromStr || toStr);

    const inRange = (dateStr?: string) => {
      if (!hasDateFilter) return true;
      const raw = dateStr || '';
      const parsed = new Date(raw);
      const pad2 = (n: number) => String(n).padStart(2, '0');
      // IMPORTANT: Use local date (not UTC) to avoid off-by-one day due to timezone.
      const d = !isNaN(parsed.getTime())
        ? `${parsed.getFullYear()}-${pad2(parsed.getMonth() + 1)}-${pad2(parsed.getDate())}`
        : raw.slice(0, 10);
      if (!d) return false;
      if (fromStr && d < fromStr) return false;
      if (toStr && d > toStr) return false;
      return true;
    };

    return list.filter((p) => {
      if (!p) return false;
      if (!inRange(p.paymentDate)) return false;
      if (roleFilter) {
        const u = userMap[p.employeeId];
        // if we don't have user loaded, don't hide the row.
        if (u && (u as any).role !== roleFilter) return false;
      }
      return true;
    });
  }, [rows, effectiveFrom, effectiveTo, roleFilter, userMap]);

  const resetForm = () => { setForm({}); setSelectedId(null); };

  const onCreate = async () => {
    if (!form.employeeId || !form.salaryAmount) { setError('الموظف وقيمة الراتب مطلوبة'); return; }
    setLoading(true);
    setError(null);
    try {
      const payload: any = {
        employeeId: form.employeeId,
        salaryAmount: Number(form.salaryAmount),
        paymentDate: form.paymentDate || undefined,
        bonuses: form.bonuses !== undefined ? Number(form.bonuses) : undefined,
        deductions: form.deductions !== undefined ? Number(form.deductions) : undefined,
        notes: form.notes || undefined,
      };
      await payrollService.create(payload);
      resetForm();
      await loadList();
      await fetchTotalPayrollAll(); // تحديث الإجمالي الكلي
      notify('تم إضافة قيد الرواتب');
    } catch (e: any) {
      setError(e?.message || 'Failed to create payroll');
    } finally { setLoading(false); }
  };

  const onSelect = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const doc = await payrollService.getById(id);
      console.log('PAYROLL DOC:', doc); // طباعة البيانات القادمة من السيرفر
      setViewDoc(doc);
      setViewOpen(true);
    } catch (e: any) { setError(e?.message || 'Failed to get payroll'); }
    finally { setLoading(false); }
  };

  const fillForEdit = () => {
    if (!viewDoc) return;
    setSelectedId(viewDoc._id);
    setForm({
      employeeId: viewDoc.employeeId,
      salaryAmount: viewDoc.salaryAmount,
      paymentDate: String(viewDoc.paymentDate).slice(0,10),
      bonuses: viewDoc.bonuses,
      deductions: viewDoc.deductions,
      notes: viewDoc.notes,
    });
    setViewOpen(false);
  };

  const onUpdate = async () => {
    if (!selectedId) return;
    setLoading(true);
    setError(null);
    try {
      const payload: any = {
        employeeId: form.employeeId || undefined,
        salaryAmount: form.salaryAmount !== undefined ? Number(form.salaryAmount) : undefined,
        paymentDate: form.paymentDate || undefined,
        bonuses: form.bonuses !== undefined ? Number(form.bonuses) : undefined,
        deductions: form.deductions !== undefined ? Number(form.deductions) : undefined,
        notes: form.notes || undefined,
      };
      await payrollService.update(selectedId, payload);
      resetForm();
      await loadList();
      await fetchTotalPayrollAll(); // تحديث الإجمالي الكلي
      notify('تم حفظ التعديلات');
    } catch (e: any) { setError(e?.message || 'Failed to update payroll'); }
    finally { setLoading(false); }
  };

  const requestDelete = (id: string) => { setDeleteTargetId(id); setConfirmOpen(true); };
  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    setLoading(true);
    setError(null);
    try {
      setRows(prev => prev.filter(x => x._id !== deleteTargetId));
      setCount(c => Math.max(0, c - 1));
      await payrollService.delete(deleteTargetId);
      if (selectedId === deleteTargetId) resetForm();
      await loadList();
      await fetchTotalPayrollAll(); // تحديث الإجمالي الكلي
      notify('تم حذف قيد الرواتب');
    } catch (e: any) { setError(e?.message || 'Failed to delete payroll'); await loadList(); }
    finally { setLoading(false); setConfirmOpen(false); setDeleteTargetId(null); }
  };

  const [totalPayrollAll, setTotalPayrollAll] = useState<number>(0);

  // جلب إجمالي كل الرواتب بدون فلاتر عند تحميل الصفحة فقط
  useEffect(() => {
    payrollService.summary().then(s => setTotalPayrollAll(s.totals.payroll || 0));
  }, []);

  // أضف دالة مساعدة لجلب إجمالي كل الرواتب
  const fetchTotalPayrollAll = async () => {
    const s = await payrollService.summary();
    setTotalPayrollAll(s.totals.payroll || 0);
  };

  // دالة تصدير الرواتب إلى Excel
  const exportPayrollToExcel = () => {
    try {
      const exportData = displayedRows.map(payroll => {
        const user = userMap[payroll.employeeId];
        const netSalary = (payroll.salaryAmount || 0) + (payroll.bonuses || 0) - (payroll.deductions || 0);
        
        return {
          'الموظف': user?.name || payroll.employeeId || 'غير محدد',
          'هاتف الموظف': user?.phone || 'غير محدد',
          'بريد الموظف': user?.email || 'غير محدد',
          'دور الموظف': user ? ((user as any).role === 'trainer' ? 'مدرب' : (user as any).role === 'manager' ? 'مدير' : 'غير محدد') : 'غير محدد',
          'الراتب الأساسي (ج.م)': payroll.salaryAmount || 0,
          'المكافآت (ج.م)': payroll.bonuses || 0,
          'الخصومات (ج.م)': payroll.deductions || 0,
          'صافي الراتب (ج.م)': netSalary,
          'تاريخ الدفع': payroll.paymentDate ? new Date(payroll.paymentDate).toLocaleDateString('ar-EG') : '',
          'الشهر': payroll.paymentDate ? new Date(payroll.paymentDate).getMonth() + 1 : '',
          'السنة': payroll.paymentDate ? new Date(payroll.paymentDate).getFullYear() : '',
          'الملاحظات': payroll.notes || '',
          'تاريخ الإنشاء': payroll.createdAt ? new Date(payroll.createdAt).toLocaleDateString('ar-EG') : '',
          'آخر تعديل': payroll.updatedAt ? new Date(payroll.updatedAt).toLocaleDateString('ar-EG') : '',
        };
      });

      // إنشاء ورقة عمل
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      // إنشاء كتاب عمل
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'الرواتب');

      // تحديد عرض الأعمدة
      const columnWidths = [
        { wch: 20 }, // الموظف
        { wch: 15 }, // هاتف الموظف
        { wch: 25 }, // بريد الموظف
        { wch: 12 }, // دور الموظف
        { wch: 15 }, // الراتب الأساسي
        { wch: 15 }, // المكافآت
        { wch: 15 }, // الخصومات
        { wch: 15 }, // صافي الراتب
        { wch: 15 }, // تاريخ الدفع
        { wch: 8 },  // الشهر
        { wch: 8 },  // السنة
        { wch: 30 }, // الملاحظات
        { wch: 15 }, // تاريخ الإنشاء
        { wch: 15 }, // آخر تعديل
      ];
      worksheet['!cols'] = columnWidths;

      // تصدير الملف
      const fileName = `الرواتب_${new Date().toLocaleDateString('ar-EG').replace(/\//g, '-')}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      showSuccess('تم التصدير بنجاح', `تم تصدير ${exportData.length} قيد راتب بنجاح`);
    } catch (error) {
      console.error('خطأ في تصدير الرواتب:', error);
      showError('خطأ في التصدير', 'حدث خطأ أثناء تصدير الرواتب');
    }
  };

  // Handler functions for child components
  const handleEmployeeIdChange = (value: string) => {
    setEmployeeId(value);
    setSkip(0);
  };

  const handleResetFilters = () => {
    setEmployeeId('');
    setRoleFilter('');
    setFrom('');
    setTo('');
    setSort('desc');
    setLimit(10);
    setSkip(0);
    setError(null);
    // refresh list + summary after resetting
    setTimeout(() => {
      loadList();
      loadSummary();
    }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <PayrollFilters
        employeeId={employeeId}
        roleFilter={roleFilter}
        from={from}
        to={to}
        sort={sort}
        loading={loading}
        payrollUsers={payrollUsers}
        onEmployeeIdChange={handleEmployeeIdChange}
        onRoleFilterChange={setRoleFilter}
        onFromChange={setFrom}
        onToChange={setTo}
        onSortChange={setSort}
        onLoadList={loadList}
        onResetFilters={handleResetFilters}
        onLoadSummary={loadSummary}
        onExportPayrollToExcel={exportPayrollToExcel}
        displayedRowsLength={displayedRows.length}
      />

      {/* Create / Update Form */}
      <PayrollForm
        form={form}
        selectedId={selectedId}
        payrollUsers={payrollUsers}
        loading={loading}
        userMap={userMap}
        onFormChange={setForm}
        onCreate={onCreate}
        onUpdate={onUpdate}
        onResetForm={resetForm}
      />

      {/* Summary Cards and Monthly Summary */}
      <PayrollSummary
        summary={summary}
        totalPayrollAll={totalPayrollAll}
        count={count}
      />

      {/* Table */}
      <PayrollTable
        displayedRows={displayedRows}
        selectedId={selectedId}
        loading={loading}
        error={error}
        userMap={userMap}
        onSelect={onSelect}
        onRequestDelete={requestDelete}
      />

      {/* Pagination */}
      <PayrollPagination
        skip={skip}
        limit={limit}
        count={count}
        loading={loading}
        displayedRowsLength={displayedRows.length}
        roleFilter={roleFilter}
        effectiveFrom={effectiveFrom}
        effectiveTo={effectiveTo}
        onSkipChange={setSkip}
        onLoadList={loadList}
      />

      {/* Toast */}
      {successMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded shadow-lg">
          {successMessage}
        </div>
      )}

      {/* Delete dialog */}
      <ConfirmationDialog
        isOpen={confirmOpen}
        onClose={() => { setConfirmOpen(false); setDeleteTargetId(null); }}
        onConfirm={confirmDelete}
        title="تأكيد الحذف"
        message="هل أنت متأكد من حذف هذا القيد؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="حذف"
        cancelText="إلغاء"
        type="danger"
        isLoading={loading}
      />

      {/* View Payroll Modal */}
      <PayrollModal
        viewOpen={viewOpen}
        viewDoc={viewDoc}
        userMap={userMap}
        onSetViewOpen={setViewOpen}
        onFillForEdit={fillForEdit}
      />

      {/* Custom Alert */}
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

export default AdminPayroll;
