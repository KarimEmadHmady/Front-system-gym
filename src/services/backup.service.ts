// services/backup.service.ts
import {
  BackupCheckResponse,
  BackupListResponse,
  ManualBackupResponse,
} from '@/types/backup.types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/backup`
  : '/backup';

class BackupService {
  private getAuthHeaders(): Record<string, string> {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  // ─────────────────────────────────────────────
  // GET /api/backup/check
  // تشيك التاريخ - لو يوم 1 أو 15 بيعمل backup تلقائي
  // ─────────────────────────────────────────────
  async checkAndBackup(): Promise<BackupCheckResponse> {
    const response = await fetch(`${BASE_URL}/check`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    // Handle auth errors
    if (response.status === 401) {
      throw new Error('Invalid token - please login again');
    }
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }

  // ─────────────────────────────────────────────
  // GET /api/backup/list
  // جيب قائمة كل الـ backups الموجودة
  // ─────────────────────────────────────────────
  async listBackups(): Promise<BackupListResponse> {
    const response = await fetch(`${BASE_URL}/list`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return response.json();
  }

  // ─────────────────────────────────────────────
  // GET /api/backup/download/:fileName
  // تنزيل backup معين - بيرجع blob مش JSON
  // ─────────────────────────────────────────────
  async downloadBackup(fileName: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/download/${fileName}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('فشل تنزيل الملف');
    }

    const blob = await response.blob();
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // ─────────────────────────────────────────────
  // POST /api/backup/manual
  // backup يدوي فوري بغض النظر عن التاريخ
  // ─────────────────────────────────────────────
  async manualBackup(): Promise<ManualBackupResponse> {
    const response = await fetch(`${BASE_URL}/manual`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    return response.json();
  }
}

export default new BackupService();