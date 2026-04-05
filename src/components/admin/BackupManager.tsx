// components/admin/BackupManager.tsx
import React, { useState } from 'react';
import { useBackup } from '@/hooks/useBackup';
import { 
  Database, 
  Download, 
  RefreshCw, 
  Calendar, 
  FileText, 
  HardDrive, 
  CheckCircle, 
  AlertCircle, 
  X,
  Play,
  Trash2
} from 'lucide-react';

interface BackupManagerProps {
  className?: string;
}

export function BackupManager({ className = '' }: BackupManagerProps) {
  const {
    backups,
    checkResult,
    loading,
    manualLoading,
    downloadingFile,
    error,
    notification,
    checkBackup,
    fetchBackups,
    downloadBackup,
    runManualBackup,
    clearNotification,
  } = useBackup();

  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (sizeMB: string) => {
    return `${sizeMB} MB`;
  };

  const getNextBackupDate = () => {
    if (!checkResult?.nextBackup) return '';
    return checkResult.nextBackup;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              🗄️ النسخ الاحتياطي
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              إدارة نسخ احتياطية لقاعدة البيانات
            </p>
          </div>
        </div>
        <button
          onClick={fetchBackups}
          disabled={loading}
          className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="تحديث القائمة"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`mb-4 p-4 rounded-lg flex items-center justify-between ${
          notification.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800' :
          notification.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800' :
          'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {notification.type === 'error' && <AlertCircle className="w-5 h-5" />}
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

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Next Backup Info */}
      {checkResult && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {checkResult.shouldBackup ? 'تم عمل نسخة احتياطية اليوم' : 'النسخة الاحتياطية القادمة'}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {checkResult.shouldBackup 
                    ? `تم إنشاء: ${checkResult.backup.fileName}`
                    : `في: ${getNextBackupDate()}`
                  }
                </p>
              </div>
            </div>
            {checkResult.shouldBackup && (
              <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                <HardDrive className="w-4 h-4" />
                <span>{checkResult.backup.sizeMB} MB</span>
                <FileText className="w-4 h-4 ml-2" />
                <span>{checkResult.backup.totalDocuments} سجل</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={runManualBackup}
          disabled={manualLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {manualLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>جاري إنشاء نسخة احتياطية...</span>
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

      {/* Backups List */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          📦 النسخ الاحتياطية المتاحة ({backups.length})
        </h4>
        
        {backups.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>لا توجد نسخ احتياطية حالياً</p>
            <p className="text-sm">قم بإنشاء نسخة احتياطية يدوية للبدء</p>
          </div>
        ) : (
          <div className="space-y-2">
            {backups.map((backup) => (
              <div
                key={backup.fileName}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded">
                    <Database className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {backup.fileName}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>{formatFileSize(backup.sizeMB)}</span>
                      <span>{formatDate(backup.createdAt)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadBackup(backup.fileName)}
                    disabled={downloadingFile === backup.fileName}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {downloadingFile === backup.fileName ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>جاري التنزيل...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3 h-3" />
                        <span>تنزيل</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
        <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          ℹ️ معلومات النسخ الاحتياطي
        </h5>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• يتم إنشاء نسخة احتياطية تلقائية يوم 1 و 15 من كل شهر</li>
          <li>• يمكن إنشاء نسخ احتياطية يدوية في أي وقت</li>
          <li>• يتم تخزين النسخ الاحتياطية على الخادم بشكل آمن</li>
          <li>• يمكن تنزيل أي نسخة احتياطية عند الحاجة</li>
        </ul>
      </div>
    </div>
  );
}
