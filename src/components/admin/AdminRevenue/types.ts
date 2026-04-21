import type { Revenue } from '@/services/revenueService';

export type SortOrder = 'asc' | 'desc';

export type RevenueForm = {
  amount?: number;
  date?: string;
  paymentMethod?: 'cash' | 'card' | 'transfer' | 'bank_transfer' | 'other';
  sourceType?: 'subscription' | 'purchase' | 'invoice' | 'other';
  userId?: string;
  notes?: string;
};

export type SummaryData = {
  range: { from: string | null; to: string | null };
  totals: { revenue: number };
  monthly: Array<{ year: number; month: number; revenue: number }>;
};