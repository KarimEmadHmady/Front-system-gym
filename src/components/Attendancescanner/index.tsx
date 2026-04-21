'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from '@/i18n/navigation';
import {
  CheckCircle, XCircle, Clock, Calendar, QrCode,
  Scan, Camera, ArrowRight, Wifi, WifiOff,
} from 'lucide-react';
import QRCodeScanner from '@/components/admin/QRCodeScanner/QRCodeScanner';
import { attendanceScanService } from '@/services/membershipCardService';
import { queueAttendance } from '@/lib/offlineSync';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import VideoTutorial from '@/components/VideoTutorial';
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner';
import { UserAttendanceModal } from './UserAttendanceModal';

// Import extracted components
import StatusBadge from './StatusBadge';
import StatusIcon from './StatusIcon';
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

// Props
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
  }>({
    isOpen: false,
    userName: '',
    userId: '',
    attendanceRecords: []
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const lastScannedRef = useRef('');
  const popupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Network status
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
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
    fetchTodaySummary();
    fetchRecentScans();
  }, [isAuthenticated, user, isLoading, role, userId, router]);

  // Data fetchers
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

  // Auto-close popup
  const showPopup = useCallback((state: PopupState) => {
    if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
    setPopup(state);
    // Increase popup display time to 6 seconds for better visibility
    popupTimerRef.current = setTimeout(() => setPopup(null), 6000);
  }, []);

  const closePopup = useCallback(() => {
    if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
    setPopup(null);
  }, []);

  // Scan handler
  const handleScan = useCallback(async (scannedBarcode: string) => {
    if (!scannedBarcode.trim() || isScanning) return;
    setIsScanning(true);
    setBarcode('');

    // Offline
    if (!navigator.onLine) {
      try {
        await queueAttendance({
          clientUuid: `${scannedBarcode}-${Date.now()}`,
          barcode: scannedBarcode,
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
      } catch {
        playSound('error');
        showPopup({ type: 'error', title: 'خطأ!', message: 'فشل حفظ الحضور مؤقتًا.' });
      } finally {
        setIsScanning(false);
      }
      return;
    }

    // Online
    try {
      const result = await attendanceScanService.scanBarcode(scannedBarcode);
      if (result.success) {
        playSound('success');
        showPopup({ type: 'success', title: 'تم بنجاح!', message: result.message, data: result.data });
        fetchTodaySummary();
        fetchRecentScans();
      } else {
        playSound('warning');
        showPopup({ type: 'warning', title: 'تحذير!', message: translateError(result.message, scannedBarcode) });
      }
    } catch (err) {
      playSound('error');
      const msg = err instanceof Error ? err.message : undefined;
      showPopup({ type: 'error', title: 'خطأ!', message: translateError(msg, scannedBarcode) });
    } finally {
      setIsScanning(false);
    }
  }, [isScanning, user?.id, showPopup]);

  // Global keydown — works even when tab is not focused on input
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (popup || showQRScanner || isScanning) return;

      const target = e.target as HTMLElement;

      // لو الـ focus على input الباركود نفسه — سيبه للـ onChange
      if (target === inputRef.current) return;

      // Ignore if user is typing in another input/textarea
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      if (e.key === 'Enter') {
        const val = barcode.trim();
        if (val) handleScan(val);
        return;
      }

      if (e.key === 'Backspace') {
        setBarcode(prev => prev.slice(0, -1));
        inputRef.current?.focus();
        return;
      }

      // Printable chars only
      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        setBarcode(prev => prev + e.key);
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [barcode, popup, showQRScanner, isScanning, handleScan]);

  // Auto-focus after popup / QR close
  useEffect(() => {
    if (!popup && !showQRScanner && inputRef.current && !isScanning) {
      // Longer delay for mobile to prevent immediate refocusing when opening camera
      const delay = window.innerWidth <= 768 ? 5000 : 100; // 5 seconds for mobile, 100ms for desktop
      setTimeout(() => {
        inputRef.current?.focus();
      }, delay);
    }
  }, [showQRScanner, popup, isScanning]);

  // Add barcode scanner hook after handleScan is defined
  const { hidConnected, connectHID, disconnectHID } = useBarcodeScanner({
    onScan: handleScan,
    inputRef: inputRef,
    disabled: !!popup || showQRScanner || isScanning,
    minLength: 3,
    scanDelay: 50,
  });

  // Input handlers
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

  // QR handler
  const handleQRScan = (data: string) => {
    if (lastScannedRef.current === data) return;
    lastScannedRef.current = data;
    setShowQRScanner(false);
    try {
      const parsed = JSON.parse(data);
      handleScan(parsed.barcode ?? data);
    } catch {
      handleScan(data);
    }
  };

  // Helpers
  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const handleBack = () => {
    const base = role === 'admin' ? 'admin' : 'manager';
    router.push(`/${base}/dashboard/${user?.id ?? userId}`);
  };

  // User Attendance Modal Handler
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
    } catch (error) {
      console.error('Failed to fetch user attendance:', error);
      showPopup({
        type: 'error',
        title: 'خطأ!',
        message: 'فشل في جلب سجلات الحضور'
      });
    }
  }, [showPopup]);

  const handleCloseUserAttendanceModal = useCallback(() => {
    setUserAttendanceModal({
      isOpen: false,
      userName: '',
      userId: '',
      attendanceRecords: []
    });
  }, []);

  // Guard
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
        {/* Header */}
        <Header userId={userId} role={role} />

        {/* Online indicator */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
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
          {/* Scanner card */}
          <ScannerCard
            isOnline={isOnline}
            hidConnected={hidConnected}
            onConnectHID={connectHID}
            onDisconnectHID={disconnectHID}
            onShowQRScanner={() => setShowQRScanner(true)}
          />

          {/* Stats column */}
          <div className="space-y-4">
            {/* Today summary */}
            <StatsCard todaySummary={todaySummary} />

            {/* Recent scans */}
            {validScans.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <h2 className="font-semibold text-sm text-gray-900 dark:text-white">السجلات الحديثة</h2>
                </div>
                <div className="p-5">
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {validScans.slice(0, 20).map((record, index) => (
                      <div key={record._id} className="text-xs bg-gray-50 dark:bg-gray-700/30 rounded p-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 dark:text-gray-300 font-medium">
                            {record.userId.name}
                          </span>
                          <div className="text-left">
                            <div className="text-gray-600 dark:text-gray-400 text-xs">
                              {new Date(record.date).toLocaleDateString('ar-SA', {
                                weekday: 'short',
                                day: '2-digit',
                                month: '2-digit'
                              })}
                            </div>
                            <div className="text-gray-500 dark:text-gray-400 text-xs">
                              {new Date(record.date).toLocaleTimeString('ar-SA', {
                                hour: '2-digit',
                                minute: '2-digit'
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

        {/* ── QR Scanner modal ── */}
        {showQRScanner && (
          <QRCodeScanner onScan={handleQRScan} onClose={() => setShowQRScanner(false)} />
        )}

        {/* Popup */}
        {popup && (
          <Popup popup={popup} onClose={closePopup} />
        )}

        {/* User Attendance Modal */}
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
