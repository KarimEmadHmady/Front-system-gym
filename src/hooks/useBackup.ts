// hooks/useBackup.ts
import { useState, useCallback } from 'react';
import backupService from '@/services/backup.service';
import {
  BackupFile,
  BackupCheckResponse,
  ManualBackupResponse,
  BackupNotification,
} from '@/types/backup.types';

interface UseBackupReturn {
  backups: BackupFile[];
  checkResult: BackupCheckResponse | null;
  loading: boolean;
  manualLoading: boolean;
  error: string | null;
  notification: BackupNotification | null;
  checkBackup: () => Promise<BackupCheckResponse | null>;
  runManualBackup: () => Promise<ManualBackupResponse | null>;
  clearNotification: () => void;
}

export function useBackup(): UseBackupReturn {
  const [checkResult, setCheckResult]     = useState<BackupCheckResponse | null>(null);
  const [backups, setBackups]             = useState<BackupFile[]>([]);
  const [loading, setLoading]             = useState(false);
  const [manualLoading, setManualLoading] = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [notification, setNotification]   = useState<BackupNotification | null>(null);

  const checkBackup = useCallback(async (): Promise<BackupCheckResponse | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await backupService.checkAndBackup();
      setCheckResult(data);
      setBackups(data.existingBackups ?? []);
      return data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'حدث خطأ أثناء التحقق';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

const runManualBackup = useCallback(async (): Promise<ManualBackupResponse | null> => {
  try {
    setManualLoading(true);
    setError(null);
    const data = await backupService.manualBackup();

    // ✅ حدّث الـ checkResult عشان الـ UI يتغير
    setCheckResult(prev => prev ? {
      ...prev,
      shouldBackup: true,
      backup: data.backup,
    } : null);

    setNotification({
      type: 'success',
      message: `✅ تم عمل نسخة يدوية — ${data.backup.fileName} (${data.backup.sizeMB} MB)`,
    });

    return data;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'فشل عمل النسخة الاحتياطية';
    setError(message);
    setNotification({ type: 'error', message: `❌ ${message}` });
    return null;
  } finally {
    setManualLoading(false);
  }
}, []);

  return {
    backups,
    checkResult,
    loading,
    manualLoading,
    error,
    notification,
    checkBackup,
    runManualBackup,
    clearNotification: () => setNotification(null),
  };
}