import { apiRequest } from '@/lib/api';
import type { ApiResponse, PaginationParams, PaginatedResponse } from '@/types';

type LegacyPaginatedResponse<T> =
  | { data: T[]; page: number; limit: number; total: number; totalPages: number }
  | { results: T[]; page: number; limit: number; count: number; totalPages: number }
  | { data: T[]; pagination: { page: number; limit: number; total: number; totalPages: number } };

function normalizePaginatedResponse<T>(raw: any): PaginatedResponse<T> {
  if (!raw || typeof raw !== 'object') {
    return { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
  }

  // Already normalized
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

  // Common backend shape: { data, page, limit, total, totalPages }
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

  // Alternate backend shape: { results, count, page, limit, totalPages }
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

  // Fallback
  return { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
}

export class BaseService {
  protected baseEndpoint: string;

  constructor(baseEndpoint: string) {
    this.baseEndpoint = baseEndpoint;
  }

  // Generic CRUD operations
  async getAll<T>(params?: PaginationParams): Promise<PaginatedResponse<T>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const endpoint = `${this.baseEndpoint}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiRequest(endpoint);
    const raw: LegacyPaginatedResponse<T> = await response.json();
    return normalizePaginatedResponse<T>(raw);
  }

  async getById<T>(id: string): Promise<T> {
    const response = await apiRequest(`${this.baseEndpoint}/${id}`);
    return response.json();
  }

  async create<T>(data: any): Promise<T> {
    const response = await apiRequest(this.baseEndpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async update<T>(id: string, data: any): Promise<T> {
    const response = await apiRequest(`${this.baseEndpoint}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async delete(id: string): Promise<void> {
    await apiRequest(`${this.baseEndpoint}/${id}`, {
      method: 'DELETE',
    });
  }

  // Generic API call method
  async apiCall<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await apiRequest(`${this.baseEndpoint}${endpoint}`, options);
    return response.json();
  }
}
