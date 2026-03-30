import { BaseService } from './baseService';
import { API_ENDPOINTS } from '@/lib/constants';
import type { PaginatedResponse, PaginationParams } from '@/types';

export interface PurchaseDTO {
  _id: string;
  userId: string;
  itemName: string;
  price: number;
  date?: string;
  createdAt?: string;
  updatedAt?: string;
}

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

export class PurchaseService extends BaseService {
  constructor() {
    super(API_ENDPOINTS.purchases.list);
  }

  async getPurchases(params?: PaginationParams): Promise<PaginatedResponse<PurchaseDTO>> {
    return this.getAll<PurchaseDTO>(params);
  }

  async getPurchasesByUser(userId: string, params?: PaginationParams): Promise<PaginatedResponse<PurchaseDTO>> {
    const qs = new URLSearchParams();
    if (params?.page) qs.append('page', String(params.page));
    if (params?.limit) qs.append('limit', String(params.limit));
    if (params?.sortBy) qs.append('sortBy', params.sortBy);
    if (params?.sortOrder) qs.append('sortOrder', params.sortOrder);

    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    const raw: LegacyPaginatedResponse<PurchaseDTO> | PurchaseDTO[] = await this.apiCall<any>(`/user/${userId}${suffix}`);
    if (Array.isArray(raw)) {
      return {
        data: raw,
        pagination: {
          page: Number(params?.page ?? 1),
          limit: Number(params?.limit ?? raw.length ?? 10),
          total: raw.length,
          totalPages: 1,
        },
      };
    }
    return normalizePaginatedResponse<PurchaseDTO>(raw);
  }

  async getByUser(userId: string): Promise<PurchaseDTO[]> {
    return this.apiCall<PurchaseDTO[]>(`/user/${userId}`);
  }

  async listAll(): Promise<PurchaseDTO[]> {
    return this.apiCall<PurchaseDTO[]>(``);
  }

  async createPurchase(data: { userId?: string; itemName: string; price: number; date?: string }): Promise<PurchaseDTO> {
    // Will use userId from token unless admin/manager supplies one
    return super.create<PurchaseDTO>(data);
  }

  async updatePurchase(id: string, data: Partial<{ userId: string; itemName: string; price: number; date: string }>): Promise<PurchaseDTO> {
    return super.update<PurchaseDTO>(id, data);
  }

  async deletePurchase(id: string): Promise<void> {
    return super.delete(id);
  }
}


