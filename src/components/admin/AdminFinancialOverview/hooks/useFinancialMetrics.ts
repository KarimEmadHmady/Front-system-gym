import { useState, useEffect } from 'react';
import { RevenueService } from '@/services/revenueService';
import { ExpenseService } from '@/services/expenseService';

interface Metrics {
  revenue: { monthly: number; growth: number };
  expenses: { monthly: number; growth: number };
  profit: { monthly: number; growth: number };
}

const defaultMetrics: Metrics = {
  revenue: { monthly: 0, growth: 0 },
  expenses: { monthly: 0, growth: 0 },
  profit: { monthly: 0, growth: 0 },
};

export const useFinancialMetrics = () => {
  const [metrics, setMetrics] = useState<Metrics>(defaultMetrics);

  useEffect(() => {
    const revenueService = new RevenueService();
    const expenseService = new ExpenseService();

    const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
    const toISODate = (d: Date) => d.toISOString().split('T')[0];

    const now = new Date();
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const from = toISODate(startOfMonth(prev));
    const to = toISODate(endOfMonth(now));

    Promise.all([
      revenueService.summary({ from, to, sort: 'asc' }),
      expenseService.summary({ from, to, sort: 'asc' }),
    ])
      .then(([revSummary, expSummary]) => {
        const getMonthlyArray = (summary: any): any[] => {
          if (!summary || typeof summary !== 'object') return [];
          if (Array.isArray(summary.monthly)) return summary.monthly;
          if (Array.isArray(summary.data?.monthly)) return summary.data.monthly;
          if (Array.isArray(summary.results?.monthly)) return summary.results.monthly;
          if (Array.isArray(summary.stats?.monthly)) return summary.stats.monthly;
          return [];
        };

        const normalizeYearMonth = (i: any) => {
          const yRaw = i?.year ?? i?._id?.year;
          const mRaw = i?.month ?? i?._id?.month;
          const yNum = Number(yRaw);
          let mNum = Number(mRaw);
          if (Number.isNaN(yNum) || Number.isNaN(mNum)) {
            const id = i?._id;
            if (typeof id === 'string') {
              const m = id.match(/(\d{4})\D+(\d{1,2})/);
              if (m) return { y: Number(m[1]), m: Number(m[2]) };
            }
          }
          return { y: yNum, m: mNum };
        };

        const findMonth = (arr: any[], y: number, m: number, key: 'revenue' | 'expense') => {
          const monthMatches = (monthValue: number, targetMonth: number) => {
            if (Number.isNaN(monthValue)) return false;
            if (monthValue === targetMonth) return true;
            return monthValue >= 0 && monthValue <= 11 && monthValue + 1 === targetMonth;
          };
          const item = (arr || []).find((i) => {
            const nm = normalizeYearMonth(i);
            return nm.y === y && monthMatches(nm.m, m);
          });
          if (!item) return 0;
          const direct = item[key];
          if (typeof direct === 'number') return direct;
          const maybeKeyTotal =
            key === 'revenue'
              ? (item.totalRevenue ?? item.revenueTotal ?? item.total_revenue)
              : (item.totalExpense ?? item.expenseTotal ?? item.total_expense);
          if (typeof maybeKeyTotal === 'number') return maybeKeyTotal;
          const maybeTotal = item.total ?? item.amount ?? item.value ?? item.sum;
          return typeof maybeTotal === 'number' ? maybeTotal : 0;
        };

        const yCur = now.getFullYear();
        const mCur = now.getMonth() + 1;
        const yPrev = prev.getFullYear();
        const mPrev = prev.getMonth() + 1;

        const revMonthly = getMonthlyArray(revSummary);
        const expMonthly = getMonthlyArray(expSummary);

        const revenueCurrent = findMonth(revMonthly, yCur, mCur, 'revenue');
        const revenuePrev = findMonth(revMonthly, yPrev, mPrev, 'revenue');
        const expenseCurrent = findMonth(expMonthly, yCur, mCur, 'expense');
        const expensePrev = findMonth(expMonthly, yPrev, mPrev, 'expense');
        const profitCurrent = revenueCurrent - expenseCurrent;
        const profitPrev = revenuePrev - expensePrev;

        const growth = (curr: number, prevVal: number) =>
          prevVal > 0 ? ((curr - prevVal) / prevVal) * 100 : 0;

        setMetrics({
          revenue: { monthly: revenueCurrent, growth: growth(revenueCurrent, revenuePrev) },
          expenses: { monthly: expenseCurrent, growth: growth(expenseCurrent, expensePrev) },
          profit: { monthly: profitCurrent, growth: growth(profitCurrent, profitPrev) },
        });
      })
      .catch((e) => console.error('Failed to load financial metrics summaries', e));
  }, []);

  return { metrics };
};