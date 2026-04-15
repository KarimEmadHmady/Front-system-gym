// components/admin/AutoBackupManager.tsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useBackup } from '@/hooks/useBackup';
import {
  Database,
  Calendar,
  HardDrive,
  FileText,
  RefreshCw,
  CheckCircle,
  X,
  Shield,
  Download,
  Settings,
  CloudOff,
  Vault,
} from 'lucide-react';

interface AutoBackupManagerProps {
  onOpenSettings?: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isBackupDay = (): boolean => {
  const day = new Date().getDate();
  return day === 1 || day === 15;
};

const getTodayString = (): string => new Date().toDateString();

const wasDismissedToday = (): boolean =>
  localStorage.getItem('backup-dismissed') === getTodayString();

// ─── StatPill ─────────────────────────────────────────────────────────────────

interface StatPillProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'emerald' | 'blue';
}

function StatPill({ icon, label, value, color }: StatPillProps) {
  const colors = {
    emerald:
      'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300',
    blue: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300',
  };
  return (
    <div className={`flex items-center gap-2.5 border rounded-xl px-4 py-3 ${colors[color]}`}>
      <div className="shrink-0">{icon}</div>
      <div>
        <p className="text-[10px] uppercase tracking-widest opacity-60 font-medium">{label}</p>
        <p className="text-sm font-bold leading-tight">{value}</p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AutoBackupManager({ onOpenSettings }: AutoBackupManagerProps) {
  const {
    checkResult,
    loading,
    manualLoading,
    runManualBackup,
  } = useBackup();

  const [showModal, setShowModal] = useState<boolean>(() => {
    if (!isBackupDay()) return false;
    if (wasDismissedToday()) return false;
    return true;
  });

  // ── One-shot guard ─────────────────────────────────────────────────────────
  const backupTriggered = useRef(false);

  // ── Derived ───────────────────────────────────────────────────────────────
  // Read backup data from the result returned by runManualBackup
  const [backupData, setBackupData] = useState<{
    fileName: string;
    sizeMB: string;
    totalDocuments: number;
  } | null>(null);

  const isWorking = manualLoading;

  // ── Step ──────────────────────────────────────────────────────────────────
  type Step = 'idle' | 'creating' | 'done';

  const step: Step =
    !!backupData    ? 'done'
    : manualLoading ? 'creating'
    : 'idle';

  const stepIndex = { idle: -1, creating: 0, done: 1 }[step];

  const steps = [
    { id: 'create', label: 'إنشاء النسخة' },
    { id: 'done',   label: 'اكتمل'         },
  ];

  // ── Effect: trigger backup ONCE on open ───────────────────────────────────
  useEffect(() => {
    if (!showModal) return;
    if (loading) return;
    if (manualLoading) return;
    if (backupTriggered.current) return;

    backupTriggered.current = true;

    const t = setTimeout(async () => {
      // التنزيل بيحصل أوتوماتيك جوّه الـ service
      const result = await runManualBackup();

      if (result && result.success) {
        setBackupData({
          fileName:       result.backup.fileName,
          sizeMB:         result.backup.sizeMB,
          totalDocuments: result.backup.totalDocuments,
        });
      }
    }, 1500);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleDismiss = useCallback(() => {
    localStorage.setItem('backup-dismissed', getTodayString());
    setShowModal(false);
  }, []);

  const handleGoToSettings = useCallback(() => {
    setShowModal(false);
    onOpenSettings?.();
  }, [onOpenSettings]);

  // Manual re-trigger (user pressed button after idle)
  const handleManualBackup = useCallback(async () => {
    if (manualLoading) return;
    backupTriggered.current = true;
    // التنزيل بيحصل أوتوماتيك جوّه الـ service
    const result = await runManualBackup();
    if (result && result.success) {
      setBackupData({
        fileName:       result.backup.fileName,
        sizeMB:         result.backup.sizeMB,
        totalDocuments: result.backup.totalDocuments,
      });
    }
  }, [runManualBackup, manualLoading]);

  // ── Guard ─────────────────────────────────────────────────────────────────
  if (!isBackupDay() || !showModal) return null;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700/80 overflow-hidden">

        {/* Decorative glow */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none" />
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-400 to-blue-500" />

        <div className="relative p-7">

          {/* ── Header ── */}
          <div className="flex items-start justify-between mb-7">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/30">
                  <Vault className="w-7 h-7 text-white" />
                </div>
                {isWorking && (
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-blue-500" />
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight tracking-tight">
                  النسخ الاحتياطي الشهري
                </h3>
                <p className="flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 mt-0.5">
                  <Calendar className="w-3.5 h-3.5" />
                  اليوم هو يوم النسخ المجدول
                </p>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="p-2 text-gray-300 hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
              aria-label="إلغاء وإغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ── Progress steps ── */}
          <div className="flex items-center mb-7">
            {steps.map((s, i) => {
              const done    = i < stepIndex;
              const active  = i === stepIndex;
              const pending = i > stepIndex;
              return (
                <React.Fragment key={s.id}>
                  <div className="flex flex-col items-center gap-1.5">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500
                      ${done    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30' : ''}
                      ${active  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-4 ring-blue-100 dark:ring-blue-900/50' : ''}
                      ${pending ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600' : ''}
                    `}>
                      {done ? <CheckCircle className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className={`text-[10px] font-medium tracking-wide whitespace-nowrap
                      ${done || active ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-600'}
                    `}>
                      {s.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mb-4 mx-1 rounded-full transition-all duration-700
                      ${i < stepIndex ? 'bg-emerald-400' : 'bg-gray-200 dark:bg-gray-700'}
                    `} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* ── Info list ── */}
          <div className="bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/50 rounded-2xl p-4 mb-5">
            <ul className="space-y-2.5">
              {[
                { icon: <Database className="w-3.5 h-3.5" />, text: 'نسخة كاملة من جميع بيانات قاعدة البيانات' },
                { icon: <Download className="w-3.5 h-3.5" />, text: 'يُنزَّل الملف تلقائياً على جهازك فور الإنشاء' },
                { icon: <Settings className="w-3.5 h-3.5" />, text: 'يمكن إدارة النسخ من صفحة الإعدادات' },
              ].map(({ icon, text }) => (
                <li key={text} className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                  <span className="text-blue-500 shrink-0">{icon}</span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          {/* ── Dynamic status ── */}
          <div className="min-h-[56px] mb-5">

            {step === 'creating' && (
              <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/60 rounded-2xl text-blue-800 dark:text-blue-200">
                <RefreshCw className="w-5 h-5 animate-spin shrink-0 text-blue-500" />
                <div>
                  <p className="font-semibold text-sm">جاري إنشاء النسخة الاحتياطية وتنزيلها…</p>
                  <p className="text-xs opacity-60 mt-0.5">قد يستغرق هذا لحظات، لا تغلق الصفحة</p>
                </div>
              </div>
            )}

            {step === 'done' && (
              <div>
                <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl text-emerald-800 dark:text-emerald-200 mb-3">
                  <CheckCircle className="w-5 h-5 shrink-0 text-emerald-500" />
                  <p className="font-semibold text-sm">تمت النسخة الاحتياطية وتنزيلها بنجاح! 🎉</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <StatPill
                    icon={<HardDrive className="w-4 h-4" />}
                    label="الحجم"
                    value={`${backupData?.sizeMB ?? '—'} MB`}
                    color="emerald"
                  />
                  <StatPill
                    icon={<FileText className="w-4 h-4" />}
                    label="السجلات"
                    value={(backupData?.totalDocuments ?? 0).toLocaleString('ar-EG')}
                    color="blue"
                  />
                </div>
              </div>
            )}

            {step === 'idle' && !loading && (
              <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/60 rounded-2xl text-amber-800 dark:text-amber-200">
                <CloudOff className="w-5 h-5 shrink-0 text-amber-500" />
                <div>
                  <p className="font-semibold text-sm">لم يتم إنشاء نسخة بعد</p>
                  <p className="text-xs opacity-60 mt-0.5">اضغط "إنشاء نسخة" للبدء</p>
                </div>
              </div>
            )}
          </div>

          {/* ── Actions ── */}
          <div className="flex flex-col gap-2.5">

            {step === 'idle' && (
              <button
                onClick={handleManualBackup}
                disabled={isWorking}
                className="
                  w-full flex items-center justify-center gap-2.5
                  px-5 py-3.5 rounded-2xl font-bold text-sm text-white
                  bg-gradient-to-r from-blue-600 to-indigo-600
                  hover:from-blue-700 hover:to-indigo-700
                  disabled:opacity-50 disabled:cursor-not-allowed
                  shadow-lg shadow-blue-500/25
                  transition-all duration-200 active:scale-[0.98]
                "
              >
                <Shield className="w-4 h-4" />
                إنشاء نسخة الآن
              </button>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleGoToSettings}
                className="
                  flex-1 flex items-center justify-center gap-2
                  px-4 py-3 rounded-2xl font-semibold text-sm
                  text-gray-600 dark:text-gray-300
                  bg-gray-100 dark:bg-gray-800
                  hover:bg-gray-200 dark:hover:bg-gray-700
                  transition-all duration-200 active:scale-[0.98]
                "
              >
                <Settings className="w-4 h-4" />
                الإعدادات
              </button>
              <button
                onClick={handleDismiss}
                className="
                  flex-1 px-4 py-3 rounded-2xl font-semibold text-sm
                  text-gray-400 dark:text-gray-500
                  hover:bg-gray-100 dark:hover:bg-gray-800
                  transition-all duration-200
                "
              >
                إغلاق
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}