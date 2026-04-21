// components/admin/BackupManager.tsx
import React from 'react';
import { useBackup } from '@/hooks/useBackup';
import {
  Database,
  RefreshCw,
  Calendar,
  FileText,
  HardDrive,
  CheckCircle,
  AlertCircle,
  X,
  Play,
} from 'lucide-react';

interface BackupManagerProps {
  className?: string;
}

export function BackupManager({ className = '' }: BackupManagerProps) {
  const {
    checkResult,
    loading,
    manualLoading,
    error,
    notification,
    checkBackup,
    runManualBackup,
    clearNotification,
  } = useBackup();

  const getNextBackupDate = () => {
    if (!checkResult?.nextBackup) return '';
    return checkResult.nextBackup;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>

      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
          <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            🗄️ النسخ الاحتياطي
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            إنشاء نسخ احتياطية وتنزيلها مباشرة على جهازك
          </p>
        </div>
      </div>

      {/* ── Notification ── */}
      {notification && (
        <div className={`mb-4 p-4 rounded-lg flex items-center justify-between ${
          notification.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800'
            : notification.type === 'error'
            ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
            : 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {notification.type === 'error'   && <AlertCircle className="w-5 h-5" />}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={clearNotification}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* ── Next / Last Backup Info ── */}
        {checkResult && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    {checkResult.shouldBackup
                      ? '⚠️ مطلوب نسخة احتياطية اليوم'    // ✅ صياغة صح
                      : 'النسخة الاحتياطية القادمة'}
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {checkResult.shouldBackup
                      ? 'اضغط "إنشاء نسخة احتياطية يدوية" لتنزيل النسخة'  // ✅ وجّه المستخدم
                      : `في: ${getNextBackupDate()}`}
                  </p>
                </div>
              </div>

              {/* Stats bs lo fe backup f3lan (ba3d manual backup) */}
              {checkResult.shouldBackup && checkResult.backup && (
                <div className="flex items-center gap-4 text-sm text-blue-700 dark:text-blue-300">
                  <span className="flex items-center gap-1">
                    <HardDrive className="w-4 h-4" />
                    {checkResult.backup.sizeMB} MB
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    {checkResult.backup.totalDocuments?.toString() || '0'} 
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

      {/* ── Actions ── */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={runManualBackup}
          disabled={manualLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {manualLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>جاري الإنشاء والتنزيل...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>إنشاء نسخة احتياطية يدوية</span>
            </>
          )}
        </button>

        <button
          onClick={checkBackup}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>جاري التحقق...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              <span>فحص تلقائي</span>
            </>
          )}
        </button>
      </div>

      {/* ── Info Section ── */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
        <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          ℹ️ معلومات النسخ الاحتياطي
        </h5>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• يتم إنشاء نسخة احتياطية تلقائية يوم 1 و 15 من كل شهر</li>
          <li>• يمكن إنشاء نسخ احتياطية يدوية في أي وقت</li>
          <li>• يتم تنزيل الملف مباشرة على جهازك فور الإنشاء</li>
          <li>• لا يتم تخزين النسخ على الخادم</li>
        </ul>
      </div>

    </div>
  );
}