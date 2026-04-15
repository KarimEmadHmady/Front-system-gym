// types/backup.types.ts

export interface BackupFile {
  fileName: string;
  sizeMB: string;
  createdAt: string;
}

export type CheckReason = 'not_backup_day' | 'already_done_today' | 'manual_action_required'; 

interface BackupCheckBase {
  success: boolean;
  nextBackup: string;
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
  backup?: BackupDetails; 
}
export type BackupCheckResponse = BackupCheckSkipped | BackupCheckDone;

export interface BackupDetails {
  fileName: string;
  sizeMB: string;
  totalCollections: number;
  totalDocuments: number;
  createdAt: string;
}

// ✅ مفيش existingBackups هنا لأن الراوت بيرجع binary مش JSON
export interface ManualBackupResponse {
  success: boolean;
  message: string;
  backup: BackupDetails;
}

export type NotificationType = 'success' | 'info' | 'error';

export interface BackupNotification {
  type: NotificationType;
  message: string;
}