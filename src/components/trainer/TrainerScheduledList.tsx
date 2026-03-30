'use client';

import React, { useEffect, useState } from 'react';
import { SessionSchedule } from '@/types';
import { SessionScheduleService } from '@/services/sessionScheduleService';
import { userService } from '@/services';
import { useAuth } from '@/hooks/useAuth';
import { Calendar, Clock, User as UserIcon, MapPin, CheckCircle2, ChevronLeft, ChevronRight, FileText, Users, DollarSign } from 'lucide-react';
import * as XLSX from 'xlsx';

const sessionScheduleService = new SessionScheduleService();

const TrainerScheduledList = () => {
  const { user: authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<SessionSchedule[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const getCurrentTrainerId = () => {
    if (authUser) {
      return (authUser as any)._id || (authUser as any).id;
    }
    const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (authToken) {
      try {
        const tokenData = JSON.parse(atob(authToken.split('.')[1]));
        return tokenData.userId || tokenData._id || tokenData.id;
      } catch {
        // ignore
      }
    }
    return null;
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const trainerId = getCurrentTrainerId();
        if (!trainerId) {
          setError('لم يتم العثور على بيانات المدرب');
          setSessions([]);
          return;
        }
        const allSessions = await sessionScheduleService.getSessionsByUser(trainerId);
        const scheduledOnly = (allSessions || []).filter((s) => s.status === 'مجدولة');
        setSessions(scheduledOnly);
      } catch (e: any) {
        setError(e?.message || 'حدث خطأ في تحميل البيانات');
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-3"></div>
        <p className="text-gray-600 dark:text-gray-400">جاري تحميل الحصص المجدولة...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!sessions.length) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">لا توجد حصص مجدولة حالياً</p>
      </div>
    );
  }

  // حساب البيانات للصفحات
  const totalPages = Math.ceil(sessions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSessions = sessions.slice(startIndex, endIndex);

  // تغيير الصفحة
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Helper to export scheduled sessions to Excel
  const handleExport = () => {
    const data = sessions.map(session => ({
      'نوع الحصة': session.sessionType,
      'التاريخ': new Date(session.date).toLocaleDateString('ar-EG'),
      'وقت البداية': session.startTime,
      'وقت النهاية': session.endTime,
      'المدة': session.duration || '-',
      'السعر': session.price || 0,
      'المكان': session.location || '-',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ScheduledSessions');
    XLSX.writeFile(wb, 'scheduled_sessions.xlsx');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white">الحصص المجدولة</h3>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-200 flex items-center gap-1">
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              {sessions.length} حصة
            </span>
            <button
              onClick={handleExport}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs sm:text-sm transition-colors"
            >
              <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">تصدير البيانات</span>
              <span className="sm:hidden">تصدير</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-6">
        {currentSessions.length === 0 ? (
          <div className="text-center py-6 sm:py-8">
            <CheckCircle2 className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2 sm:mb-3" />
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">لا توجد حصص مجدولة</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {currentSessions.map((session) => (
              <div key={session._id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-4">
                    <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-r from-gray-500 to-gray-600 flex items-center justify-center shadow-sm">
                      <span className="text-white font-bold text-sm sm:text-lg">
                        {session.sessionType === 'شخصية' ? '👤' : session.sessionType === 'جماعية' ? '👥' : session.sessionType === 'أونلاين' ? '💻' : '🥗'}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">{session.sessionType}</h4>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
                        <div className="flex items-center gap-1 sm:gap-2 text-gray-600 dark:text-gray-400">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                          <span className="text-xs sm:text-sm">{new Date(session.date).toLocaleDateString('ar-EG')}</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 text-gray-600 dark:text-gray-400">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" />
                          <span className="text-xs sm:text-sm">{session.startTime} - {session.endTime}</span>
                        </div>
                      </div>
                      {(session.location || (typeof session.price === 'number')) && (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
                          {session.location && (
                            <div className="flex items-center gap-1 sm:gap-2 text-gray-600 dark:text-gray-400">
                              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-pink-600" />
                              <span className="text-xs sm:text-sm">{session.location}</span>
                            </div>
                          )}
                          {typeof session.price === 'number' && (
                            <div className="flex items-center gap-1 sm:gap-2 text-gray-600 dark:text-gray-400">
                              <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                              <span className="text-xs sm:text-sm font-medium text-green-600 dark:text-green-400">
                                ج.م {session.price}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                      مجدولة
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-600">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
            <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
              عرض {startIndex + 1} إلى {Math.min(endIndex, sessions.length)} من {sessions.length} حصة
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">السابق</span>
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                      page === currentPage
                        ? 'bg-gray-600 text-white'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                <span className="hidden sm:inline">التالي</span>
                <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerScheduledList;
