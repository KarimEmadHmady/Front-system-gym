'use client';

import React, { useState, useEffect } from 'react';
import { SessionSchedule } from '@/types';
import { User } from '@/types/models';
import { SessionScheduleService } from '@/services/sessionScheduleService';
import { userService } from '@/services';
import CustomAlert from '@/components/ui/CustomAlert';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import { useCustomAlert } from '@/hooks/useCustomAlert';
import { useConfirmationDialog } from '@/hooks/useConfirmationDialog';
import { useAuth } from '@/hooks/useAuth';

// Import extracted components
import SessionsHeader from './SessionsHeader';
import SessionsTabs from './SessionsTabs';
import SessionCard from './SessionCard';
import SessionModal from './SessionModal';
import EditSessionModal from './EditSessionModal';
import SessionsPagination from './SessionsPagination';
import { handleExport, getStatusColor, getStatusText, getUserName, getUserPhone, getTypeIcon } from './utils';

const sessionScheduleService = new SessionScheduleService();

const TrainerClientSessions = () => {
  const { alertState, showSuccess, showError, showWarning, hideAlert } = useCustomAlert();
  const { confirmationState, showConfirmation, hideConfirmation, handleConfirm, handleCancel } = useConfirmationDialog();
  
  const [activeTab, setActiveTab] = useState('all');
  const [sessions, setSessions] = useState<SessionSchedule[]>([]);
  const [clients, setClients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SessionSchedule | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [formData, setFormData] = useState({
    userId: '',
    date: '',
    startTime: '',
    endTime: '',
    duration: 60,
    sessionType: 'شخصية' as 'شخصية' | 'جماعية' | 'أونلاين' | 'تغذية',
    location: 'Gym',
    price: 0,
    description: ''
  });

  // Get current trainer ID from Redux auth first, then fallback to token/localStorage
  const { user: authUser } = useAuth();
  const getCurrentTrainerId = () => {
    if (authUser) {
      return (authUser as any)._id || (authUser as any).id;
    }
    const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (authToken) {
      try {
        const tokenData = JSON.parse(atob(authToken.split('.')[1]));
        return tokenData.userId || tokenData._id || tokenData.id;
      } catch (error) {
        console.error('Error parsing authToken:', error);
      }
    }
    return null;
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const trainerId = getCurrentTrainerId();
      if (!trainerId) {
        showError('خطأ في المصادقة', 'لم يتم العثور على بيانات المدرب. يرجى تسجيل الدخول مرة أخرى.');
        return;
      }

      const [sessionsData, clientsData] = await Promise.all([
        sessionScheduleService.getSessionsByUser(trainerId),
        userService.getMyClients()
      ]);

      // ✅ helper
      const toArray = (res: any): any[] => {
        if (Array.isArray(res)) return res;
        if (res && Array.isArray(res.data)) return res.data;
        if (res && Array.isArray(res.results)) return res.results;
        return [];
      };

      const sessionsArr = toArray(sessionsData);
      let clientsArr = toArray(clientsData);

      // Fallback للعملاء
      if (!clientsArr.length) {
        try {
          const membersRes: any = await userService.getUsersByRole('member', { page: 1, limit: 1000 } as any);
          const arr = toArray(membersRes);
          const normalizeId = (val: any): string => {
            if (!val) return '';
            if (typeof val === 'string') return val;
            if (typeof val === 'object') return (val._id || val.id || '') as string;
            return String(val);
          };
          const me = normalizeId(trainerId);
          clientsArr = arr.filter((m: any) => normalizeId(m?.trainerId) === me);
        } catch (e) {
          console.warn('Fallback members fetch failed:', e);
        }
      }

      setSessions(sessionsArr);
      setClients(clientsArr);

    } catch (error) {
      console.error('Error loading data:', error);
      showError('خطأ في التحميل', `حدث خطأ: ${error instanceof Error ? error.message : String(error)}`);
      setSessions([]);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    const trainerId = getCurrentTrainerId();
    if (!trainerId) {
      showError('خطأ في المصادقة', 'لم يتم العثور على بيانات المدرب. يرجى تسجيل الدخول مرة أخرى.');
      return;
    }

    // Validation
    if (!formData.userId || !formData.date || !formData.startTime || !formData.endTime) {
      showWarning('تحقق من البيانات', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    // Time validation
    if (formData.startTime >= formData.endTime) {
      showWarning('تحقق من الوقت', 'وقت البداية يجب أن يكون قبل وقت النهاية');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const sessionData = {
        ...formData,
        trainerId,
        date: new Date(formData.date)
      };
      await sessionScheduleService.createSession(formData.userId, sessionData);
      setShowCreateModal(false);
      resetForm();
      loadData();
      showSuccess('تم بنجاح!', 'تم إنشاء الحصة بنجاح');
    } catch (error) {
      console.error('Error creating session:', error);
      showError('خطأ في الإنشاء', 'حدث خطأ في إنشاء الحصة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession) return;
    
    try {
      const trainerId = getCurrentTrainerId();
      if (!trainerId) {
        showError('خطأ في المصادقة', 'لم يتم العثور على بيانات المدرب. يرجى تسجيل الدخول مرة أخرى.');
        return;
      }

      const sessionData = {
        ...formData,
        trainerId,
        date: new Date(formData.date)
      };
      await sessionScheduleService.updateSession(selectedSession._id, sessionData);
      setShowEditModal(false);
      setSelectedSession(null);
      resetForm();
      loadData();
      showSuccess('تم التحديث', 'تم تحديث الحصة بنجاح');
    } catch (error) {
      console.error('Error updating session:', error);
      showError('خطأ في التحديث', 'حدث خطأ في تحديث الحصة. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleUpdateStatus = async (sessionId: string, status: string) => {
    try {
      await sessionScheduleService.updateSession(sessionId, { status: status as any });
      loadData();
      showSuccess('تم التحديث', 'تم تحديث حالة الحصة بنجاح');
    } catch (error) {
      console.error('Error updating status:', error);
      showError('خطأ في التحديث', 'حدث خطأ في تحديث حالة الحصة.');
    }
  };

  const resetForm = () => {
    setFormData({
      userId: '',
      date: '',
      startTime: '',
      endTime: '',
      duration: 60,
      sessionType: 'شخصية' as 'شخصية' | 'جماعية' | 'أونلاين' | 'تغذية',
      location: 'Gym',
      price: 0,
      description: ''
    });
  };

  const openEditModal = (session: SessionSchedule) => {
    setSelectedSession(session);
    setFormData({
      userId: session.userId,
      date: new Date(session.date).toISOString().split('T')[0],
      startTime: session.startTime,
      endTime: session.endTime,
      duration: session.duration || 60,
      sessionType: session.sessionType as 'شخصية' | 'جماعية' | 'أونلاين' | 'تغذية',
      location: session.location || 'Gym',
      price: session.price || 0,
      description: session.description || ''
    });
    setShowEditModal(true);
  };

  const filteredSessions = sessions?.filter(session => {
    if (activeTab === 'today') {
      const today = new Date().toISOString().split('T')[0];
      return new Date(session.date).toISOString().split('T')[0] === today;
    } else if (activeTab === 'upcoming') {
      return session.status === 'مجدولة';
    } else if (activeTab === 'completed') {
      return session.status === 'مكتملة';
    }
    return true;
  }) || [];

  // حساب البيانات للصفحات
  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSessions = filteredSessions.slice(startIndex, endIndex);

  // تغيير الصفحة
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // إعادة تعيين الصفحة عند تغيير التبويب
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const totalRevenue = filteredSessions.reduce((sum, session) => sum + (session.price || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <SessionsHeader
        totalRevenue={totalRevenue}
        onShowCreateModal={() => setShowCreateModal(true)}
        onExport={() => handleExport(filteredSessions, clients)}
      />

      {/* Tabs */}
      <SessionsTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sessions={sessions}
      />

      {/* Sessions List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-3 sm:p-6">
          {currentSessions.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <div className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2 sm:mb-3" />
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                {activeTab === 'all' ? 'لا توجد حصص' : 
                  activeTab === 'today' ? 'لا توجد حصص اليوم' :
                  activeTab === 'upcoming' ? 'لا توجد حصص مجدولة' :
                  activeTab === 'completed' ? 'لا توجد حصص مكتملة' : 'لا توجد حصص'}
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {currentSessions.map((session) => (
                <SessionCard
                  key={session._id}
                  session={session}
                  getUserName={(userId) => getUserName(userId, clients)}
                  getUserPhone={(userId) => getUserPhone(userId, clients)}
                  getStatusColor={getStatusColor}
                  getStatusText={getStatusText}
                  getTypeIcon={getTypeIcon}
                  onEdit={openEditModal}
                  onUpdateStatus={handleUpdateStatus}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        <SessionsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          endIndex={endIndex}
          totalItems={filteredSessions.length}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Create Modal */}
      <SessionModal
        showCreateModal={showCreateModal}
        formData={formData}
        isSubmitting={isSubmitting}
        clients={clients}
        onClose={() => setShowCreateModal(false)}
        onFormChange={setFormData}
        onSubmit={handleCreateSession}
      />

      {/* Edit Modal */}
      <EditSessionModal
        showEditModal={showEditModal}
        formData={formData}
        onClose={() => setShowEditModal(false)}
        onFormChange={setFormData}
        onSubmit={handleUpdateSession}
      />

      {/* Custom Alert */}
      <CustomAlert
        isOpen={alertState.isOpen}
        onClose={hideAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        duration={alertState.duration}
      />

      {/* Confirmation Dialog */}
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

export default TrainerClientSessions;
