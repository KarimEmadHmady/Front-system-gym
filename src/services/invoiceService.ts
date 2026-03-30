import { BaseService } from './baseService';
import { API_ENDPOINTS } from '@/lib/constants';
import type { PaginationParams, PaginatedResponse } from '@/types';

export type InvoiceItem = {
  description: string;
  quantity: number;
  price: number;
};

export type Invoice = {
  _id: string;
  invoiceNumber: string;
  userId: string;
  amount: number;
  issueDate: string | Date;
  dueDate?: string | Date;
  status: 'paid' | 'pending' | 'overdue';
  paidAmount?: number;
  items?: InvoiceItem[];
  notes?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type GetInvoicesFilters = {
  userId?: string;
  invoiceNumber?: string;
  status?: 'paid' | 'pending' | 'overdue';
  from?: string;   // 'YYYY-MM-DD' or ISO
  to?: string;     // 'YYYY-MM-DD' or ISO
  minAmount?: number;
  maxAmount?: number;
  sort?: 'asc' | 'desc';
  limit?: number;
  skip?: number;
};

export type InvoiceSummaryParams = {
  from?: string;
  to?: string;
  userId?: string;
  status?: 'paid' | 'pending' | 'overdue';
  sort?: 'asc' | 'desc';
};

export type InvoiceSummary = {
  range: { from: string | null; to: string | null };
  totals: { amount: number };
  monthly: Array<{ year: number; month: number; total: number; paid: number; pending: number; overdue: number }>;
};

export class InvoiceService extends BaseService {
  constructor() {
    super(API_ENDPOINTS.financial.invoices.list);
  }

  async createInvoice(data: Omit<Invoice, '_id' | 'createdAt' | 'updatedAt' | 'paidAmount'>): Promise<Invoice> {
    return this.create<Invoice>(data as any);
  }

  async getInvoices(filters?: GetInvoicesFilters): Promise<PaginatedResponse<Invoice> | { count: number; results: Invoice[] }> {
    const q = new URLSearchParams();
    if (filters?.userId) q.append('userId', filters.userId);
    if (filters?.invoiceNumber) q.append('invoiceNumber', filters.invoiceNumber);
    if (filters?.status) q.append('status', filters.status);
    if (filters?.from) q.append('from', filters.from);
    if (filters?.to) q.append('to', filters.to);
    if (typeof filters?.minAmount === 'number') q.append('minAmount', String(filters.minAmount));
    if (typeof filters?.maxAmount === 'number') q.append('maxAmount', String(filters.maxAmount));
    if (filters?.sort) q.append('sort', filters.sort);
    if (typeof filters?.limit === 'number') q.append('limit', String(filters.limit));
    if (typeof filters?.skip === 'number') q.append('skip', String(filters.skip));

    const suffix = q.toString() ? `?${q.toString()}` : '';
    return this.apiCall(`${suffix}`);
  }

  async getInvoiceById(id: string): Promise<Invoice> {
    return this.apiCall(`/${id}`);
  }

  async updateInvoice(id: string, data: Partial<Omit<Invoice, '_id' | 'createdAt' | 'updatedAt'>>): Promise<Invoice> {
    return this.apiCall(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteInvoice(id: string): Promise<void> {
    return this.apiCall(`/${id}`, {
      method: 'DELETE',
    });
  }

  async getInvoiceSummary(params?: InvoiceSummaryParams): Promise<InvoiceSummary> {
    const q = new URLSearchParams();
    if (params?.from) q.append('from', params.from);
    if (params?.to) q.append('to', params.to);
    if (params?.userId) q.append('userId', params.userId);
    if (params?.status) q.append('status', params.status);
    if (params?.sort) q.append('sort', params.sort);

    const suffix = q.toString() ? `?${q.toString()}` : '';
    return this.apiCall(`/summary${suffix}`);
  }
}

// Export singleton instance
export const invoiceService = new InvoiceService();
