'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AttendanceService } from '@/services/attendanceService';
import { UserService } from '@/services/userService';
import type { AttendanceRecord, User } from '@/types/models';
import { ChevronLeft, ChevronRight, Calendar, Clock, UserCheck, FileText, Plus, Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

const TrainerAttendance = () => {
  const { user, isAuthenticated } = useAuth();
  const attendanceSvc = useMemo(() => new AttendanceService(), []);
  const userSvc = useMemo(() => new UserService(), []);
  const currentUserId = useMemo(() => ((user as any)?._id ?? user?.id ?? ''), [user]);

  const [myRecords, setMyRecords] = useState<AttendanceRecord[]>([]);
  const [clientRecords, setClientRecords] = useState<AttendanceRecord[]>([]);
  const [clients, setClients] = useState<User[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination states
  const [myRecordsPage, setMyRecordsPage] = useState(1);
  const [clientRecordsPage, setClientRecordsPage] = useState(1);
  const itemsPerPage = 10;

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addForm, setAddForm] = useState<any>({ date: '', time: '', status: 'present', notes: '' });

  const loadMy = async () => {
    if (!currentUserId) return;
    try {
      const res = await attendanceSvc.getUserAttendance(currentUserId, { page: 1, limit: 200 });
      const data = Array.isArray(res) ? res : (res?.data || []);
      setMyRecords((data || []).filter(r => r.userId === currentUserId));
    } catch (e) {}
  };

  const loadClients = async () => {
    try {
      const membersRes: any = await userSvc.getUsersByRole('member', { page: 1, limit: 1000 } as any);
      const arr = Array.isArray(membersRes) ? membersRes : (membersRes?.data || []);
      const normalizeId = (val: any): string => {
        if (!val) return '';
        if (typeof val === 'string') return val;
        if (typeof val === 'object') return (val._id || val.id || '') as string;
        return String(val);
      };
      const me = normalizeId(currentUserId);
      const filtered = (arr || []).filter((m: any) => normalizeId(m?.trainerId) === me);
      setClients(filtered);
    } catch (e) {
      setClients([]);
    }
  };

  const loadClientRecords = async (clientId: string) => {
    if (!clientId) { setClientRecords([]); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await attendanceSvc.getUserAttendance(clientId, { page: 1, limit: 200 });
      setClientRecords(Array.isArray(res) ? res : (res?.data || []));
    } catch (e: any) {
      setError(e?.message || 'تعذر جلب سجلات العميل');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && currentUserId) {
      loadMy();
      loadClients();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, currentUserId]);

  const openAddModal = () => {
    const now = new Date();
    setAddForm({ date: now.toISOString().slice(0,10), time: now.toTimeString().slice(0,5), status: 'present', notes: '' });
    setAddModalOpen(true);
  };

  const handleAddSave = async () => {
    if (!currentUserId) return;
    setAdding(true);
    try {
      const dateTime = new Date(addForm.date + 'T' + addForm.time);
      const created = await attendanceSvc.createAttendanceRecord({
        userId: currentUserId,
        date: dateTime,
        status: addForm.status,
        notes: addForm.notes,
      });
      setMyRecords(prev => [created, ...prev]);
      setAddModalOpen(false);
    } catch (e: any) {
      alert(e?.message || 'فشل الإضافة');
    } finally {
      setAdding(false);
    }
  };

  // حساب البيانات للصفحات
  const myRecordsTotalPages = Math.ceil(myRecords.length / itemsPerPage);
  const myRecordsStartIndex = (myRecordsPage - 1) * itemsPerPage;
  const myRecordsEndIndex = myRecordsStartIndex + itemsPerPage;
  const currentMyRecords = myRecords.slice(myRecordsStartIndex, myRecordsEndIndex);

  const clientRecordsTotalPages = Math.ceil(clientRecords.length / itemsPerPage);
  const clientRecordsStartIndex = (clientRecordsPage - 1) * itemsPerPage;
  const clientRecordsEndIndex = clientRecordsStartIndex + itemsPerPage;
  const currentClientRecords = clientRecords.slice(clientRecordsStartIndex, clientRecordsEndIndex);

  // Helper to export myRecords to Excel
  const handleExport = () => {
    const data = myRecords.map(rec => {
      const d = new Date(rec.date);
      return {
        'التاريخ': d.toLocaleDateString(),
        'الساعة': d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        'الحالة': rec.status === 'present' ? 'حاضر' : rec.status === 'absent' ? 'غائب' : 'بعذر',
        'ملاحظات': rec.notes || '-',
      };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
    XLSX.writeFile(wb, 'my_attendance.xlsx');
  };

  // Helper to export client records to Excel
  const handleExportClientRecords = () => {
    if (!selectedClient || clientRecords.length === 0) return;
    const selectedClientData = clients.find(c => c._id === selectedClient);
    const data = clientRecords.map(rec => {
      const d = new Date(rec.date);
      return {
        'العميل': selectedClientData?.name || '-',
        'التاريخ': d.toLocaleDateString(),
        'الساعة': d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        'الحالة': rec.status === 'present' ? 'حاضر' : rec.status === 'absent' ? 'غائب' : 'بعذر',
        'ملاحظات': rec.notes || '-',
      };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ClientAttendance');
    XLSX.writeFile(wb, `client_attendance_${selectedClientData?.name || 'unknown'}.xlsx`);
  };

  // Helper function to get status icon and color
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'present':
        return { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100', text: 'حاضر' };
      case 'absent':
        return { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100', text: 'غائب' };
      case 'excused':
        return { icon: AlertCircle, color: 'text-gray-600', bgColor: 'bg-gray-100', text: 'بعذر' };
      default:
        return { icon: AlertCircle, color: 'text-gray-600', bgColor: 'bg-gray-100', text: 'غير محدد' };
    }
  };

  return (
    <div className="space-y-8">
      {/* My Attendance Records */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white">سجلات حضوري</h3>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-2 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[11px] transition-colors"
              >
                <FileText className="w-4 h-4" />
                تصدير البيانات
              </button>
              {/* <button 
                onClick={openAddModal} 
                className="flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                إضافة سجل
              </button> */}
            </div>
          </div>
        </div>

        <div className="p-6">
          {myRecords.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">لا توجد سجلات حضور</p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentMyRecords.map(rec => {
                const d = new Date(rec.date);
                const statusInfo = getStatusInfo(rec.status);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <div key={rec._id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {d.toLocaleDateString('ar-EG')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-emerald-600" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusInfo.bgColor} dark:bg-opacity-20`}>
                          <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                          <span className={`text-sm font-medium ${statusInfo.color}`}>
                            {statusInfo.text}
                          </span>
                        </div>
                        {rec.notes && (
                          <div className="max-w-xs">
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {rec.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination for My Records */}
        {myRecordsTotalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between ">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                عرض {myRecordsStartIndex + 1} إلى {Math.min(myRecordsEndIndex, myRecords.length)} من {myRecords.length} سجل
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMyRecordsPage(myRecordsPage - 1)}
                  disabled={myRecordsPage === 1}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  <ChevronRight className="w-4 h-4" />
                  السابق
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: myRecordsTotalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setMyRecordsPage(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        page === myRecordsPage
                          ? 'bg-gray-600 text-white'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setMyRecordsPage(myRecordsPage + 1)}
                  disabled={myRecordsPage === myRecordsTotalPages}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  التالي
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Client Attendance Records */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between ">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">سجلات حضور العملاء</h3>
            </div>
            {selectedClient && clientRecords.length > 0 && (
              <button
                onClick={handleExportClientRecords}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
              >
                <FileText className="w-4 h-4" />
                تصدير البيانات
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <select
              className="w-full max-w-xs border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              value={selectedClient}
              onChange={(e) => { 
                setSelectedClient(e.target.value); 
                setClientRecordsPage(1); // Reset to first page when changing client
                loadClientRecords(e.target.value); 
              }}
            >
              <option value="">اختر العميل</option>
              {clients.map(c => (
                <option key={c._id} value={c._id}>{c.name} ({c.phone || '-'})</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500 mx-auto mb-3"></div>
              <p className="text-gray-500 dark:text-gray-400">جاري التحميل...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-red-500 text-xl">!</span>
              </div>
              <p className="text-red-500 dark:text-red-400">{error}</p>
            </div>
          ) : !selectedClient ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">اختر عميلاً لعرض سجلاته</p>
            </div>
          ) : clientRecords.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">لا توجد سجلات حضور لهذا العميل</p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentClientRecords.map(rec => {
                const d = new Date(rec.date);
                const cl = clients.find(c => c._id === rec.userId);
                const statusInfo = getStatusInfo(rec.status);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <div key={rec._id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <div className="flex items-center justify-between  flex-col sm:flex-row gap-2">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-gray-500 to-pink-600 flex items-center justify-center shadow-sm">
                          <span className="text-white font-bold text-sm">
                            {cl?.name?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{cl?.name || 'غير محدد'}</h4>
                          <div className="flex items-center gap-4 mt-1">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-gray-600" />
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {d.toLocaleDateString('ar-EG')}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-emerald-600" />
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusInfo.bgColor} dark:bg-opacity-20`}>
                          <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                          <span className={`text-sm font-medium ${statusInfo.color}`}>
                            {statusInfo.text}
                          </span>
                        </div>
                        {rec.notes && (
                          <div className="max-w-xs">
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {rec.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination for Client Records */}
        {clientRecordsTotalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                عرض {clientRecordsStartIndex + 1} إلى {Math.min(clientRecordsEndIndex, clientRecords.length)} من {clientRecords.length} سجل
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setClientRecordsPage(clientRecordsPage - 1)}
                  disabled={clientRecordsPage === 1}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  <ChevronRight className="w-4 h-4" />
                  السابق
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: clientRecordsTotalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setClientRecordsPage(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        page === clientRecordsPage
                          ? 'bg-gray-600 text-white'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setClientRecordsPage(clientRecordsPage + 1)}
                  disabled={clientRecordsPage === clientRecordsTotalPages}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  التالي
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

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

export default TrainerAttendance;


