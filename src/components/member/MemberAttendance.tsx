'use client';

import React, { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { useAuth } from '@/hooks/useAuth';
import { AttendanceService } from '@/services/attendanceService';
import type { AttendanceRecord } from '@/types/models';

const MemberAttendance = () => {
  const { user, isAuthenticated } = useAuth();
  const svc = useMemo(() => new AttendanceService(), []);
  const currentUserId = useMemo(() => ((user as any)?._id ?? user?.id ?? ''), [user]);

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const itemsPerPage = 10;

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addForm, setAddForm] = useState<any>({ date: '', time: '', status: 'present', notes: '' });

  const load = async (page: number = currentPage) => {
    if (!currentUserId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await svc.getUserAttendance(currentUserId, { page, limit: itemsPerPage });
      const data = Array.isArray(res) ? res : (res?.data || []);
      setRecords(data);
      
      // Update pagination info
      if (res && typeof res === 'object' && 'total' in res) {
        const total = res.total as number;
        setTotalRecords(total);
        setTotalPages(Math.ceil(total / itemsPerPage));
      } else {
        // Fallback if API doesn't return total count
        setTotalRecords(data.length);
        setTotalPages(Math.ceil(data.length / itemsPerPage));
      }
    } catch (e: any) {
      setError(e?.message || 'تعذر جلب سجلات الحضور');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && currentUserId) load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, currentUserId]);

  const openAddModal = () => {
    const now = new Date();
    setAddForm({
      date: now.toISOString().slice(0, 10),
      time: now.toTimeString().slice(0, 5),
      status: 'present',
      notes: ''
    });
    setAddModalOpen(true);
  };

  const handleAddSave = async () => {
    if (!currentUserId) return;
    setAdding(true);
    try {
      const dateTime = new Date(addForm.date + 'T' + addForm.time);
      const created = await svc.createAttendanceRecord({
        userId: currentUserId,
        date: dateTime,
        status: addForm.status,
        notes: addForm.notes,
      });
      // Reload current page to show updated data
      await load(currentPage);
      setAddModalOpen(false);
    } catch (e: any) {
      alert(e?.message || 'فشل الإضافة');
    } finally {
      setAdding(false);
    }
  };

  // Pagination handlers
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      load(page);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const getStatusArabic = (status: string) => (
    status === 'present' ? 'حاضر' : status === 'absent' ? 'غائب' : 'بعذر'
  );

  const exportToExcel = () => {
    try {
      const rows = (records || []).map((rec) => {
        const d = new Date(rec.date);
        const dateStr = d.toLocaleDateString();
        const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return {
          'التاريخ': dateStr,
          'الساعة': timeStr,
          'الحالة': getStatusArabic(rec.status as any),
          'ملاحظات': rec.notes || ''
        } as Record<string, string>;
      });

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'الحضور');

      const today = new Date();
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, '0');
      const d = String(today.getDate()).padStart(2, '0');
      const fileName = `attendance_${y}-${m}-${d}.xlsx`;

      XLSX.writeFile(wb, fileName);
    } catch (e) {
      // no-op
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">سجلات حضوري</h3>
        <div className="flex items-center gap-2">
          <button onClick={exportToExcel} className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm">تصدير</button>
          {/* <button onClick={openAddModal} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm">إضافة سجل</button> */}
        </div>
      </div>

      {loading ? (
        <div className="text-gray-500 dark:text-gray-400">جارٍ التحميل...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div>
          {records.length === 0 ? (
            <div className="text-center py-4 text-gray-400">لا توجد سجلات حضور.</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {records.map((rec) => {
                const d = new Date(rec.date);
                return (
                  <div
                    key={rec._id}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg shadow p-4 flex flex-col gap-2 border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">التاريخ</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{d.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">الساعة</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">الحالة</span>
                      <span className={`font-semibold ${rec.status === 'present' ? 'text-emerald-600' : rec.status === 'absent' ? 'text-red-600' : 'text-gray-500'}`}>
                        {rec.status === 'present' ? 'حاضر' : rec.status === 'absent' ? 'غائب' : 'بعذر'}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-400">ملاحظات:</span>
                      <div className="text-gray-800 dark:text-gray-200 text-sm mt-1 min-h-[1.5em]">{rec.notes || '-'}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                السابق
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`px-3 py-2 rounded-md text-sm ${
                        currentPage === pageNum
                          ? 'bg-gray-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                التالي
              </button>
            </div>
          )}
          
          {/* Pagination Info */}
          {totalRecords > 0 && (
            <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
              عرض {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalRecords)} من {totalRecords} سجل
            </div>
          )}
        </div>
      )}

      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4 p-6 relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">إضافة سجل حضور</h2>
              <button onClick={() => setAddModalOpen(false)} className="text-white bg-gray-700 hover:bg-gray-900 text-xl absolute left-4 top-4 rounded-full w-8 h-8 flex items-center justify-center">×</button>
            </div>
            <form onSubmit={e => { e.preventDefault(); handleAddSave(); }} className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">التاريخ</label>
                  <input type="date" className="w-full border rounded p-2 bg-gray-800 text-white focus:bg-gray-900 focus:text-white cursor-pointer"
                    value={addForm.date}
                    onChange={e => setAddForm((prev: typeof addForm) => ({ ...prev, date: e.target.value }))}
                    required onFocus={e => e.target.showPicker && e.target.showPicker()} />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">الساعة</label>
                  <input type="time" className="w-full border rounded p-2 bg-gray-800 text-white focus:bg-gray-900 focus:text-white cursor-pointer"
                    value={addForm.time}
                    onChange={e => setAddForm((prev: typeof addForm) => ({ ...prev, time: e.target.value }))}
                    required onFocus={e => e.target.showPicker && e.target.showPicker()} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الحالة</label>
                <select className="w-full border rounded p-2 bg-gray-800 text-white focus:bg-gray-900 focus:text-white"
                  value={addForm.status}
                  onChange={e => setAddForm((prev: typeof addForm) => ({ ...prev, status: e.target.value }))}
                  required>
                  <option value="present">حاضر</option>
                  <option value="absent">غائب</option>
                  <option value="excused">بعذر</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ملاحظات</label>
                <textarea className="w-full border rounded p-2 bg-gray-800 text-white focus:bg-gray-900 focus:text-white"
                  value={addForm.notes}
                  onChange={e => setAddForm((prev: typeof addForm) => ({ ...prev, notes: e.target.value }))} />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-900" onClick={() => setAddModalOpen(false)} disabled={adding}>إلغاء</button>
                <button type="submit" className="px-4 py-2 rounded bg-gray-600 text-white" disabled={adding}>{adding ? 'جارٍ الحفظ...' : 'حفظ'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberAttendance;


