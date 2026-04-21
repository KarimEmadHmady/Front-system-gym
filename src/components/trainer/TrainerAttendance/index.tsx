'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AttendanceService } from '@/services/attendanceService';
import { UserService } from '@/services/userService';
import type { AttendanceRecord, User } from '@/types/models';

// Import extracted components
import AttendanceHeader from './AttendanceHeader';
import MyAttendanceRecords from './MyAttendanceRecords';
import ClientAttendanceRecords from './ClientAttendanceRecords';
import AttendanceModal from './AttendanceModal';
import AttendancePagination from './AttendancePagination';
import AttendanceCard from './AttendanceCard';
import { handleExport, handleExportClientRecords, getStatusInfo } from './utils';

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

  useEffect(() => {
    if (isAuthenticated && currentUserId) {
      loadMy();
      loadClients();
    }
  }, [isAuthenticated, currentUserId]);

  return (
    <div className="space-y-8">
      {/* My Attendance Records */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <AttendanceHeader
          onExport={() => handleExport(myRecords, 'my_attendance.xlsx')}
          onAddRecord={openAddModal}
        />

        <div className="p-6">
          <MyAttendanceRecords
            myRecords={myRecords}
            currentMyRecords={currentMyRecords}
            getStatusInfo={getStatusInfo}
          />

          {/* Pagination for My Records */}
          <AttendancePagination
            currentPage={myRecordsPage}
            totalPages={myRecordsTotalPages}
            startIndex={myRecordsStartIndex}
            endIndex={myRecordsEndIndex}
            totalItems={myRecords.length}
            onPageChange={setMyRecordsPage}
            type="my"
          />
        </div>
      </div>

      {/* Client Attendance Records */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">سجلات حضور العملاء</h3>
            </div>
            {selectedClient && clientRecords.length > 0 && (
              <button
                onClick={() => handleExportClientRecords(clientRecords, selectedClient, clients)}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
              >
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                تصدير البيانات
              </button>
            )}
          </div>
        </div>

        <ClientAttendanceRecords
          clients={clients}
          selectedClient={selectedClient}
          clientRecords={clientRecords}
          currentClientRecords={currentClientRecords}
          loading={loading}
          error={error}
          getStatusInfo={getStatusInfo}
          onClientChange={(clientId) => { 
            setSelectedClient(clientId); 
            setClientRecordsPage(1); // Reset to first page when changing client
            loadClientRecords(clientId); 
          }}
        />

        {/* Pagination for Client Records */}
        <AttendancePagination
          currentPage={clientRecordsPage}
          totalPages={clientRecordsTotalPages}
          startIndex={clientRecordsStartIndex}
          endIndex={clientRecordsEndIndex}
          totalItems={clientRecords.length}
          onPageChange={setClientRecordsPage}
          type="client"
        />
      </div>

      {/* Attendance Modal */}
      <AttendanceModal
        addModalOpen={addModalOpen}
        addForm={addForm}
        adding={adding}
        onClose={() => setAddModalOpen(false)}
        onFormChange={setAddForm}
        onSave={handleAddSave}
      />
    </div>
  );
};

export default TrainerAttendance;
