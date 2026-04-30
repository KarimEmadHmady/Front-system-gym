'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from '@/i18n/navigation';
import { Wifi, WifiOff } from 'lucide-react';
import QRCodeScanner from '@/components/admin/QRCodeScanner/QRCodeScanner';
import { attendanceScanService } from '@/services/membershipCardService';
import { queueAttendance, syncData } from '@/lib/offlineSync';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import VideoTutorial from '@/components/VideoTutorial';
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner';
import { UserAttendanceModal } from './UserAttendanceModal';

import Popup from './Popup';
import ScannerCard from './ScannerCard';
import StatsCard from './StatsCard';
import Header from './Header';
import { playSound } from './soundUtils';
import { translateError } from './errorTranslator';

// Types
interface AttendanceResult {
  success: boolean;
  message: string;
  data?: {
    user: { id: string; name: string; barcode: string; email: string; membershipLevel: string };
    attendance: { id: string; date: string; status: string; time: string };
    recentAttendance: Array<{
      _id: string;
      userId: { name: string; email: string; phone: string };
      date: string;
      status: string;
      notes: string;
      createdAt: string;
      updatedAt: string;
    }>;
  };
}

interface TodaySummary {
  summary: {
    date: string;
    totalActiveMembers: number;
    totalPresent: number;
    totalAbsent: number;
    totalExcused: number;
    attendanceRate: number;
  };
  records: Array<{
    _id: string;
    userId: { name: string; barcode: string; role: string };
    status: string;
    date: string;
    createdAt: string;
  }>;
}

type PopupType = 'success' | 'error' | 'warning' | 'offline';

interface PopupState {
  type: PopupType;
  title: string;
  message: string;
  data?: AttendanceResult['data'];
}

interface AttendanceScannerProps {
  userId: string;
  role: 'admin' | 'manager';
  showVideoTutorial?: boolean;
  videoId?: string;
}

export function AttendanceScanner({
  userId,
  role,
  showVideoTutorial = false,
  videoId = 'ytPIb5HugAw',
}: AttendanceScannerProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [barcode, setBarcode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [todaySummary, setTodaySummary] = useState<TodaySummary | null>(null);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [popup, setPopup] = useState<PopupState | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [userAttendanceModal, setUserAttendanceModal] = useState<{
    isOpen: boolean;
    userName: string;
    userId: string;
    attendanceRecords: any[];
  }>({ isOpen: false, userName: '', userId: '', attendanceRecords: [] });

  const inputRef = useRef<HTMLInputElement>(null);
  // ✅ FIX: reset lastScannedRef بعد فترة علشان نفس الباركود يتسجل تاني
  const lastScannedRef = useRef('');
  const lastScannedTimeRef = useRef<number>(0);
  const popupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);


  // Network status
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  // Auth guard
useEffect(() => {
  if (isLoading) return;
  const allowed = role === 'admin'
    ? user?.role === 'admin'
    : user?.role === 'manager' || user?.role === 'admin';
  if (!isAuthenticated || !allowed) { router.push('/'); return; }
  if (userId && user?.id && userId !== user.id) {
    const base = role === 'admin' ? 'admin' : 'manager';
    router.replace(`/ar/${base}/dashboard/${user.id}`);
    return;
  }

  // ✅ نظف الـ records القديمة اللي اتراكمت من قبل التعديل
  import('@/lib/offlineQueue').then(({ clearSyncedRecords }) => {
    clearSyncedRecords('attendance').catch(() => {});
    clearSyncedRecords('payments').catch(() => {});
  });

  if (navigator.onLine) {
    fetchTodaySummary();
    fetchRecentScans();
  }
}, [isAuthenticated, user, isLoading, role, userId, router]);

  const fetchTodaySummary = async () => {
    try {
      const data = await attendanceScanService.getTodayAttendanceSummary();
      setTodaySummary(data);
    } catch {}
  };

  const fetchRecentScans = async () => {
    try {
      const data = await attendanceScanService.getAttendanceRecords({ limit: 10 });
      setRecentScans(data.data.records);
    } catch {}
  };

  const showPopup = useCallback((state: PopupState) => {
    if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
    setPopup(state);
    popupTimerRef.current = setTimeout(() => setPopup(null), 6000);
  }, []);

  const closePopup = useCallback(() => {
    if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
    setPopup(null);
    // ✅ FIX: فوكس فوري بعد غلق الـ popup بدون delay طويل
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  // ✅ FIX: Scan handler محمي بالكامل من deadlock
  const handleScan = useCallback(async (scannedBarcode: string) => {
  const trimmed = scannedBarcode.trim();
  if (!trimmed || isScanning) return;

  const now = Date.now();
  if (lastScannedRef.current === trimmed && now - lastScannedTimeRef.current < 3000) return;
  lastScannedRef.current = trimmed;
  lastScannedTimeRef.current = now;

  setIsScanning(true);
  setBarcode('');

  try {
    if (!navigator.onLine) {
      await queueAttendance({
        clientUuid: `${trimmed}-${Date.now()}`,
        barcode: trimmed,
        time: new Date().toISOString(),
        adminId: user?.id,
      });
      playSound('warning');
      showPopup({
        type: 'offline',
        title: 'حفظ أوفلاين',
        message: 'تم حفظ الحضور مؤقتًا وسيتم مزامنته عند عودة الاتصال.',
      });
      fetchTodaySummary();
      fetchRecentScans();
      return;
    }

    const result = await attendanceScanService.scanBarcode(trimmed);

    if (result.success) {
      playSound('success');
      showPopup({ type: 'success', title: 'تم بنجاح!', message: result.message, data: result.data });
      fetchTodaySummary();
      fetchRecentScans();
    } else {
      playSound('warning');
      showPopup({ type: 'warning', title: 'تحذير!', message: translateError(result.message, trimmed) });
    }

  } catch (err) {
    // ✅ FIX: reset lastScanned دايمًا عند الـ error
    lastScannedRef.current = '';

    // ✅ FIX: لو الـ error بسبب network، احفظ أوفلاين تلقائياً
    const isNetworkError = err instanceof TypeError && err.message.toLowerCase().includes('fetch');
    if (isNetworkError) {
      try {
        await queueAttendance({
          clientUuid: `${trimmed}-${Date.now()}`,
          barcode: trimmed,
          time: new Date().toISOString(),
          adminId: user?.id,
        });
        playSound('warning');
        showPopup({
          type: 'offline',
          title: 'حفظ أوفلاين',
          message: 'تعذر الاتصال بالسيرفر، تم حفظ الحضور مؤقتًا.',
        });
        fetchTodaySummary();
        fetchRecentScans();
        return;
      } catch {
        // لو فشل حتى الـ queue، اعرض الـ error العادي
      }
    }

    playSound('error');
    const msg = err instanceof Error ? err.message : undefined;
    showPopup({ type: 'error', title: 'خطأ!', message: translateError(msg, trimmed) });

  } finally {
    // ✅ دايمًا بيرجع isScanning لـ false
    setIsScanning(false);
  }
}, [isScanning, user?.id, showPopup]);

  // ✅ FIX: Global keydown — بيعمل close للـ popup لو ظاهر ثم يكمل
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // ✅ لو popup ظاهر وحد ضغط Escape أو Enter — قفله
      if (popup) {
        if (e.key === 'Escape' || e.key === 'Enter') {
          closePopup();
        }
        return;
      }

      if (showQRScanner || isScanning) return;

      const target = e.target as HTMLElement;
      if (target === inputRef.current) return;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      if (e.key === 'Enter') {
        const val = barcode.trim();
        if (val) handleScan(val);
        return;
      }

      if (e.key === 'Backspace') {
        e.preventDefault(); // ✅ منع browser back
        setBarcode(prev => prev.slice(0, -1));
        inputRef.current?.focus();
        return;
      }

      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        setBarcode(prev => prev + e.key);
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [barcode, popup, showQRScanner, isScanning, handleScan, closePopup]);

  // ✅ FIX: Auto-focus بسيط وموثوق بدون delays طويلة
  useEffect(() => {
    if (!popup && !showQRScanner && !isScanning) {
      const timer = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    }
  }, [showQRScanner, popup, isScanning]);

  const { hidConnected, connectHID, disconnectHID } = useBarcodeScanner({
    onScan: handleScan,
    inputRef: inputRef,
    disabled: !!popup || showQRScanner || isScanning,
    minLength: 3,
    scanDelay: 50,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.includes('\n') || val.includes('\r')) {
      const clean = val.replace(/[\n\r]/g, '').trim();
      if (clean) handleScan(clean);
      return;
    }
    setBarcode(val);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && barcode.trim()) handleScan(barcode.trim());
  };


  // ✅ FIX: أضفنا handleScan في الـ dependencies
const handleQRScan = useCallback((data: string) => {
  setShowQRScanner(false);
  lastScannedRef.current = '';
  lastScannedTimeRef.current = 0;
  try {
    const parsed = JSON.parse(data);
    handleScan(parsed.barcode ?? data);
  } catch {
    handleScan(data);
  }
}, [handleScan]); // ✅ dependency مضاف

  const handleShowUserAttendance = useCallback(async (scan: any) => {
    if (!scan.userId?._id) return;
    try {
      const data = await attendanceScanService.getUserAttendanceRecords(scan.userId._id, 50);
      setUserAttendanceModal({
        isOpen: true,
        userName: scan.userId.name,
        userId: scan.userId._id,
        attendanceRecords: data.data?.records || data.data || []
      });
    } catch {
      showPopup({ type: 'error', title: 'خطأ!', message: 'فشل في جلب سجلات الحضور' });
    }
  }, [showPopup, setUserAttendanceModal]); // ✅ dependency مضاف

  const handleCloseUserAttendanceModal = useCallback(() => {
    setUserAttendanceModal({ isOpen: false, userName: '', userId: '', attendanceRecords: [] });
  }, [setUserAttendanceModal]); // ✅ dependency مضاف

  const syncInProgress = useRef(false);

  useEffect(() => {
    const handleOnline = async () => {
      if (syncInProgress.current) return;
      syncInProgress.current = true;

      try {
        const { syncedCount, failedCount, importantMessages } = await syncData();

        // ✅ اجمع كل الرسايل في رسالة واحدة منظمة
        const messages: string[] = [];
        
        // لو فيه رسايل مهمة، ضيفها
        if (importantMessages.length > 0) {
          // لو فيه رسايل متكررة، احسب العدد
          const messageCounts: Record<string, number> = {};
          importantMessages.forEach(msg => {
            messageCounts[msg] = (messageCounts[msg] || 0) + 1;
          });
          
          // انسق الرسايل مع العدد - نفس شكل رسائل المزامنة
          Object.entries(messageCounts).forEach(([msg, count]) => {
            messages.push(`⚠️ ${msg} (${count} ${count > 1 ? 'أعضاء' : 'عضو'})`);
          });
        }
        
        // ضيف رسائل المزامنة
        if (syncedCount > 0) {
          messages.push(`✅ تم تسجيل ${syncedCount} حضور بنجاح`);
        }
        
        if (failedCount > 0) {
          messages.push(`❌ فشل تسجيل ${failedCount} حضور`);
        }
        
        // لو مفيش رسايل مهمة ولا مزامنة، اعرض رسالة الاتصال العادية
        if (messages.length === 0) {
          showPopup({
            type: 'success',
            title: 'الاتصال عاد',
            message: 'تم استعادة الاتصال بالإنترنت.',
          });
        } else {
          // حدد نوع الـ popup حسب المحتوى
          let popupType: 'success' | 'warning' | 'error' = 'success';
          let popupTitle = 'نتيجة المزامنة';
          let soundType: 'success' | 'warning' | 'error' = 'success';
          
          // لو فيه رسايل مهمة فقط، اجعلها warning
          if (importantMessages.length > 0 && syncedCount === 0 && failedCount === 0) {
            popupType = 'warning';
            popupTitle = 'تنبيهات هامة';
            soundType = 'warning';
          }
          // لو فيه فشل، اجعلها error
          else if (failedCount > 0) {
            popupType = 'error';
            popupTitle = 'نتيجة المزامنة';
            soundType = 'error';
          }
          // لو فيه رسايل مهمة مع مزامنة، اجعلها warning
          else if (importantMessages.length > 0) {
            popupType = 'warning';
            popupTitle = 'تنبيهات ومزامنة';
            soundType = 'warning';
          }
          
          playSound(soundType);
          showPopup({
            type: popupType,
            title: popupTitle,
            message: messages.join('<br>'),
          });
        }
        
        // دايماً حدث البيانات لو فيه مزامنة
        if (syncedCount > 0 || failedCount > 0) {
          fetchTodaySummary();
          fetchRecentScans();
        }
      } catch (error) {
        console.error('Sync error:', error);
        playSound('error');
        showPopup({
          type: 'error',
          title: 'خطأ في المزامنة',
          message: 'حدث خطأ أثناء مزامنة البيانات، حاول مرة أخرى.',
        });
      } finally {
        syncInProgress.current = false;
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [showPopup, fetchTodaySummary, fetchRecentScans]); // ✅ dependencies added

if (isLoading) return <LoadingSpinner />;

  const validScans = recentScans.filter(s => s.userId);

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {showVideoTutorial && (
        <VideoTutorial
          videoId={videoId}
          title="تسجيل حضور بالباركود أو الكاميرا أو الكود اليدوي"
          position="bottom-right"
          buttonText="شرح"
        />
      )}

      <div className="container mx-auto p-4 sm:p-6 space-y-6 max-w-5xl">
        <Header userId={userId} role={role} />

        {/* Online indicator */}
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
          isOnline
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
            : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
        }`}>
          {isOnline
            ? <><Wifi className="h-3.5 w-3.5" /> متصل</>
            : <><WifiOff className="h-3.5 w-3.5" /> غير متصل</>
          }
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* ✅ FIX: ScannerCard مع كل الـ props المطلوبة */}
          <ScannerCard
            isOnline={isOnline}
            hidConnected={hidConnected}
            barcode={barcode}
            inputRef={inputRef}
            isScanning={isScanning}
            onBarcodeChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onSubmit={() => barcode.trim() && handleScan(barcode.trim())}
            onConnectHID={connectHID}
            onDisconnectHID={disconnectHID}
            onShowQRScanner={() => setShowQRScanner(true)}
          />

          {/* Stats column */}
          <div className="space-y-4">
            <StatsCard todaySummary={todaySummary} />

            {validScans.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">السجلات الحديثة</span>
                </div>
                <div className="p-5">
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {validScans.slice(0, 20).map((record: any) => (
                      <div
                        key={record._id}
                        className="text-xs bg-gray-50 dark:bg-gray-700/30 rounded p-1.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors"
                        onClick={() => handleShowUserAttendance(record)}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 dark:text-gray-300 font-medium">
                            {record.userId.name}
                          </span>
                          <div className="text-left">
                            <div className="text-gray-600 dark:text-gray-400 text-xs">
                              {new Date(record.date).toLocaleDateString('ar-SA', {
                                weekday: 'short', day: '2-digit', month: '2-digit'
                              })}
                            </div>
                            <div className="text-gray-500 dark:text-gray-400 text-xs">
                              {new Date(record.date).toLocaleTimeString('ar-SA', {
                                hour: '2-digit', minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {showQRScanner && (
          <QRCodeScanner onScan={handleQRScan} onClose={() => setShowQRScanner(false)} />
        )}

        {popup && <Popup popup={popup} onClose={closePopup} />}

        <UserAttendanceModal
          isOpen={userAttendanceModal.isOpen}
          userName={userAttendanceModal.userName}
          attendanceRecords={userAttendanceModal.attendanceRecords}
          onClose={handleCloseUserAttendanceModal}
        />
      </div>
    </div>
  );
}