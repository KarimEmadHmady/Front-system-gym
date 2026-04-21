'use client';

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { SessionSchedule } from '@/types';
import { User } from '@/types/models';
import { SessionScheduleService } from '@/services/sessionScheduleService';
import { userService } from '@/services';
import CustomAlert from '@/components/ui/CustomAlert';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import { useCustomAlert } from '@/hooks/useCustomAlert';
import { useConfirmationDialog } from '@/hooks/useConfirmationDialog';
import * as XLSX from 'xlsx';
import VideoTutorial from '@/components/VideoTutorial';

import type { SessionFormData, TabId, TabDef } from './types';
import { INITIAL_FORM } from './types';
import SessionsHeader from './SessionsHeader';
import SessionsTabs from './SessionsTabs';
import SessionsOverviewCards from './SessionsOverviewCards';
import SessionsTable from './SessionsTable';
import SessionsPagination from './SessionsPagination';
import CreateSessionModal from './CreateSessionModal';
import EditSessionModal from './EditSessionModal';

const sessionScheduleService = new SessionScheduleService();

interface Props {
  userRole?: 'admin' | 'manager';
  viewMode?: 'overview' | 'management';
}

const SessionSchedulesManagement = ({ userRole = 'admin', viewMode = 'management' }: Props) => {
  const { alertState, showSuccess, showError, showWarning, hideAlert } = useCustomAlert();
  const { confirmationState, showConfirmation, hideConfirmation, handleConfirm, handleCancel } = useConfirmationDialog();

  const [activeTab, setActiveTab] = useState<TabId>(viewMode === 'overview' ? 'today' : 'all');
  const [sessions, setSessions] = useState<SessionSchedule[]>([]);
  const [usersById, setUsersById] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(true);
  const [totalSessions, setTotalSessions] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SessionSchedule | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<SessionFormData>({ ...INITIAL_FORM });

  const [trainers, setTrainers] = useState<User[]>([]);
  const [trainersLoading, setTrainersLoading] = useState(false);
  const [trainerClients, setTrainerClients] = useState<User[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const notFoundUserIdsRef = useRef<Set<string>>(new Set());
  const inFlightUserIdsRef = useRef<Map<string, Promise<User>>>(new Map());

  // ── Effects ──────────────────────────────────────────────────────────────
  useEffect(() => { loadData(); }, [currentPage, itemsPerPage, activeTab, filterDate]); // eslint-disable-line

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setShowCreateModal(false); setShowEditModal(false); }
    };
    if (showCreateModal || showEditModal) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [showCreateModal, showEditModal]);

  useEffect(() => {
    if (showCreateModal) {
      setTrainersLoading(true);
      userService.getUsersByRole('trainer', { limit: 100 })
        .then(res => { const arr = (res as any).data?.items || (res as any).data || res || []; setTrainers(arr); })
        .catch(() => setTrainers([]))
        .finally(() => setTrainersLoading(false));
    } else {
      setTrainers([]);
      setTrainerClients([]);
      setFormData(f => ({ ...f, trainerId: '', userId: '' }));
    }
  }, [showCreateModal]);

  useEffect(() => {
    if (!showCreateModal) {
      setTrainerClients([]);
      setFormData(f => ({ ...f, trainerId: '', userId: '' }));
    }
  }, [showCreateModal]);

  useEffect(() => { setCurrentPage(1); }, [activeTab, filterDate]);

  // ── Data loading ──────────────────────────────────────────────────────────
  const loadData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const statusFromTab = activeTab === 'upcoming' ? 'مجدولة' : activeTab === 'completed' ? 'مكتملة' : activeTab === 'cancelled' ? 'ملغاة' : undefined;
      const dateFilter = filterDate || (activeTab === 'today' ? today : undefined);

      const res = await sessionScheduleService.getSessions({ page: currentPage, limit: itemsPerPage, sortBy: 'date', sortOrder: 'desc', status: statusFromTab, date: dateFilter });
      const pageSessions = res.data || [];
      setSessions(pageSessions);
      setTotalSessions(Number(res.pagination?.total ?? pageSessions.length ?? 0));
      setTotalPages(Math.max(1, Number(res.pagination?.totalPages ?? 1)));

      const ids = new Set<string>();
      for (const s of pageSessions) {
        if (s?.userId) ids.add(String(s.userId));
        if (s?.trainerId) ids.add(String(s.trainerId));
      }

      const idsToFetch = Array.from(ids).filter(id => id && !usersById[id] && !notFoundUserIdsRef.current.has(id));
      if (idsToFetch.length > 0) {
        const results = await Promise.allSettled(
          idsToFetch.map(id => {
            const existing = inFlightUserIdsRef.current.get(id);
            if (existing) return existing;
            const p = userService.getUser(id) as Promise<User>;
            inFlightUserIdsRef.current.set(id, p);
            return p;
          })
        );
        const next: Record<string, User> = {};
        results.forEach((r, idx) => {
          const id = idsToFetch[idx];
          inFlightUserIdsRef.current.delete(id);
          if (r.status === 'fulfilled' && r.value && (r.value as any)._id) {
            next[String((r.value as User)._id)] = r.value as User;
          } else {
            notFoundUserIdsRef.current.add(id);
          }
        });
        if (Object.keys(next).length > 0) setUsersById(prev => ({ ...prev, ...next }));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setSessions([]); setTotalSessions(0); setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleTrainerChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const trainerId = e.target.value;
    setFormData(f => ({ ...f, trainerId, userId: '' }));
    setTrainerClients([]);
    if (!trainerId) return;
    setClientsLoading(true);
    try {
      const clients = await userService.getClientsOfTrainer(trainerId);
      setTrainerClients(clients);
    } catch { setTrainerClients([]); }
    finally { setClientsLoading(false); }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!formData.userId || !formData.trainerId || !formData.date || !formData.startTime || !formData.endTime) {
      showWarning('تحقق من البيانات', 'يرجى ملء جميع الحقول المطلوبة'); return;
    }
    if (formData.startTime >= formData.endTime) {
      showWarning('تحقق من الوقت', 'وقت البداية يجب أن يكون قبل وقت النهاية'); return;
    }
    try {
      setIsSubmitting(true);
      await sessionScheduleService.createSession(formData.userId, { ...formData, date: new Date(formData.date) });
      setShowCreateModal(false);
      setFormData({ ...INITIAL_FORM });
      loadData();
      showSuccess('تم بنجاح!', 'تم إنشاء الحصة بنجاح');
    } catch { showError('خطأ في الإنشاء', 'حدث خطأ في إنشاء الحصة. يرجى المحاولة مرة أخرى.'); }
    finally { setIsSubmitting(false); }
  };

  const handleUpdateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession) return;
    try {
      await sessionScheduleService.updateSession(selectedSession._id, { ...formData, date: new Date(formData.date) });
      setShowEditModal(false); setSelectedSession(null); setFormData({ ...INITIAL_FORM }); loadData();
    } catch (err) { console.error('Error updating session:', err); }
  };

  const handleDeleteSession = (sessionId: string) => {
    showConfirmation('تأكيد الحذف', 'هل أنت متأكد من حذف هذه الحصة؟ لا يمكن التراجع عن هذا الإجراء.',
      async () => {
        try { await sessionScheduleService.deleteSession(sessionId); loadData(); showSuccess('تم الحذف', 'تم حذف الحصة بنجاح'); }
        catch { showError('خطأ في الحذف', 'حدث خطأ في حذف الحصة. يرجى المحاولة مرة أخرى.'); }
      },
      { confirmText: 'حذف', cancelText: 'إلغاء', type: 'danger' }
    );
  };

  const handleUpdateStatus = async (sessionId: string, status: 'مجدولة' | 'مكتملة' | 'ملغاة') => {
    try { await sessionScheduleService.updateSession(sessionId, { status }); loadData(); }
    catch (err) { console.error('Error updating status:', err); }
  };

  const openEditModal = (session: SessionSchedule) => {
    setSelectedSession(session);
    setFormData({
      userId: session.userId,
      trainerId: session.trainerId,
      date: new Date(session.date).toISOString().split('T')[0],
      startTime: session.startTime,
      endTime: session.endTime,
      duration: session.duration || 60,
      sessionType: session.sessionType as any,
      location: session.location || 'Gym',
      price: session.price || 0,
      description: session.description || '',
    });
    setShowEditModal(true);
  };

  const getUserName = (userId: string) => {
    const id = userId?.toString();
    return id ? (usersById[id]?.name || 'غير محدد') : 'غير محدد';
  };

  // ── Export ────────────────────────────────────────────────────────────────
  const exportSessionsToExcel = () => {
    try {
      const exportData = visibleSessions.map(session => ({
        'نوع الحصة': session.sessionType || '',
        'المتدرب': getUserName(session.userId),
        'المدرب': getUserName(session.trainerId),
        'التاريخ': new Date(session.date).toLocaleDateString('ar-EG'),
        'وقت البداية': session.startTime || '',
        'وقت النهاية': session.endTime || '',
        'المدة (دقيقة)': session.duration || 0,
        'السعر (ج.م)': session.price || 0,
        'الموقع': session.location || '',
        'الحالة': session.status || '',
        'الوصف': session.description || '',
        'تاريخ الإنشاء': session.createdAt ? new Date(session.createdAt).toLocaleDateString('ar-EG') : '',
        'آخر تعديل': session.updatedAt ? new Date(session.updatedAt).toLocaleDateString('ar-EG') : '',
      }));
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'جداول الجلسات');
      worksheet['!cols'] = [{ wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 30 }, { wch: 15 }, { wch: 15 }];
      XLSX.writeFile(workbook, `جداول_الجلسات_${new Date().toLocaleDateString('ar-EG').replace(/\//g, '-')}.xlsx`);
      showSuccess('تم التصدير بنجاح', `تم تصدير ${exportData.length} جلسة بنجاح`);
    } catch { showError('خطأ في التصدير', 'حدث خطأ أثناء تصدير البيانات'); }
  };

  // ── Derived data ──────────────────────────────────────────────────────────
  const filteredSessions = useMemo(() => {
    const list = sessions || [];
    return list.filter(session => {
      if (!session) return false;
      if (filterDate && new Date(session.date).toISOString().split('T')[0] !== filterDate) return false;
      if (activeTab === 'today') return new Date(session.date).toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
      if (activeTab === 'upcoming') return session.status === 'مجدولة';
      if (activeTab === 'completed') return session.status === 'مكتملة';
      if (activeTab === 'cancelled') return session.status === 'ملغاة';
      return true;
    });
  }, [sessions, activeTab, filterDate]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + filteredSessions.length;
  const visibleSessions = filteredSessions;
  const totalRevenue = visibleSessions.reduce((sum, s) => sum + (s.price || 0), 0);

  const buildTabs = (): TabDef[] => {
    const todayStr = new Date().toISOString().split('T')[0];
    const base: TabDef[] = [
      { id: 'all', name: 'الكل', count: sessions?.length || 0 },
      { id: 'today', name: 'اليوم', count: sessions?.filter(s => new Date(s.date).toISOString().split('T')[0] === todayStr).length || 0 },
      { id: 'upcoming', name: 'المجدولة', count: sessions?.filter(s => s.status === 'مجدولة').length || 0 },
      { id: 'completed', name: 'المكتملة', count: sessions?.filter(s => s.status === 'مكتملة').length || 0 },
      { id: 'cancelled', name: 'الملغاة', count: sessions?.filter(s => s.status === 'ملغاة').length || 0 },
    ];
    return viewMode === 'overview'
      ? [base[1], base[2], base[3], base[0]]
      : base;
  };

  // ── Loading / Error states ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600" />
      </div>
    );
  }

  if (!sessions && !usersById) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-2">حدث خطأ في تحميل البيانات</p>
          <button onClick={loadData} className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">إعادة المحاولة</button>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <VideoTutorial
        videoId="KIkT85ef8W4"
        title="جدول الحصص اليومية والملغاة والمكتملة بكل التفاصيل"
        position="bottom-right"
        buttonText="شرح"
      />

      <SessionsHeader
        viewMode={viewMode}
        userRole={userRole}
        totalRevenue={totalRevenue}
        filterDate={filterDate}
        setFilterDate={setFilterDate}
        onAddSession={() => setShowCreateModal(true)}
        onExport={exportSessionsToExcel}
      />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <SessionsTabs tabs={buildTabs()} activeTab={activeTab} onTabChange={setActiveTab} />

        {viewMode === 'overview' ? (
          <SessionsOverviewCards
            sessions={visibleSessions}
            getUserName={getUserName}
            onEdit={openEditModal}
            onDelete={handleDeleteSession}
          />
        ) : (
          <SessionsTable
            sessions={visibleSessions}
            getUserName={getUserName}
            onEdit={openEditModal}
            onDelete={handleDeleteSession}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        <SessionsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalSessions={totalSessions}
          startIndex={startIndex}
          endIndex={endIndex}
          itemsPerPage={itemsPerPage}
          onPrev={() => setCurrentPage(p => Math.max(1, p - 1))}
          onNext={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          onItemsPerPageChange={n => { setItemsPerPage(n); setCurrentPage(1); }}
        />
      </div>

      {showCreateModal && (
        <CreateSessionModal
          formData={formData}
          setFormData={setFormData}
          trainers={trainers}
          trainersLoading={trainersLoading}
          trainerClients={trainerClients}
          clientsLoading={clientsLoading}
          isSubmitting={isSubmitting}
          onTrainerChange={handleTrainerChange}
          onSubmit={handleCreateSession}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {showEditModal && (
        <EditSessionModal
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleUpdateSession}
          onClose={() => setShowEditModal(false)}
        />
      )}

      <CustomAlert
        isOpen={alertState.isOpen}
        onClose={hideAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        duration={alertState.duration}
      />

      <ConfirmationDialog
        isOpen={confirmationState.isOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title={confirmationState.title}
        message={confirmationState.message}
        confirmText={confirmationState.confirmText}
        cancelText={confirmationState.cancelText}
        type={confirmationState.type}
      />
    </div>
  );
};

export default SessionSchedulesManagement;