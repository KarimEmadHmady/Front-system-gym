import { useState, useMemo, useEffect } from 'react';
import { invoiceService, payrollService, revenueService, expenseService, userService } from '@/services';
import * as XLSX from 'xlsx';

export const useTransactions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // Users map for resolving names
  const [users, setUsers] = useState<any[]>([]);
  const userMap = useMemo(() => {
    const map: Record<string, any> = {};
    users.forEach((u) => { map[u._id] = u; });
    return map;
  }, [users]);

  // Pagination
  const pageCount = Math.max(1, Math.ceil(recentTransactions.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, recentTransactions.length);
  const paginatedTransactions = recentTransactions.slice(startIndex, endIndex);

  useEffect(() => { setCurrentPage(1); }, [recentTransactions.length]);

  const loadUsers = async () => {
    try {
      const res = await userService.getUsers({ page: 1, limit: 500 });
      const list = Array.isArray(res) ? res : (res as any)?.data || [];
      setUsers(list);
    } catch (e) {
      console.error('Failed to load users:', e);
    }
  };

  const buildTransactions = (invoices: any, payrolls: any, revenues: any, expenses: any, map: Record<string, any>) => {
    const transactions: any[] = [];

    const invoiceResults = Array.isArray(invoices) ? invoices : (invoices as any).results;
    if (invoiceResults) {
      invoiceResults.forEach((invoice: any) => {
        transactions.push({
          id: `invoice_${invoice._id}`,
          type: 'revenue',
          description: `فاتورة #${invoice.invoiceNumber || invoice._id}`,
          amount: invoice.totalAmount || 0,
          date: invoice.createdAt ? new Date(invoice.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          category: 'invoice',
          clientName: invoice.clientName || map[invoice.userId]?.name || '',
        });
      });
    }

    if (payrolls.results) {
      payrolls.results.forEach((payroll: any) => {
        transactions.push({
          id: `payroll_${payroll._id}`,
          type: 'expense',
          amount: -(payroll.salaryAmount || 0),
          date: payroll.paymentDate ? new Date(payroll.paymentDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          category: 'payroll',
          employeeId: payroll.employeeId,
          employeeName: map[payroll.employeeId]?.name || '',
        });
      });
    }

    if (revenues.results) {
      revenues.results.forEach((revenue: any) => {
        transactions.push({
          id: `revenue_${revenue._id}`,
          type: 'revenue',
          description: revenue.notes || 'إيراد',
          amount: revenue.amount || 0,
          date: revenue.date ? new Date(revenue.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          category: revenue.sourceType || 'other',
          clientName: revenue.clientName || '',
        });
      });
    }

    if (expenses.results) {
      expenses.results.forEach((expense: any) => {
        transactions.push({
          id: `expense_${expense._id}`,
          type: 'expense',
          description: expense.description || 'مصروف',
          amount: -(expense.amount || 0),
          date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          category: expense.category || 'other',
          vendorName: expense.vendorName || '',
        });
      });
    }

    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
  };

  const loadRecentTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const [invoices, payrolls, revenues, expenses] = await Promise.all([
        invoiceService.getInvoices({ limit: 5, sort: 'desc' }),
        payrollService.list({ limit: 5, sort: 'desc' }),
        revenueService.list({ limit: 5, sort: 'desc' }),
        expenseService.list({ limit: 5, sort: 'desc' }),
      ]);
      setRecentTransactions(buildTransactions(invoices, payrolls, revenues, expenses, userMap));
    } catch (e: any) {
      setError(e?.message || 'فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = async () => {
    try {
      setLoading(true);
      const [invoices, payrolls, revenues, expenses] = await Promise.all([
        invoiceService.getInvoices({ limit: 30, sort: 'desc' }),
        payrollService.list({ limit: 30, sort: 'desc' }),
        revenueService.list({ limit: 30, sort: 'desc' }),
        expenseService.list({ limit: 30, sort: 'desc' }),
      ]);

      const rows: any[] = [];

      const invoiceResults = Array.isArray(invoices) ? invoices : (invoices as any).results;
      if (invoiceResults) {
        invoiceResults.forEach((invoice: any) => {
          rows.push({
            'نوع المعاملة': 'إيراد',
            'التفاصيل': `فاتورة #${invoice.invoiceNumber || invoice._id}`,
            'المبلغ (ج.م)': invoice.totalAmount || 0,
            'التاريخ': invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString('ar-EG') : '',
            'الفئة': 'فاتورة',
            'الحالة': invoice.status || 'مكتملة',
            'العميل': invoice.clientName || 'غير محدد',
          });
        });
      }

      if (payrolls.results) {
        payrolls.results.forEach((payroll: any) => {
          rows.push({
            'نوع المعاملة': 'مصروف',
            'التفاصيل': `راتب - ${userMap[payroll.employeeId]?.name || 'موظف'}`,
            'المبلغ (ج.م)': -(payroll.salaryAmount || 0),
            'التاريخ': payroll.paymentDate ? new Date(payroll.paymentDate).toLocaleDateString('ar-EG') : '',
            'الفئة': 'راتب',
            'الحالة': payroll.status || 'مكتملة',
            'العميل': '',
          });
        });
      }

      if (revenues.results) {
        revenues.results.forEach((revenue: any) => {
          rows.push({
            'نوع المعاملة': 'إيراد',
            'التفاصيل': revenue.notes || 'إيراد',
            'المبلغ (ج.م)': revenue.amount || 0,
            'التاريخ': revenue.date ? new Date(revenue.date).toLocaleDateString('ar-EG') : '',
            'الفئة': revenue.sourceType || 'أخرى',
            'الحالة': revenue.status || 'مكتملة',
            'العميل': revenue.clientName || '',
          });
        });
      }

      if (expenses.results) {
        expenses.results.forEach((expense: any) => {
          rows.push({
            'نوع المعاملة': 'مصروف',
            'التفاصيل': expense.description || 'مصروف',
            'المبلغ (ج.م)': -(expense.amount || 0),
            'التاريخ': expense.date ? new Date(expense.date).toLocaleDateString('ar-EG') : '',
            'الفئة': expense.category || 'أخرى',
            'الحالة': expense.status || 'مكتملة',
            'العميل': expense.vendorName || '',
          });
        });
      }

      rows.sort((a, b) => new Date(b['التاريخ']).getTime() - new Date(a['التاريخ']).getTime());

      const ws = XLSX.utils.json_to_sheet(rows);
      ws['!cols'] = Object.keys(rows[0] || {}).map(() => ({ wch: 20 }));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'المعاملات المالية');
      XLSX.writeFile(wb, `المعاملات_المالية_${new Date().toLocaleDateString('ar-EG').replace(/\//g, '-')}.xlsx`);
      return { success: true };
    } catch (e) {
      console.error('خطأ في التصدير:', e);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // Load users on mount, then transactions when users are ready
  useEffect(() => { loadUsers(); }, []);
  useEffect(() => {
    if (users.length > 0) loadRecentTransactions();
  }, [users]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    loading, error, userMap,
    paginatedTransactions, recentTransactions,
    currentPage, setCurrentPage,
    pageCount, startIndex, endIndex,
    loadRecentTransactions, exportToExcel,
  };
};