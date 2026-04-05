



      // hooks/useBackup.ts
import { useState, useCallback } from 'react';
import backupService from '@/services/backup.service';
import {
  BackupFile,
  BackupCheckResponse,
  BackupNotification,
} from '@/types/backup.types';

interface UseBackupReturn {
  backups: BackupFile[];
  checkResult: BackupCheckResponse | null;
  loading: boolean;
  manualLoading: boolean;
  downloadingFile: string | null;
  error: string | null;
  notification: BackupNotification | null;
  checkBackup: () => Promise<BackupCheckResponse | null>;
  fetchBackups: () => Promise<void>;
  downloadBackup: (fileName: string) => Promise<void>;
  runManualBackup: () => Promise<BackupCheckResponse | null>;
  clearNotification: () => void;
}

export function useBackup(): UseBackupReturn {
  const [checkResult, setCheckResult]         = useState<BackupCheckResponse | null>(null);
  const [backups, setBackups]                 = useState<BackupFile[]>([]);
  const [loading, setLoading]                 = useState(false);
  const [manualLoading, setManualLoading]     = useState(false);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [error, setError]                     = useState<string | null>(null);
  const [notification, setNotification]       = useState<BackupNotification | null>(null);

  // ── Check backup status (called once by consumer on mount) ──────────────
  // Returns the result directly so the caller can act without waiting
  // for a re-render cycle.
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
      throw err; // re-throw so AutoBackupManager can handle 401
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch backups list ──────────────────────────────────────────────────
  const fetchBackups = useCallback(async () => {
    try {
      const data = await backupService.listBackups();
      if (data.success) setBackups(data.backups);
    } catch (err: unknown) {
      console.error('Failed to fetch backups:', err);
    }
  }, []);

  // ── Download ────────────────────────────────────────────────────────────
  const downloadBackup = useCallback(async (fileName: string) => {
    try {
      setDownloadingFile(fileName);
      await backupService.downloadBackup(fileName);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'فشل التنزيل';
      setError(message);
      setNotification({ type: 'error', message: `❌ ${message}` });
    } finally {
      setDownloadingFile(null);
    }
  }, []);

  // ── Manual backup ────────────────────────────────────────────────────────
  // Returns the result directly — no need to wait for state re-render
  const runManualBackup = useCallback(async (): Promise<BackupCheckResponse | null> => {
    try {
      setManualLoading(true);
      setError(null);
      const data = await backupService.manualBackup();
      if (!data.success) throw new Error(data.message);

      const merged: BackupCheckResponse = {
        success: true,
        shouldBackup: true,
        backup: data.backup,
        existingBackups: data.existingBackups ?? [],
        nextBackup: 'النسخة التالية: 15 يناير',
        message: 'Manual backup completed successfully',
      };
      setCheckResult(merged);
      setBackups(data.existingBackups ?? []);
      setNotification({
        type: 'success',
        message: `✅ تم عمل نسخة يدوية — ${data.backup.totalDocuments} سجل / ${data.backup.sizeMB} MB`,
      });
      return merged;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'فشل عمل النسخة الاحتياطية';
      setError(message);
      setNotification({ type: 'error', message: `❌ ${message}` });
      return null;
    } finally {
      setManualLoading(false);
    }
  }, []);

  // ── No useEffect here ───────────────────────────────────────────────────
  // Consumer components are responsible for calling checkBackup() on mount.
  // This prevents double-firing when BackupManager + AutoBackupManager
  // both use this hook at the same time.

  return {
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
    clearNotification: () => setNotification(null),
  };
}