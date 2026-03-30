import { BaseService } from './baseService';
import { API_ENDPOINTS } from '@/lib/constants';
import { SessionSchedule } from '@/types';
import type { PaginatedResponse, PaginationParams } from '@/types';

type LegacyPaginatedResponse<T> =
  | { data: T[]; page: number; limit: number; total: number; totalPages: number }
  | { results: T[]; page: number; limit: number; count: number; totalPages: number }
  | { data: T[]; pagination: { page: number; limit: number; total: number; totalPages: number } };

function normalizePaginatedResponse<T>(raw: any): PaginatedResponse<T> {
  if (!raw || typeof raw !== 'object') {
    return { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
  }

  if (Array.isArray(raw.data) && raw.pagination && typeof raw.pagination === 'object') {
    const { page, limit, total, totalPages } = raw.pagination;
    return {
      data: raw.data,
      pagination: {
        page: Number(page ?? 1),
        limit: Number(limit ?? raw.data.length ?? 10),
        total: Number(total ?? raw.data.length ?? 0),
        totalPages: Number(totalPages ?? 0),
      },
    };
  }

  if (Array.isArray(raw.data)) {
    return {
      data: raw.data,
      pagination: {
        page: Number(raw.page ?? 1),
        limit: Number(raw.limit ?? raw.data.length ?? 10),
        total: Number(raw.total ?? raw.data.length ?? 0),
        totalPages: Number(raw.totalPages ?? 0),
      },
    };
  }

  if (Array.isArray(raw.results)) {
    return {
      data: raw.results,
      pagination: {
        page: Number(raw.page ?? 1),
        limit: Number(raw.limit ?? raw.results.length ?? 10),
        total: Number(raw.count ?? raw.results.length ?? 0),
        totalPages: Number(raw.totalPages ?? 0),
      },
    };
  }

  return { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
}

export class SessionScheduleService extends BaseService {
  constructor() {
    super(API_ENDPOINTS.sessionSchedules.list);
  }

  async getSessions(params?: (PaginationParams & { date?: string; status?: string })): Promise<PaginatedResponse<SessionSchedule>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params?.date) queryParams.append('date', params.date);
    if (params?.status) queryParams.append('status', params.status);

    const raw: LegacyPaginatedResponse<SessionSchedule> = await this.apiCall<any>(
      `${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    return normalizePaginatedResponse<SessionSchedule>(raw);
  }

  // جلب جميع الجلسات
  async getAllSessions(): Promise<SessionSchedule[]> {
    try {
      const response = await this.apiCall<SessionSchedule[]>('');
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error in getAllSessions:', error);
      throw error;
    }
  }

  // جلب الجلسات لمستخدم (كعضو أو مدرب)
  async getSessionsByUser(userId: string): Promise<SessionSchedule[]> {
    const response = await this.apiCall<SessionSchedule[]>(`/${userId}`);
    return response;
  }

  // إنشاء جلسة جديدة
  async createSession(userId: string, session: Partial<SessionSchedule>): Promise<SessionSchedule> {
    const response = await this.apiCall<SessionSchedule>(`/${userId}`, {
      method: 'POST',
      body: JSON.stringify(session),
    });
    return response;
  }

  // تحديث جلسة
  async updateSession(id: string, session: Partial<SessionSchedule>): Promise<SessionSchedule> {
    const response = await this.apiCall<SessionSchedule>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(session),
    });
    return response;
  }

  // حذف جلسة
  async deleteSession(id: string): Promise<void> {
    await this.apiCall<void>(`/${id}`, {
      method: 'DELETE',
    });
  }
}
