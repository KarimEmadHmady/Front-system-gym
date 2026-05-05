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

// ─── Types ────────────────────────────────────────────────────────────────────
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

// ─── Component ────────────────────────────────────────────────────────────────
export function AttendanceScanner({
  userId,
  role,
  showVideoTutorial = false,
  videoId = 'ytPIb5HugAw',
}: AttendanceScannerProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [barcode, setBarcode]               = useState('');
  const [todaySummary, setTodaySummary]     = useState<TodaySummary | null>(null);
  const [recentScans, setRecentScans]       = useState<any[]>([]);
  const [showQRScanner, setShowQRScanner]   = useState(false);
  const [popup, setPopup]                   = useState<PopupState | null>(null);
  const [isOnline, setIsOnline]             = useState(true);
  const [queueSize, setQueueSize]           = useState(0); // ✅ عدد السكانات في الـ queue
  const [isProcessingState, setIsProcessingState] = useState(false);
  const [userAttendanceModal, setUserAttendanceModal] = useState<{
    isOpen: boolean;
    userName: string;
    userId: string;
    attendanceRecords: any[];
  }>({ isOpen: false, userName: '', userId: '', attendanceRecords: [] });

  const inputRef          = useRef<HTMLInputElement>(null);
  const lastScannedRef    = useRef('');
  const lastScannedTimeRef = useRef<number>(0);
  const popupTimerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncInProgress    = useRef(false);

  useEffect(() => {
    return () => {
      if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
    };
  }, []);

  // ✅ Queue system refs
  const scanQueueRef      = useRef<string[]>([]);
  const isProcessingRef   = useRef(false);

  // ─── Network status ───────────────────────────────────────────────────────
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const on  = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  // ─── Data fetchers ────────────────────────────────────────────────────────
  const fetchTodaySummary = useCallback(async () => {
    try {
      const data = await attendanceScanService.getTodayAttendanceSummary();
      setTodaySummary(data);
    } catch {}
  }, []);

  const fetchRecentScans = useCallback(async () => {
    try {
      const data = await attendanceScanService.getAttendanceRecords({ limit: 10 });
      setRecentScans(data.data.records);
    } catch {}
  }, []);

  // ─── Auth guard ───────────────────────────────────────────────────────────
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

    import('@/lib/offlineQueue').then(({ clearSyncedRecords }) => {
      clearSyncedRecords('attendance').catch(() => {});
      clearSyncedRecords('payments').catch(() => {});
    });

    if (navigator.onLine) {
      fetchTodaySummary();
      fetchRecentScans();
    }
  }, [isAuthenticated, user, isLoading, role, userId, router, fetchTodaySummary, fetchRecentScans]);

  // ─── Popup helpers ────────────────────────────────────────────────────────
const showPopup = useCallback((state: PopupState) => {
  if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
  
  setBarcode('');
  if (inputRef.current) {
    inputRef.current.value = ''; // ✅ امسح الـ DOM value مباشرة
    inputRef.current.blur();     // ✅ شيل الـ focus عشان السكانر التاني ميكتبش فيه
  }
  
  setPopup(state);
  popupTimerRef.current = setTimeout(() => {
    setPopup(null);
    setBarcode('');
    lastScannedRef.current = '';      // ✅ reset عشان نفس الباركود يشتغل تاني
    lastScannedTimeRef.current = 0;   // ✅
    setTimeout(() => inputRef.current?.focus(), 100);
  }, 6000);
}, []);

const closePopup = useCallback(() => {
  if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
  setPopup(null);
  setBarcode('');
  if (inputRef.current) {
    inputRef.current.value = ''; // ✅ امسح الـ DOM value مباشرة
  }
  lastScannedRef.current = '';      // ✅ reset
  lastScannedTimeRef.current = 0;   // ✅
  setTimeout(() => {
    setBarcode('');
    inputRef.current?.focus();
  }, 100);
}, []);
  // ─── Queue processor ──────────────────────────────────────────────────────
const processQueue = useCallback(async () => {
  if (isProcessingRef.current) return;
  if (scanQueueRef.current.length === 0) return;

  isProcessingRef.current = true;
  setIsProcessingState(true); // ✅ UI هيتحدث

  while (scanQueueRef.current.length > 0) {
    const trimmed = scanQueueRef.current.shift()!;
    setQueueSize(scanQueueRef.current.length);

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
        continue;
      }

      const result = await attendanceScanService.scanBarcode(trimmed);

      if (result.success) {
        playSound('success');
        showPopup({
          type: 'success',
          title: 'تم بنجاح!',
          message: result.message,
          data: result.data,
        });
        fetchTodaySummary();
        fetchRecentScans();
      } else {
        playSound('warning');
        showPopup({
          type: 'warning',
          title: 'تحذير!',
          message: translateError(result.message, trimmed),
        });
      }

    } catch (err) {
      const isNetworkError =
        err instanceof TypeError &&
        err.message.toLowerCase().includes('fetch');

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
          continue;
        } catch {}
      }

      playSound('error');
      const msg = err instanceof Error ? err.message : undefined;
      showPopup({
        type: 'error',
        title: 'خطأ!',
        message: translateError(msg, trimmed),
      });
    }
  }

  isProcessingRef.current = false;
  setIsProcessingState(false); // ✅
  setQueueSize(0);
}, [user?.id, showPopup, fetchTodaySummary, fetchRecentScans]);

  // ─── Main scan handler ────────────────────────────────────────────────────
const handleScan = useCallback((scannedBarcode: string) => {
  const trimmed = scannedBarcode.trim();
  if (!trimmed) return;

  const now = Date.now();
  if (
    lastScannedRef.current === trimmed &&
    now - lastScannedTimeRef.current < 3000
  ) return;

  lastScannedRef.current     = trimmed;
  lastScannedTimeRef.current = now;

  setBarcode('');
  if (inputRef.current) {
    inputRef.current.value = ''; // ✅ امسح الـ DOM مباشرة قبل أي حاجة
  }
  inputRef.current?.blur();

  scanQueueRef.current.push(trimmed);
  setQueueSize(scanQueueRef.current.length);
  processQueue();
}, [processQueue]);

  // ─── Keyboard handler ─────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (popup) {
        if (e.key === 'Escape' || e.key === 'Enter') {
          closePopup();
          setBarcode(''); // ✅ امسح عند إغلاق الـ popup بـ Enter/Escape
        }
        return;
      }

      if (showQRScanner) return;

      const target = e.target as HTMLElement;

      // ✅ لو الـ focus على الـ input، سيبه يشتغل طبيعي
      if (target === inputRef.current) {
        if (e.key === 'Enter' && barcode.trim()) {
          handleScan(barcode.trim());
        }
        return;
      }

      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) return;

      if (e.key === 'Enter') {
        const val = barcode.trim();
        if (val) handleScan(val);
        return;
      }

      if (e.key === 'Backspace') {
        e.preventDefault();
        setBarcode(prev => prev.slice(0, -1));
        return;
      }

      // ✅ Focus فقط — الـ input هيستقبل الحرف تلقائياً
      if (!e.ctrlKey && !e.altKey && !e.metaKey && e.key.length === 1) {
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [barcode, popup, showQRScanner, handleScan, closePopup]);

  // ─── Auto-focus ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!popup && !showQRScanner) {
      const timer = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    }
  }, [showQRScanner, popup]);

  // ─── Barcode scanner hook ─────────────────────────────────────────────────
  useBarcodeScanner({
    onScan: handleScan,
    inputRef,
    disabled: !!popup || showQRScanner,
    minLength: 3,
    scanDelay: 50,
  });

  // ─── Input handlers ───────────────────────────────────────────────────────
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const val = e.target.value;

  if (val.includes('\n') || val.includes('\r')) {
    const clean = val.replace(/[\n\r]/g, '').trim();
    if (clean) handleScan(clean);
    setBarcode('');
    inputRef.current?.blur();
    return;
  }

  // ✅ إزالة الـ dedup اللي كانت بتكسر الباركودات المنتهية بأرقام متكررة
  const asciiOnly = val.replace(/[^\x20-\x7E]/g, '');
  setBarcode(asciiOnly);
};

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && barcode.trim()) handleScan(barcode.trim());
  };

  // ─── QR scan ─────────────────────────────────────────────────────────────
  const handleQRScan = useCallback((data: string) => {
    setShowQRScanner(false);
    lastScannedRef.current     = '';
    lastScannedTimeRef.current = 0;
    try {
      const parsed = JSON.parse(data);
      handleScan(parsed.barcode ?? data);
    } catch {
      handleScan(data);
    }
  }, [handleScan]);

  // ─── User attendance modal ────────────────────────────────────────────────
  const handleShowUserAttendance = useCallback(async (scan: any) => {
    if (!scan.userId?._id) return;
    try {
      const data = await attendanceScanService.getUserAttendanceRecords(scan.userId._id, 50);
      setUserAttendanceModal({
        isOpen: true,
        userName: scan.userId.name,
        userId: scan.userId._id,
        attendanceRecords: data.data?.records || data.data || [],
      });
    } catch {
      showPopup({ type: 'error', title: 'خطأ!', message: 'فشل في جلب سجلات الحضور' });
    }
  }, [showPopup]);

  const handleCloseUserAttendanceModal = useCallback(() => {
    setUserAttendanceModal({ isOpen: false, userName: '', userId: '', attendanceRecords: [] });
  }, []);

  // ─── Online sync ──────────────────────────────────────────────────────────
  useEffect(() => {
    const handleOnline = async () => {
      if (syncInProgress.current) return;
      syncInProgress.current = true;

      try {
        const { syncedCount, failedCount, importantMessages } = await syncData();
        const messages: string[] = [];

        if (importantMessages.length > 0) {
          const messageCounts: Record<string, number> = {};
          importantMessages.forEach(msg => {
            messageCounts[msg] = (messageCounts[msg] || 0) + 1;
          });
          Object.entries(messageCounts).forEach(([msg, count]) => {
            messages.push(`⚠️ ${msg} (${count} ${count > 1 ? 'أعضاء' : 'عضو'})`);
          });
        }

        if (syncedCount > 0) messages.push(`✅ تم تسجيل ${syncedCount} حضور بنجاح`);
        if (failedCount > 0) messages.push(`❌ فشل تسجيل ${failedCount} حضور`);

        if (messages.length === 0) {
          showPopup({ type: 'success', title: 'الاتصال عاد', message: 'تم استعادة الاتصال بالإنترنت.' });
        } else {
          let popupType: 'success' | 'warning' | 'error' = 'success';
          let popupTitle = 'نتيجة المزامنة';
          let soundType: 'success' | 'warning' | 'error'  = 'success';

          if (importantMessages.length > 0 && syncedCount === 0 && failedCount === 0) {
            popupType = 'warning'; popupTitle = 'تنبيهات هامة';    soundType = 'warning';
          } else if (failedCount > 0) {
            popupType = 'error';   popupTitle = 'نتيجة المزامنة';  soundType = 'error';
          } else if (importantMessages.length > 0) {
            popupType = 'warning'; popupTitle = 'تنبيهات ومزامنة'; soundType = 'warning';
          }

          playSound(soundType);
          showPopup({ type: popupType, title: popupTitle, message: messages.join('<br>') });
        }

        if (syncedCount > 0 || failedCount > 0) {
          fetchTodaySummary();
          fetchRecentScans();
        }
      } catch {
        playSound('error');
        showPopup({ type: 'error', title: 'خطأ في المزامنة', message: 'حدث خطأ أثناء مزامنة البيانات.' });
      } finally {
        syncInProgress.current = false;
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [showPopup, fetchTodaySummary, fetchRecentScans]);

  // ─── Render ───────────────────────────────────────────────────────────────
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

        {/* Online + Queue indicator */}
        <div className="flex items-center gap-3 flex-wrap">
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

          {/* ✅ Queue indicator — بيظهر بس لو في سكانات شغالة */}
          {queueSize > 0 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              جاري معالجة {queueSize} سكان...
            </div>
          )}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <ScannerCard
            isOnline={isOnline}
            barcode={barcode}
            inputRef={inputRef}
            isScanning={isProcessingState}
            onBarcodeChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onSubmit={() => barcode.trim() && handleScan(barcode.trim())}
            onShowQRScanner={() => setShowQRScanner(true)}
          />

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
                                weekday: 'short', day: '2-digit', month: '2-digit',
                              })}
                            </div>
                            <div className="text-gray-500 dark:text-gray-400 text-xs">
                              {new Date(record.date).toLocaleTimeString('ar-SA', {
                                hour: '2-digit', minute: '2-digit',
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