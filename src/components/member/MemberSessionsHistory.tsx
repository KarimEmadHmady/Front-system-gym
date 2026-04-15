'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { SessionSchedule } from '@/types';
import { SessionScheduleService } from '@/services/sessionScheduleService';
import CustomAlert from '@/components/ui/CustomAlert';
import { useCustomAlert } from '@/hooks/useCustomAlert';
import { userService } from '@/services';

const sessionScheduleService = new SessionScheduleService();

const MemberSessionsHistory = () => {
  const { alertState, showSuccess, showError, showWarning, hideAlert } = useCustomAlert();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [sessions, setSessions] = useState<SessionSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [trainerNames, setTrainerNames] = useState<Record<string, string>>({});
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const itemsPerPage = 10;

  // Get current member ID from auth context or localStorage
  const getCurrentMemberId = () => {
    // Try multiple ways to get user data
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    const authToken = localStorage.getItem('authToken');
    
    // Try to get from authToken first (has correct ObjectId)
    if (authToken) {
      try {
        const tokenData = JSON.parse(atob(authToken.split('.')[1]));
        const id = tokenData.userId || tokenData._id || tokenData.id;
        if (id && /^[0-9a-fA-F]{24}$/.test(id)) {
          return id;
        }
      } catch (error) {
        console.error('Error parsing authToken:', error);
      }
    }
    
    // Try to get from user data
    if (user) {
      try {
        const userData = JSON.parse(user);
        const id = userData._id || userData.id;
        if (id && /^[0-9a-fA-F]{24}$/.test(id)) {
          return id;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    
    // Try to get from token (has invalid id: 5)
    if (token) {
      try {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        const id = tokenData.userId || tokenData._id || tokenData.id;
        if (id && /^[0-9a-fA-F]{24}$/.test(id)) {
          return id;
        }
      } catch (error) {
        console.error('Error parsing token:', error);
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
    const memberId = getCurrentMemberId();
    if (!memberId) {
      showError('خطأ في المصادقة', 'لم يتم العثور على بيانات العضو. يرجى تسجيل الدخول مرة أخرى.');
      return;
    }

    const toArray = (res: any): any[] => {
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res.data)) return res.data;
      if (res && Array.isArray(res.results)) return res.results;
      return [];
    };

    const result = await sessionScheduleService.getSessionsByUser(memberId);
    const sessionsArr = toArray(result);
    setSessions(sessionsArr);

    // Extract trainer ID properly
    try {
      const uniqueTrainerIds = Array.from(new Set(sessionsArr.map((s: any) => getTrainerId(s.trainerId)).filter(Boolean)));
      const namesMap: Record<string, string> = {};
      await Promise.all(uniqueTrainerIds.map(async (id) => {
        try {
          const trainer = await userService.getUser(id as string);
          namesMap[id as string] = trainer?.name || 'undefined';
        } catch {
          namesMap[id as string] = 'undefined';
        }
      }));
      setTrainerNames(namesMap);
    } catch (trainerError) {
      console.warn('Error loading trainer names:', trainerError);
      // Set empty trainer names but still show sessions
      setTrainerNames({});
    }

    if (!sessionsArr.length) {
      showWarning('لا توجد حصص', 'لم يتم العثور على حصص مرتبطة بهذا العضو');
    }

  } catch (error) {
    console.error('Error loading data:', error);
    showError('خطأ في التحميل', `حدث خطأ: ${error instanceof Error ? error.message : String(error)}`);
    setSessions([]);
  } finally {
    setLoading(false);
  }
};

  const getTrainerId = (trainer: any): string => {
    if (!trainer) return '';
    if (typeof trainer === 'string') return trainer;
    if (typeof trainer === 'object' && trainer._id) return trainer._id;
    if (typeof trainer === 'object' && trainer.id) return trainer.id;
    return '';
  };

  const getTrainerName = (trainerId: string) => {
    if (!trainerId) return 'غير محدد';
    return trainerNames[trainerId] || 'غير محدد';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'مكتملة': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'مجدولة': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      'ملغاة': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    return status; // Already in Arabic from API
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      'شخصية': '👤',
      'جماعية': '👥',
      'أونلاين': '💻',
      'تغذية': '🥗'
    };
    return icons[type as keyof typeof icons] || '👤';
  };

  // حساب الفرق بين وقتين بصيغة HH:mm
  const getTimeDiffString = (start: string, end: string) => {
    if (!start || !end) return '';
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    let startMinutes = startH * 60 + startM;
    let endMinutes = endH * 60 + endM;
    // إذا كان وقت النهاية أصغر من البداية (مثلاً عبر منتصف الليل)
    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60;
    }
    let diff = endMinutes - startMinutes;
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    let result = '';
    if (hours > 0) result += `(${hours} ساعة)`;
    if (minutes > 0) result += (result ? ' ' : '') + `(${minutes} دقيقة)`;
    if (!result) result = '0 دقيقة';
    return result;
  };

  const filteredSessions = useMemo(() => {
    const filtered = sessions?.filter(session => {
      if (activeTab === 'upcoming') {
        return session.status === 'مجدولة';
      } else if (activeTab === 'completed') {
        return session.status === 'مكتملة';
      } else if (activeTab === 'cancelled') {
        return session.status === 'ملغاة';
      }
      return true;
    }) || [];
    
    // Update pagination info when filtered data changes
    setTotalRecords(filtered.length);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    
    return filtered;
  }, [sessions, activeTab, itemsPerPage]);

  // Pagination handlers
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
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

  // Paginated items
  const paginatedSessions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredSessions.slice(startIndex, endIndex);
  }, [filteredSessions, currentPage, itemsPerPage]);

  // Reset to first page when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-0">
            حصصي التدريبية
          </h3>
          <div className="flex space-x-2">
            <button className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              تصدير البيانات
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-2 md:px-6 pt-4 pb-2">
          <nav className="flex flex-row-reverse flex-wrap gap-2 overflow-x-auto scrollbar-hide bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
            {[ 
              { id: 'upcoming', name: 'المجدولة', count: sessions?.filter(s => s.status === 'مجدولة').length || 0 },
              { id: 'completed', name: 'المكتملة', count: sessions?.filter(s => s.status === 'مكتملة').length || 0 },
              { id: 'cancelled', name: 'الملغاة', count: sessions?.filter(s => s.status === 'ملغاة').length || 0 },
              { id: 'all', name: 'الكل', count: sessions?.length || 0 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1   min-w-[120px] px-2 py-2 rounded-md text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-gray-400 whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'bg-gray-600 text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'}
                `}
              >
                <span className="mx-2">{tab.name}</span>
                <span className="ml-2  bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-400 py-0.5 px-2 rounded-full text-xs font-bold">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Sessions List */}
        <div className="p-6">
          <div className="space-y-4">
            {paginatedSessions.map((session) => (
              <div
                key={session._id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="text-2xl">
                      {getTypeIcon(session.sessionType)}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        {session.sessionType}
                      </h4>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">المدرب:</span> {getTrainerName(session.trainerId)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">الوقت:</span> {session.startTime} - {session.endTime}
                          {session.startTime && session.endTime && (
                            <span className="ml-2 text-xs text-gray-600 dark:text-gray-400 "><br/>{getTimeDiffString(session.startTime, session.endTime)}</span>
                          )}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">التاريخ:</span> {new Date(session.date).toLocaleDateString('ar-EG')}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">المدة:</span> {session.duration} دقيقة
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">الموقع:</span> {session.location}
                        </p>
                        {session.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">الوصف:</span> {session.description}
                          </p>
                        )}
                        {session.price && session.price > 0 && (
                          <p className="text-sm text-green-600 dark:text-green-400">
                            <span className="font-medium">السعر:</span> ج.م {session.price}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(session.status)}`}>
                      {getStatusText(session.status)}
                    </span>
                    {/* Read-only view - no action buttons */}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
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
            <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
              عرض {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalRecords)} من {totalRecords} جلسة
            </div>
          )}
        </div>
      </div>

      {/* Custom Alert */}
      <CustomAlert
        isOpen={alertState.isOpen}
        onClose={hideAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        duration={alertState.duration}
      />
    </div>
  );
};

export default MemberSessionsHistory;
