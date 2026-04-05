// types/backup.ts

// ─────────────────────────────────────────────
// Shared
// ─────────────────────────────────────────────

export interface BackupFile {
  fileName: string;
  sizeMB: string;
  createdAt: string; // ISO date string
}

// ─────────────────────────────────────────────
// GET /api/backup/check
// ─────────────────────────────────────────────

export type CheckReason = 'not_backup_day' | 'already_done_today' | 'backup_day';

interface BackupCheckBase {
  success: boolean;
  nextBackup: string;           // e.g. "15 يناير"
  existingBackups: BackupFile[];
}

export interface BackupCheckSkipped extends BackupCheckBase {
  shouldBackup: false;
  reason: CheckReason;
  message: string;
}

export interface BackupCheckDone extends BackupCheckBase {
  shouldBackup: true;
  message: string;
  backup: BackupDetails;
}

export type BackupCheckResponse = BackupCheckSkipped | BackupCheckDone;

// ─────────────────────────────────────────────
// Backup details (في check و manual)
// ─────────────────────────────────────────────

export interface BackupDetails {
  fileName: string;
  sizeMB: string;
  totalCollections: number;
  totalDocuments: number;
  createdAt: string;
}

// ─────────────────────────────────────────────
// GET /api/backup/list
// ─────────────────────────────────────────────

export interface BackupListResponse {
  success: boolean;
  count: number;
  backups: BackupFile[];
}

// ─────────────────────────────────────────────
// POST /api/backup/manual
// ─────────────────────────────────────────────

export interface ManualBackupResponse {
  success: boolean;
  message: string;
  backup: BackupDetails;
  existingBackups: BackupFile[];
}

// ─────────────────────────────────────────────
// Hook state
// ─────────────────────────────────────────────

export type NotificationType = 'success' | 'info' | 'error';

export interface BackupNotification {
  type: NotificationType;
  message: string;
}