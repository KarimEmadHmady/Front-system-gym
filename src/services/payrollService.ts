import { apiGet, apiPost, apiPut, apiRequest } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/constants';

export interface Payroll {
  _id: string;
  employeeId: string;
  salaryAmount: number;
  paymentDate: string;
  bonuses?: number;
  deductions?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayrollListParams {
  employeeId?: string;
  minAmount?: number;
  maxAmount?: number;
  from?: string; // ISO date
  to?: string;   // ISO date
  sort?: 'asc' | 'desc';
  limit?: number;
  skip?: number;
}

export interface PayrollListResponse {
  count: number;
  results: Payroll[];
}

export interface PayrollSummaryResponse {
  range: { from: string | null; to: string | null };
  totals: { payroll: number };
  monthly: Array<{ year: number; month: number; payroll: number }>;
}

export class PayrollService {
  private readonly base = API_ENDPOINTS.financial.payroll;

  async create(data: Partial<Payroll>): Promise<Payroll> {
    return apiPost<Payroll>(this.base.create, data);
  }

  async list(params: PayrollListParams = {}): Promise<PayrollListResponse> {
    const qs = new URLSearchParams();
    if (params.employeeId) qs.append('employeeId', params.employeeId);
    if (params.minAmount !== undefined) qs.append('minAmount', String(params.minAmount));
    if (params.maxAmount !== undefined) qs.append('maxAmount', String(params.maxAmount));
    if (params.from) qs.append('from', params.from);
    if (params.to) qs.append('to', params.to);
    if (params.sort) qs.append('sort', params.sort);
    if (params.limit !== undefined) qs.append('limit', String(params.limit));
    if (params.skip !== undefined) qs.append('skip', String(params.skip));
    const endpoint = `${this.base.list}${qs.toString() ? `?${qs.toString()}` : ''}`;
    return apiGet<PayrollListResponse>(endpoint);
  }

  async getById(id: string): Promise<Payroll> {
    return apiGet<Payroll>(this.base.get(id));
  }

  async update(id: string, data: Partial<Payroll>): Promise<Payroll> {
    return apiPut<Payroll>(this.base.update(id), data);
  }

  async delete(id: string): Promise<void> {
    await apiRequest(this.base.delete(id), { method: 'DELETE' });
  }

  async summary(params: Omit<PayrollListParams, 'minAmount' | 'maxAmount' | 'limit' | 'skip'> = {}): Promise<PayrollSummaryResponse> {
    const qs = new URLSearchParams();
    if (params.employeeId) qs.append('employeeId', params.employeeId);
    if (params.from) qs.append('from', params.from);
    if (params.to) qs.append('to', params.to);
    if (params.sort) qs.append('sort', params.sort);
    const endpoint = `${this.base.summary}${qs.toString() ? `?${qs.toString()}` : ''}`;
    return apiGet<PayrollSummaryResponse>(endpoint);
  }
}


