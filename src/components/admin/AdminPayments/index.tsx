'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { PaymentService, type Payment } from '@/services/paymentService';
import { UserService } from '@/services/userService';
import type { User } from '@/types/models';
import { useAuth } from '@/hooks/useAuth';
import * as XLSX from 'xlsx';
import { queuePayment } from '@/lib/offlineSync';
import VideoTutorial from '../../VideoTutorial';
import PaymentTable from './PaymentTable';
import PaymentModal from './PaymentModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import OfflineAlertModal from './OfflineAlertModal';
import PaymentFilters from './PaymentFilters';

const AdminPayments = () => {
  const { user } = useAuth();
  const canEdit = user?.role === 'admin' || user?.role === 'manager';
  const paymentSvc = useMemo(() => new PaymentService(), []);
  const userSvc = useMemo(() => new UserService(), []);

  const [payments, setPayments] = useState<Payment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPayments, setTotalPayments] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Payment | null>(null);
  const [form, setForm] = useState<any>({ userId: '', amount: '', date: '', method: 'cash', notes: '' });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [offlineAlertOpen, setOfflineAlertOpen] = useState(false);

  const load = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const [pRes, uRes] = await Promise.all([
        paymentSvc.getAllPayments({ page, limit: pageSize, sortBy: 'date', sortOrder: 'desc' } as any),
        // Users list for the create/edit modal selector
        userSvc.getUsers({ page: 1, limit: 500, sortBy: 'name', sortOrder: 'asc' } as any),
      ]);

      const pArr: Payment[] = Array.isArray((pRes as any)?.data) ? (pRes as any).data : [];
      const uArr: User[] = Array.isArray(uRes)
        ? (uRes as any)
        : Array.isArray((uRes as any)?.data)
          ? (uRes as any).data
          : Array.isArray((uRes as any)?.results)
            ? (uRes as any).results
            : [];

      setPayments(pArr);
      setUsers(uArr);
      setTotalPayments(Number((pRes as any)?.pagination?.total ?? pArr.length ?? 0));
      setTotalPages(Math.max(1, Number((pRes as any)?.pagination?.totalPages ?? 1)));
    } catch (e: any) {
      setError(e?.message || 'تعذر جلب المدفوعات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const userMap = useMemo(() => {
    const m: Record<string, User> = {};
    users.forEach(u => { m[u._id] = u; });
    return m;
  }, [users]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return payments.filter(p => {
      const u = userMap[p.userId];
      const name = (u?.name || '').toLowerCase();
      const phone = (u?.phone || '').toLowerCase();
      const email = (u?.email || '').toLowerCase();
      const bySearch = !q || name.includes(q) || phone.includes(q) || email.includes(q);
      const byMethod = methodFilter === 'all' || p.method === methodFilter;
      return bySearch && byMethod;
    });
  }, [payments, userMap, search, methodFilter]);

  // Reset to first page when filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, methodFilter]);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + filtered.length;
  const paginated = filtered;

  const openAdd = () => {
    setEditing(null);
    setForm({ userId: '', amount: '', date: new Date().toISOString().slice(0,10), time: new Date().toTimeString().slice(0,5), method: 'cash', notes: '' });
    setModalOpen(true);
  };

  const openEdit = (p: Payment) => {
    setEditing(p);
    const d = new Date(p.date);
    setForm({ userId: p.userId, amount: String(p.amount), date: d.toISOString().slice(0,10), time: d.toTimeString().slice(0,5), method: p.method, notes: p.notes || '' });
    setModalOpen(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const dateTime = new Date(form.date + 'T' + (form.time || '00:00'));
      const payload: any = { userId: form.userId, amount: Number(form.amount), date: dateTime, method: form.method, notes: form.notes };
      // إذا كنا أوفلاين وننشئ دفعة جديدة: خزّن محليًا وسيتم مزامنتها تلقائيًا عند عودة الاتصال
      if (typeof navigator !== 'undefined' && !navigator.onLine && !editing) {
        const clientUuid = `${form.userId}-${Date.now()}`;
        await queuePayment({ clientUuid, ...payload });
        // إغلاق المودال وإبلاغ المستخدم بشكل بسيط
        setModalOpen(false);
        setEditing(null);
        setOfflineAlertOpen(true);
        return;
      }
      if (editing) {
        const updated = await paymentSvc.updatePayment(editing._id, payload);
        setPayments(prev => prev.map(x => x._id === editing._id ? updated : x));
      } else {
        const created = await paymentSvc.createPayment(payload);
        setPayments(prev => [created, ...prev]);
      }
      setModalOpen(false);
      setEditing(null);
      // Refresh the list from server (keeps pagination accurate)
      await load(currentPage);
    } catch (e: any) {
      alert(e?.message || 'فشل الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const removePayment = async (id: string) => {
    setDeletingId(id);
    try {
      await paymentSvc.deletePayment(id);
      // Refresh to keep pagination/total accurate
      await load(currentPage);
    } catch (e: any) {
      alert(e?.message || 'فشل الحذف');
    } finally {
      setDeletingId(null);
    }
  };

  const openConfirm = (id: string) => {
    setConfirmId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!confirmId) return;
    const id = confirmId;
    setConfirmOpen(false);
    setConfirmId(null);
    await removePayment(id);
  };

  // تصدير البيانات إلى Excel
  const handleExportToExcel = () => {
    const exportData = filtered.map((payment) => {
      const user = userMap[payment.userId];
      const dateObj = new Date(payment.date);
      return {
        'اسم المستخدم': user?.name || '---',
        'رقم الهاتف': user?.phone || '-',
        'الإيميل': user?.email || '-',
        'المبلغ': payment.amount,
        'التاريخ': dateObj.toLocaleDateString('en-GB'),
        'الساعة': dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        'طريقة الدفع': payment.method === 'cash' ? 'نقدي' : payment.method === 'card' ? 'بطاقة' : payment.method === 'bank_transfer' ? 'تحويل بنكي' : 'أخرى',
        'ملاحظات': payment.notes || '-'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'المدفوعات');
    
    // تصدير الملف
    const fileName = `المدفوعات_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const handleFormChange = (field: string, value: string) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
           <VideoTutorial 
            videoId="x0qzYkkay_w"
            title="سجل مدفوعات العميل وتحكم فيها بالكامل" 
            position="bottom-right"
            buttonText="شرح"
           />
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">المدفوعات</h3>
        <PaymentFilters
          search={search}
          methodFilter={methodFilter}
          onSearchChange={setSearch}
          onMethodFilterChange={setMethodFilter}
          onExportToExcel={handleExportToExcel}
          onAddPayment={openAdd}
          canEdit={canEdit}
          filteredCount={filtered.length}
        />
      </div>

      {loading ? (
        <div className="text-gray-500 dark:text-gray-400">جارٍ التحميل...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <PaymentTable
          payments={paginated}
          userMap={userMap}
          canEdit={canEdit}
          deletingId={deletingId}
          onEdit={openEdit}
          onDelete={openConfirm}
          startIndex={startIndex}
          pageSize={pageSize}
          totalPayments={totalPayments}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      <PaymentModal
        isOpen={modalOpen}
        editing={editing}
        form={form}
        users={users}
        saving={saving}
        onClose={() => setModalOpen(false)}
        onSubmit={e => { e.preventDefault(); save(); }}
        onFormChange={handleFormChange}
      />

      <DeleteConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
      />

      <OfflineAlertModal
        isOpen={offlineAlertOpen}
        onClose={() => setOfflineAlertOpen(false)}
      />
    </div>
  );
};

export default AdminPayments;
