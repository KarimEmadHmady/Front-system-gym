'use client';

import React, { useEffect, useState } from 'react';
import { AttendanceService } from '@/services/attendanceService';
import type { AttendanceRecord } from '@/types/models';
import { UserService } from '@/services/userService';
import type { User } from '@/types/models';
import * as XLSX from 'xlsx';
import VideoTutorial from '../VideoTutorial';

const AdminAttendance = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [usersById, setUsersById] = useState<Record<string, User>>({});
  const [usersForSelect, setUsersForSelect] = useState<User[]>([]);
  const notFoundUserIdsRef = React.useRef<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<AttendanceRecord | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState<any>({ userId: '', date: '', time: '', status: 'present', notes: '' });
  const [adding, setAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [addUserQuery, setAddUserQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const attendanceRes = await new AttendanceService().getAttendanceRecords({ page: currentPage, limit: pageSize });
        const pageRecords: AttendanceRecord[] = (attendanceRes as any)?.data || [];
        const pagination = (attendanceRes as any)?.pagination || {};
        setRecords(pageRecords);
        setTotalRecords(Number(pagination.total ?? pageRecords.length ?? 0));
        setTotalPages(Number(pagination.totalPages ?? 1) || 1);

        // Load only users needed for this page's records
        const userIds = Array.from(new Set(pageRecords.map(r => r.userId).filter(Boolean))) as string[];
        const missing = userIds.filter((id) => !usersById[id] && !notFoundUserIdsRef.current.has(id));
        if (missing.length > 0) {
          const userSvc = new UserService();
          const fetched = await Promise.all(
            missing.map((id) =>
              userSvc
                .getUser(id)
                .then((u) => ({ id, user: u as any }))
                .catch(() => ({ id, user: null as any }))
            )
          );

          setUsersById((prev) => {
            const next: Record<string, User> = { ...prev };
            fetched.forEach(({ id, user }) => {
              if (user && user._id) {
                next[user._id] = user;
              } else {
                notFoundUserIdsRef.current.add(id);
              }
            });
            return next;
          });
        }
      } catch (e: any) {
        setError(e?.message || 'تعذر جلب البيانات');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

  // خريطة userId => بيانات العضو
  const userMap = React.useMemo(() => {
    return usersById;
  }, [usersById]);

  // حذف سجل حضور
  const handleDelete = async (id: string) => {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  };

  // فتح مودال التعديل
  const openEditModal = (rec: AttendanceRecord) => {
    setEditRecord(rec);
    setEditForm({
      userId: rec.userId,
      date: new Date(rec.date).toISOString().slice(0, 10),
      time: new Date(rec.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: rec.status,
      notes: rec.notes || '',
    });
    setEditModalOpen(true);
  };

  // حفظ التعديلات
  const handleEditSave = async () => {
    if (!editRecord) return;
    setSaving(true);
    try {
      // دمج التاريخ والوقت
      const dateTime = new Date(editForm.date + 'T' + editForm.time);
      const updated = await new AttendanceService().updateAttendanceRecord(editRecord._id, {
        userId: editForm.userId,
        date: dateTime,
        status: editForm.status,
        notes: editForm.notes,
      });
      setRecords(prev => prev.map(r => r._id === editRecord._id ? { ...r, ...updated } : r));
      setEditModalOpen(false);
      setEditRecord(null);
    } catch (e: any) {
      alert(e?.message || 'فشل التعديل');
    } finally {
      setSaving(false);
    }
  };

  // فتح مودال الإضافة
  const openAddModal = () => {
    setAddForm({ userId: '', date: '', time: '', status: 'present', notes: '' });
    setAddUserQuery('');
    setAddModalOpen(true);
  };

  // حفظ سجل جديد
  const handleAddSave = async () => {
    setAdding(true);
    try {
      const dateTime = new Date(addForm.date + 'T' + addForm.time);
      const created = await new AttendanceService().createAttendanceRecord({
        userId: addForm.userId,
        date: dateTime,
        status: addForm.status,
        notes: addForm.notes,
      });
      // Optimistic: add to current page list
      setRecords(prev => [created, ...prev].slice(0, pageSize));
      setAddModalOpen(false);
    } catch (e: any) {
      alert(e?.message || 'فشل الإضافة');
    } finally {
      setAdding(false);
    }
  };

  // فلترة السجلات حسب البحث في اسم أو هاتف العضو
  const filteredRecords = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return records;
    return records.filter((rec) => {
      const user = userMap[rec.userId];
      const name = (user?.name || '').toLowerCase();
      const phone = (user?.phone || '').toLowerCase();
      return name.includes(query) || phone.includes(query);
    });
  }, [records, userMap, searchQuery]);

  // إعادة الصفحة للأولى عند تغير البحث
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // With server-side pagination, we display current page records.
  const pageCount = totalPages;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalRecords);
  const paginatedRecords = filteredRecords;

  // فلترة قائمة المستخدمين في مودال الإضافة
  const filteredAddUsers = React.useMemo(() => {
    const q = addUserQuery.trim().toLowerCase();
    if (!q) return usersForSelect;
    return usersForSelect.filter(u => (u.name || '').toLowerCase().includes(q) || (u.phone || '').toLowerCase().includes(q));
  }, [usersForSelect, addUserQuery]);

  // Lazy-load users list for add/edit selects (avoid loading 1000 users on tab open)
  useEffect(() => {
    const shouldLoad = addModalOpen || editModalOpen;
    if (!shouldLoad) return;
    if (usersForSelect.length > 0) return;

    (async () => {
      try {
        const res = await new UserService().getUsers({ page: 1, limit: 200, sortBy: 'name', sortOrder: 'asc' } as any);
        const arr: User[] = (res as any)?.data || [];
        setUsersForSelect(arr);
      } catch {
        setUsersForSelect([]);
      }
    })();
  }, [addModalOpen, editModalOpen, usersForSelect.length]);

  // تصدير البيانات إلى Excel
  const handleExportToExcel = () => {
    const exportData = filteredRecords.map((rec) => {
      const user = userMap[rec.userId];
      const dateObj = new Date(rec.date);
      return {
        'اسم العضو': user?.name || '---',
        'رقم الهاتف': user?.phone || '-',
        'التاريخ': dateObj.toLocaleDateString('en-GB'),
        'الساعة': dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        'الحالة': rec.status === 'present' ? 'حاضر' : rec.status === 'absent' ? 'غائب' : 'بعذر',
        'ملاحظات': rec.notes || '-'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'سجلات الحضور');
    
    // تصدير الملف
    const fileName = `سجلات_الحضور_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      
     <VideoTutorial 
      videoId="3twvHJa2A6k"
      title="تابع حضور الأعضاء والمدربين بسهولة " 
      position="bottom-right"
      buttonText="شرح"
     />
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 md:mb-0">سجلات الحضور</h3>
        <div className="flex flex-col md:flex-row items-stretch gap-2 w-full md:w-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بالاسم أو رقم الهاتف"
            className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 w-full md:w-auto"
          />
          <button
            className="px-4 flex justify-center py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm flex items-center gap-1 w-full md:w-auto"
            onClick={handleExportToExcel}
            disabled={filteredRecords.length === 0}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            تصدير Excel
          </button>
          <button
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm w-full md:w-auto"
            onClick={openAddModal}
          >
            إضافة سجل
          </button>
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
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase ">اسم العضو</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase ">رقم الهاتف</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase ">التاريخ</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase ">الساعة</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase ">الحالة</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase ">ملاحظات</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-400 text-center">لا توجد سجلات حضور.</td>
                </tr>
              ) : (
                paginatedRecords.map((rec) => {
                  const user = userMap[rec.userId];
                  const dateObj = new Date(rec.date);
                  return (
                    <tr key={rec._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-2 whitespace-nowrap text-center">{user?.name || '---'}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-center">{user?.phone || '-'}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-center">{dateObj.toLocaleDateString()}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-center">{dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-center">
                        {rec.status === 'present' ? 'حاضر' : rec.status === 'absent' ? 'غائب' : 'بعذر'}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-center">{rec.notes || '-'}</td>
                      <td className="px-4 py-2 whitespace-nowrap flex gap-2">
                        <button
                          className="px-2 py-1 rounded bg-gray-200 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900 text-xs transition-colors"
                          onClick={() => openEditModal(rec)}
                        >
                          تعديل
                        </button>
                        <button
                          className="px-2 py-1 rounded bg-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 text-xs transition-colors disabled:opacity-50"
                          onClick={() => handleDelete(rec._id)}
                          disabled={deletingId === rec._id}
                        >
                          {deletingId === rec._id ? 'جارٍ الحذف...' : 'حذف'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          {filteredRecords.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 text-sm text-gray-700 dark:text-gray-300">
              <div>
                عرض {Math.min(startIndex + 1, totalRecords)} إلى {endIndex} من {totalRecords} نتيجة
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1 rounded border border-gray-300 dark:border-gray-700 disabled:opacity-50"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  السابق
                </button>
                <span>
                  صفحة {currentPage} من {pageCount}
                </span>
                <button
                  className="px-3 py-1 rounded border border-gray-300 dark:border-gray-700 disabled:opacity-50"
                  onClick={() => setCurrentPage(p => Math.min(pageCount, p + 1))}
                  disabled={currentPage === pageCount}
                >
                  التالي
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal التعديل (Pure React) */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4 p-6 relative animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">تعديل سجل الحضور</h2>
              <button onClick={() => setEditModalOpen(false)} className="text-white hover:text-red-500  text-xl absolute right-4 top-4 w-8 h-8 flex items-center justify-center transition-colors duration-150">×</button>
            </div>
            <form onSubmit={e => { e.preventDefault(); handleEditSave(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">العضو</label>
                <select
                  className="w-full border rounded p-2 bg-gray-800 text-white focus:bg-gray-900 focus:text-white"
                  value={editForm.userId}
                  onChange={e => setEditForm((prev: typeof editForm) => ({ ...prev, userId: e.target.value }))}
                  required
                >
                  <option value="">اختر العضو</option>
                  {usersForSelect.map(u => (
                    <option key={u._id} value={u._id}>{u.name} ({u.phone || '-'})</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">التاريخ</label>
                  <input
                    type="date"
                    className="w-full border rounded p-2 bg-gray-800 text-white focus:bg-gray-900 focus:text-white cursor-pointer"
                    value={editForm.date}
                    onChange={e => setEditForm((prev: typeof editForm) => ({ ...prev, date: e.target.value }))}
                    required
                    onFocus={e => e.target.showPicker && e.target.showPicker()}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">الساعة</label>
                  <input
                    type="time"
                    className="w-full border rounded p-2 bg-gray-800 text-white focus:bg-gray-900 focus:text-white cursor-pointer"
                    value={editForm.time}
                    onChange={e => setEditForm((prev: typeof editForm) => ({ ...prev, time: e.target.value }))}
                    required
                    onFocus={e => e.target.showPicker && e.target.showPicker()}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الحالة</label>
                <select
                  className="w-full border rounded p-2 bg-gray-800 text-white focus:bg-gray-900 focus:text-white"
                  value={editForm.status}
                  onChange={e => setEditForm((prev: typeof editForm) => ({ ...prev, status: e.target.value }))}
                  required
                >
                  <option value="present">حاضر</option>
                  <option value="absent">غائب</option>
                  <option value="excused">بعذر</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ملاحظات</label>
                <textarea
                  className="w-full border rounded p-2 bg-gray-800 text-white focus:bg-gray-900 focus:text-white"
                  value={editForm.notes}
                  onChange={e => setEditForm((prev: typeof editForm) => ({ ...prev, notes: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-900" onClick={() => setEditModalOpen(false)} disabled={saving}>إلغاء</button>
                <button type="submit" className="px-4 py-2 rounded bg-gray-600 text-white" disabled={saving}>{saving ? 'جارٍ الحفظ...' : 'حفظ'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal الإضافة (نفس فورم التعديل لكن addForm/addModalOpen) */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4 p-6 relative animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">إضافة سجل حضور</h2>
              <button onClick={() => setAddModalOpen(false)} className="text-white hover:text-red-500 text-xl absolute right-4 top-4 w-8 h-8 flex items-center justify-center transition-colors duration-150">×</button>
            </div>
            <form onSubmit={e => { e.preventDefault(); handleAddSave(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">العضو</label>
                <input
                  type="text"
                  value={addUserQuery}
                  onChange={(e) => setAddUserQuery(e.target.value)}
                  placeholder="ابحث بالاسم أو رقم الهاتف"
                  className="w-full border rounded p-2 mb-2 bg-gray-800 text-white focus:bg-gray-900 focus:text-white"
                />
                <select
                  className="w-full border rounded p-2 bg-gray-800 text-white focus:bg-gray-900 focus:text-white"
                  value={addForm.userId}
                  onChange={e => setAddForm((prev: typeof addForm) => ({ ...prev, userId: e.target.value }))}
                  required
                >
                  <option value="">اختر العضو</option>
                  {filteredAddUsers.map(u => (
                    <option key={u._id} value={u._id}>{u.name} ({u.phone || '-'})</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">التاريخ</label>
                  <input
                    type="date"
                    className="w-full border rounded p-2 bg-gray-800 text-white focus:bg-gray-900 focus:text-white cursor-pointer"
                    value={addForm.date}
                    onChange={e => setAddForm((prev: typeof addForm) => ({ ...prev, date: e.target.value }))}
                    required
                    onFocus={e => e.target.showPicker && e.target.showPicker()}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">الساعة</label>
                  <input
                    type="time"
                    className="w-full border rounded p-2 bg-gray-800 text-white focus:bg-gray-900 focus:text-white cursor-pointer"
                    value={addForm.time}
                    onChange={e => setAddForm((prev: typeof addForm) => ({ ...prev, time: e.target.value }))}
                    required
                    onFocus={e => e.target.showPicker && e.target.showPicker()}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الحالة</label>
                <select
                  className="w-full border rounded p-2 bg-gray-800 text-white focus:bg-gray-900 focus:text-white"
                  value={addForm.status}
                  onChange={e => setAddForm((prev: typeof addForm) => ({ ...prev, status: e.target.value }))}
                  required
                >
                  <option value="present">حاضر</option>
                  <option value="absent">غائب</option>
                  <option value="excused">بعذر</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ملاحظات</label>
                <textarea
                  className="w-full border rounded p-2 bg-gray-800 text-white focus:bg-gray-900 focus:text-white"
                  value={addForm.notes}
                  onChange={e => setAddForm((prev: typeof addForm) => ({ ...prev, notes: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-900" onClick={() => setAddModalOpen(false)} disabled={adding}>إلغاء</button>
                <button type="submit" className="px-4 py-2 rounded bg-gray-600 text-white" disabled={adding}>{adding ? 'جارٍ الحفظ...' : 'حفظ'}</button>
              </div>
            </form>
          </div>
      </div>
      )}
      {/* Delete Confirmation Popup */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => { if (!deletingId) { setConfirmOpen(false); setPendingDeleteId(null); } }} />
          <div className="relative z-10 bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-200 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 9v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M10.29 3.86l-8.48 14.7A2 2 0 0 0 3.48 21h17.04a2 2 0 0 0 1.72-3.44l-8.48-14.7a2 2 0 0 0-3.47 0Z" stroke="currentColor" strokeWidth="2"/></svg>
              </div>
              <div className="flex-1">
                <div className="text-base font-semibold text-gray-900 dark:text-white">تأكيد الحذف</div>
                <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">هل أنت متأكد أنك تريد حذف هذا السجل؟ لا يمكن التراجع عن هذه العملية.</div>
              </div>
              <button onClick={() => { if (!deletingId) { setConfirmOpen(false); setPendingDeleteId(null); } }} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => { if (!deletingId) { setConfirmOpen(false); setPendingDeleteId(null); } }} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-700">إلغاء</button>
              <button onClick={async () => {
                if (!pendingDeleteId) return;
                setDeletingId(pendingDeleteId);
                try {
                  await new AttendanceService().deleteAttendanceRecord(pendingDeleteId);
                  setRecords(prev => prev.filter(r => r._id !== pendingDeleteId));
                } catch (e: any) {
                  // يمكن إضافة توست لاحقًا
                } finally {
                  setDeletingId(null);
                  setPendingDeleteId(null);
                  setConfirmOpen(false);
                }
              }} disabled={!!deletingId} className="px-4 py-2 rounded text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400">
                {deletingId ? 'جارٍ الحذف...' : 'تأكيد الحذف'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAttendance;


