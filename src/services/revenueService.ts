import { apiGet, apiPost, apiPut } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/constants';

export interface Revenue {
  _id: string;
  amount: number;
  date: string;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'bank_transfer' | 'other';
  sourceType: 'subscription' | 'purchase' | 'invoice' | 'other';
  userId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RevenueListParams {
  sourceType?: string;
  paymentMethod?: string;
  minAmount?: number;
  maxAmount?: number;
  from?: string; // ISO date
  to?: string;   // ISO date
  sort?: 'asc' | 'desc';
  limit?: number;
  skip?: number;
}

export interface RevenueListResponse {
  count: number;
  results: Revenue[];
}

export interface RevenueSummaryResponse {
  range: { from: string | null; to: string | null };
  totals: { revenue: number };
  monthly: Array<{ year: number; month: number; revenue: number }>;
}

export class RevenueService {
  private readonly base = API_ENDPOINTS.financial.revenue;

  async create(data: Partial<Revenue>): Promise<Revenue> {
    return apiPost<Revenue>(this.base.create, data);
  }

  async list(params: RevenueListParams = {}): Promise<RevenueListResponse> {
    const qs = new URLSearchParams();
    if (params.sourceType) qs.append('sourceType', params.sourceType);
    if (params.paymentMethod) qs.append('paymentMethod', params.paymentMethod);
    if (params.minAmount !== undefined) qs.append('minAmount', String(params.minAmount));
    if (params.maxAmount !== undefined) qs.append('maxAmount', String(params.maxAmount));
    if (params.from) qs.append('from', params.from);
    if (params.to) qs.append('to', params.to);
    if (params.sort) qs.append('sort', params.sort);
    if (params.limit !== undefined) qs.append('limit', String(params.limit));
    if (params.skip !== undefined) qs.append('skip', String(params.skip));
    const endpoint = `${this.base.list}${qs.toString() ? `?${qs.toString()}` : ''}`;
    return apiGet<RevenueListResponse>(endpoint);
  }

  async getById(id: string): Promise<Revenue> {
    return apiGet<Revenue>(this.base.get(id));
  }

  async update(id: string, data: Partial<Revenue>): Promise<Revenue> {
    return apiPut<Revenue>(this.base.update(id), data);
  }

  async delete(id: string): Promise<void> {
    // use low-level to handle 204
    const endpoint = this.base.delete(id);
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}${endpoint}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...(typeof window !== 'undefined' && localStorage.getItem('authToken') ? { Authorization: `Bearer ${localStorage.getItem('authToken')}` } : {}) },
    });
  }

  async summary(params: Omit<RevenueListParams, 'minAmount' | 'maxAmount' | 'limit' | 'skip'> = {}): Promise<RevenueSummaryResponse> {
    const qs = new URLSearchParams();
    if (params.sourceType) qs.append('sourceType', params.sourceType);
    if (params.paymentMethod) qs.append('paymentMethod', params.paymentMethod);
    if (params.from) qs.append('from', params.from);
    if (params.to) qs.append('to', params.to);
    if (params.sort) qs.append('sort', params.sort);
    const endpoint = `${this.base.summary}${qs.toString() ? `?${qs.toString()}` : ''}`;
    return apiGet<RevenueSummaryResponse>(endpoint);
  }
}


