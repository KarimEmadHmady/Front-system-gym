// services/backup.service.ts
import {
  BackupCheckResponse,
  ManualBackupResponse,
} from '@/types/backup.types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/backup`
  : '/backup';

class BackupService {
  private getAuthHeaders(): Record<string, string> {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  // GET /api/backup/check
  async checkAndBackup(): Promise<BackupCheckResponse> {
    const response = await fetch(`${BASE_URL}/check`, {
      method: 'GET',
      headers: { ...this.getAuthHeaders(), 'Content-Type': 'application/json' },
    });

    if (response.status === 401) throw new Error('Invalid token - please login again');
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

    return response.json();
  }

  // POST /api/backup/manual
  // الراوت بيرجع binary مباشرة — بنعمل trigger للتنزيل هنا
async manualBackup(): Promise<ManualBackupResponse> {
  const response = await fetch(`${BASE_URL}/manual`, {
    method: 'POST',
    headers: this.getAuthHeaders(),
  });

  if (response.status === 401) throw new Error('Invalid token - please login again');
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

  // ✅ استخرج metadata من headers
  const fileName         = response.headers.get('X-Backup-FileName')          ?? `backup-${Date.now()}.zip`;
  const sizeMB           = response.headers.get('X-Backup-SizeMB')            ?? '0';
  const totalDocuments   = Number(response.headers.get('X-Backup-TotalDocuments')   ?? 0);
  const totalCollections = Number(response.headers.get('X-Backup-TotalCollections') ?? 0);
  const createdAt        = response.headers.get('X-Backup-CreatedAt')         ?? new Date().toISOString();

  // ✅ نزّل كـ ZIP مش JSON
  const blob = await response.blob();
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href  = url;
  link.setAttribute('download', fileName); // اسمه هيبقى مثلاً backup-2026-04-06_13-50-36.zip
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return {
    success: true,
    message: 'تم إنشاء النسخة الاحتياطية وتنزيلها بنجاح',
    backup: { fileName, sizeMB, totalDocuments, totalCollections, createdAt },
  };
}
}

export default new BackupService();