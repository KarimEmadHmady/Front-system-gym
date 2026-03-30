import { apiDelete, apiGet, apiPost, apiPut, apiRequest } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/constants';
import type { Expense } from '@/types';

export interface ExpenseListParams {
  category?: string;
  minAmount?: number;
  maxAmount?: number;
  from?: string; // ISO date string
  to?: string;   // ISO date string
  sort?: 'asc' | 'desc';
  limit?: number;
  skip?: number;
}

export interface ExpenseListResponse {
  count: number;
  results: Expense[];
}

export interface ExpenseSummaryResponse {
  range: { from: string | null; to: string | null };
  totals: { expense: number };
  monthly: Array<{ year: number; month: number; expense: number }>;
}

export class ExpenseService {
  private readonly base = API_ENDPOINTS.financial.expenses;

  async create(data: Partial<Expense> | FormData): Promise<Expense> {
    if (typeof window !== 'undefined' && data instanceof FormData) {
      const res = await apiRequest(this.base.create, { method: 'POST', body: data });
      if (!res.ok) throw new Error((await res.json()).message || 'خطأ في إنشاء المصروف');
      return res.json();
    } else {
      return apiPost<Expense>(this.base.create, data);
    }
  }

  async list(params: ExpenseListParams = {}): Promise<ExpenseListResponse> {
    const qs = new URLSearchParams();
    if (params.category) qs.append('category', params.category);
    if (params.minAmount !== undefined) qs.append('minAmount', String(params.minAmount));
    if (params.maxAmount !== undefined) qs.append('maxAmount', String(params.maxAmount));
    if (params.from) qs.append('from', params.from);
    if (params.to) qs.append('to', params.to);
    if (params.sort) qs.append('sort', params.sort);
    if (params.limit !== undefined) qs.append('limit', String(params.limit));
    if (params.skip !== undefined) qs.append('skip', String(params.skip));

    const endpoint = `${this.base.list}${qs.toString() ? `?${qs.toString()}` : ''}`;
    return apiGet<ExpenseListResponse>(endpoint);
  }

  async getById(id: string): Promise<Expense> {
    return apiGet<Expense>(this.base.get(id));
  }

  async update(id: string, data: Partial<Expense> | FormData): Promise<Expense> {
    if (typeof window !== 'undefined' && data instanceof FormData) {
      const res = await apiRequest(this.base.update(id), { method: 'PUT', body: data });
      if (!res.ok) throw new Error((await res.json()).message || 'خطأ في التعديل');
      return res.json();
    } else {
      return apiPut<Expense>(this.base.update(id), data);
    }
  }

  async delete(id: string): Promise<void> {
    // Handle 204 No Content safely without parsing JSON
    await apiRequest(this.base.delete(id), { method: 'DELETE' });
  }

  async summary(params: Omit<ExpenseListParams, 'minAmount' | 'maxAmount' | 'limit' | 'skip'> = {}): Promise<ExpenseSummaryResponse> {
    const qs = new URLSearchParams();
    if (params.category) qs.append('category', params.category);
    if (params.from) qs.append('from', params.from);
    if (params.to) qs.append('to', params.to);
    if (params.sort) qs.append('sort', params.sort);

    const endpoint = `${this.base.summary}${qs.toString() ? `?${qs.toString()}` : ''}`;
    return apiGet<ExpenseSummaryResponse>(endpoint);
  }
}


