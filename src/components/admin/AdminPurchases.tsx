'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { PurchaseService, type PurchaseDTO } from '@/services/purchaseService';
import { UserService } from '@/services/userService';
import type { User } from '@/types/models';
import { useAuth } from '@/hooks/useAuth';
import * as XLSX from 'xlsx';
import VideoTutorial from '../VideoTutorial';

const AdminPurchases = () => {
  const { user } = useAuth();
  const role = user?.role;
  const canDeleteOrEdit = role === 'admin';

  const purchaseSvc = useMemo(() => new PurchaseService(), []);
  const userSvc = useMemo(() => new UserService(), []);

  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [purchases, setPurchases] = useState<PurchaseDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPurchases, setTotalPurchases] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<PurchaseDTO | null>(null);
  const formatForDateTimeLocal = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };
  const [form, setForm] = useState<{ itemName: string; price: string; date: string }>({ itemName: '', price: '', date: formatForDateTimeLocal(new Date()) });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await userSvc.getUsers({ page: 1, limit: 1000 });
        const arr = Array.isArray(res) ? (res as any) : (res as any)?.data || [];
        setUsers(arr);
      } catch (e: any) {
        // ignore silently
      }
    })();
  }, [userSvc]);

  const load = async (userId?: string, page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = userId
        ? await purchaseSvc.getPurchasesByUser(userId, { page, limit: pageSize, sortBy: 'date', sortOrder: 'desc' } as any)
        : await purchaseSvc.getPurchases({ page, limit: pageSize, sortBy: 'date', sortOrder: 'desc' } as any);

      const arr: PurchaseDTO[] = (res as any)?.data || [];
      setPurchases(arr);
      setTotalPurchases(Number((res as any)?.pagination?.total ?? arr.length ?? 0));
      setTotalPages(Math.max(1, Number((res as any)?.pagination?.totalPages ?? 1)));
    } catch (e: any) {
      setError(e?.message || 'تعذر جلب المشتريات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedUserId, search]);

  useEffect(() => {
    load(selectedUserId || undefined, currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUserId, currentPage]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return purchases.filter(p => !q || (p.itemName || '').toLowerCase().includes(q) || String(p.price).includes(q));
  }, [purchases, search]);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalPurchases);
  const paginated = filtered;

  // تصدير البيانات إلى Excel
  const handleExportToExcel = () => {
    const exportData = filtered.map((purchase) => {
      const d = purchase.date ? new Date(purchase.date) : (purchase.createdAt ? new Date(purchase.createdAt) : null);
      return {
        'اسم العنصر': purchase.itemName,
        'السعر': purchase.price,
        'التاريخ': d ? d.toLocaleDateString('en-GB') : '-',
        'الساعة': d ? d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '-',
        'المستخدم': selectedUserId ? users.find(u => u._id === selectedUserId)?.name || '---' : 'جميع المستخدمين'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'المشتريات');
    
    // تصدير الملف
    const fileName = `المشتريات_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
       <VideoTutorial 
        videoId="I9udVXBst10"
        title=" سجل مشتريات العميل وشوفها من التطبيق بسهولة" 
         position="bottom-right"
        buttonText="شرح"
       />
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">المشتريات</h3>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-[4px] text-sm"
            value={selectedUserId}
            onChange={e=>setSelectedUserId(e.target.value)}
          >
            <option value="">اختر المستخدم</option>
            {users.map(u => (
              <option key={u._id} value={u._id}>{u.name} {u.phone ? `(${u.phone})` : ''}</option>
            ))}
          </select>
          <input
            value={search}
            onChange={e=>setSearch(e.target.value)}
            placeholder="ابحث باسم العنصر/السعر"
            className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm"
          />
          <button
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm flex items-center gap-1"
            onClick={handleExportToExcel}
            disabled={filtered.length === 0}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            تصدير Excel
          </button>
          {selectedUserId && (
            <button onClick={()=>{ setEditing(null); setForm({ itemName: '', price: '', date: formatForDateTimeLocal(new Date()) }); setModalOpen(true); }} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm">إضافة مشتري</button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-gray-500 dark:text-gray-400">جارٍ التحميل...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">العنصر</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">السعر</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                {canDeleteOrEdit && <th className="px-4 py-2"></th>}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={canDeleteOrEdit ? 4 : 3} className="text-center py-4 text-gray-400">لا توجد مشتريات.</td></tr>
              ) : paginated.map(p => {
                const d = p.date ? new Date(p.date) : (p.createdAt ? new Date(p.createdAt) : null);
                return (
                  <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-2 whitespace-nowrap text-center">{p.itemName}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-center">{p.price}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-center">{d ? `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}` : '-'}</td>
                    {canDeleteOrEdit && (
                      <td className="px-4 py-2 whitespace-nowrap flex gap-2">
                        <button className="px-2 py-1 rounded bg-gray-200 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900 text-xs" onClick={()=>{ setEditing(p); const d = p.date ? new Date(p.date) : (p.createdAt ? new Date(p.createdAt) : new Date()); setForm({ itemName: p.itemName, price: String(p.price), date: formatForDateTimeLocal(d) }); setModalOpen(true); }}>تعديل</button>
                        <button className="px-2 py-1 rounded bg-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 text-xs disabled:opacity-50" onClick={()=>{ setConfirmId(p._id); setConfirmOpen(true); }} disabled={deletingId===p._id}>{deletingId===p._id?'جارٍ الحذف...':'حذف'}</button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 text-sm text-gray-700 dark:text-gray-300">
              <div>
                عرض {totalPurchases === 0 ? 0 : startIndex + 1} إلى {endIndex} من {totalPurchases} نتيجة
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  className="px-3 py-1 rounded border border-gray-300 dark:border-gray-700 disabled:opacity-50"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  السابق
                </button>
                <span>
                  صفحة {currentPage} من {totalPages}
                </span>
                <button
                  className="px-3 py-1 rounded border border-gray-300 dark:border-gray-700 disabled:opacity-50"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  التالي
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4 p-6 relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">إضافة مشتري</h2>
              <button className="text-white hover:text-red-500 text-xl absolute right-4 top-4 w-8 h-8 flex items-center justify-center" onClick={()=>setModalOpen(false)}>×</button>
            </div>
            <form onSubmit={async e=>{e.preventDefault(); if(!selectedUserId && !editing) return; setSaving(true); try { const payload = { userId: selectedUserId || editing?.userId || '', itemName: form.itemName.trim(), price: Number(form.price), date: form.date ? new Date(form.date).toISOString() : undefined }; if (editing) { await purchaseSvc.updatePurchase(editing._id, payload as any); } else { await purchaseSvc.createPurchase(payload as any); setCurrentPage(1); } setModalOpen(false); setEditing(null); await load(selectedUserId || undefined, editing ? currentPage : 1); } catch (e:any){ alert(e?.message || 'فشل الحفظ'); } finally { setSaving(false); } }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">العنصر</label>
                <input className="w-full border rounded p-2 bg-gray-800 text-white" value={form.itemName} onChange={e=>setForm(prev=>({ ...prev, itemName: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">السعر</label>
                <input type="number" min={0} step="0.01" className="w-full border rounded p-2 bg-gray-800 text-white" value={form.price} onChange={e=>setForm(prev=>({ ...prev, price: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">التاريخ والوقت</label>
                <input type="datetime-local" onClick={(e) => e.currentTarget.showPicker?.()}  className="w-full border rounded p-2 bg-gray-800 text-white" value={form.date} onChange={e=>setForm(prev=>({ ...prev, date: e.target.value }))} />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-900" onClick={()=>setModalOpen(false)} disabled={saving}>إلغاء</button>
                <button type="submit" className="px-4 py-2 rounded bg-gray-600 text-white" disabled={saving || (!selectedUserId && !editing)}>{saving ? 'جارٍ الحفظ...' : (editing ? 'حفظ التعديلات' : 'حفظ')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={()=>setConfirmOpen(false)}></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-sm p-6 z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xl">!</div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">تأكيد الحذف</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">هل أنت متأكد من حذف هذه العملية؟ لا يمكن التراجع عن هذا الإجراء.</p>
            <div className="flex items-center justify-end gap-2">
              <button onClick={()=>setConfirmOpen(false)} className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">إلغاء</button>
              <button onClick={async ()=>{ if(!confirmId) return; setConfirmOpen(false); setDeletingId(confirmId); try { await purchaseSvc.deletePurchase(confirmId); const nextPage = currentPage > 1 && purchases.length <= 1 ? currentPage - 1 : currentPage; if (nextPage !== currentPage) setCurrentPage(nextPage); await load(selectedUserId || undefined, nextPage); } catch(e:any){ alert(e?.message || 'فشل الحذف'); } finally { setDeletingId(null); } }} className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white">تأكيد الحذف</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPurchases;


