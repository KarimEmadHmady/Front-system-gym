'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { RevenueService } from '@/services/revenueService';
import { ExpenseService } from '@/services/expenseService';
import { invoiceService } from '@/services';
import { payrollService } from '@/services';
import { revenueService } from '@/services';
import { expenseService } from '@/services';
import { userService } from '@/services';
import * as XLSX from 'xlsx';
import CustomAlert from '@/components/ui/CustomAlert';
import { useCustomAlert } from '@/hooks/useCustomAlert';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import VideoTutorial from '../VideoTutorial';
dayjs.extend(relativeTime);

const AdminFinancialOverview = () => {
  const [activeTab, setActiveTab] = useState('transactions');
  const t = useTranslations();
  const { alertState, showSuccess, showError, showWarning, hideAlert } = useCustomAlert();
  
  // State للبيانات الحقيقية
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [transactionsCurrentPage, setTransactionsCurrentPage] = useState(1);
  const [transactionsPageSize] = useState(10);
  
  // State للتقارير المالية
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [invoicesReportPage, setInvoicesReportPage] = useState(1);
  const [invoicesReportPageSize, setInvoicesReportPageSize] = useState(10);
  const [invoicesReportTotalPages, setInvoicesReportTotalPages] = useState(1);
  const [reportsData, setReportsData] = useState<{
    invoices: any;
    payrolls: any;
    revenues: any;
    expenses: any;
    summary: any;
  } | null>(null);
  

  // State لبيانات المستخدمين
  const [users, setUsers] = useState<any[]>([]);
  const userMap = useMemo(() => {
    const map: Record<string, any> = {};
    users.forEach(u => { map[u._id] = u; });
    return map;
  }, [users]);


  const [metrics, setMetrics] = useState({
    revenue: { monthly: 0, growth: 0 },
    expenses: { monthly: 0, growth: 0 },
    profit: { monthly: 0, growth: 0 },
  });

  // Pagination calculations for transactions
  const transactionsPageCount = Math.max(1, Math.ceil(recentTransactions.length / transactionsPageSize));
  const transactionsStartIndex = (transactionsCurrentPage - 1) * transactionsPageSize;
  const transactionsEndIndex = Math.min(transactionsStartIndex + transactionsPageSize, recentTransactions.length);
  const paginatedTransactions = recentTransactions.slice(transactionsStartIndex, transactionsEndIndex);

  // Reset to first page when transactions are loaded
  React.useEffect(() => {
    setTransactionsCurrentPage(1);
  }, [recentTransactions.length]);

  React.useEffect(() => {
    const revenueService = new RevenueService();
    const expenseService = new ExpenseService();

    const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
    const toISODate = (d: Date) => d.toISOString().split('T')[0];

    const now = new Date();
    const currentStart = startOfMonth(now);
    const currentEnd = endOfMonth(now);
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevStart = startOfMonth(prev);
    const prevEnd = endOfMonth(prev);

    const from = toISODate(prevStart);
    const to = toISODate(currentEnd);

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
          // Support shapes:
          // { year, month }
          // { _id: { year, month }, ... }
          // { _id: "2026-03", ... } or "2026-3"
          const yRaw = i?.year ?? i?._id?.year;
          const mRaw = i?.month ?? i?._id?.month;
          const yNum = Number(yRaw);
          let mNum = Number(mRaw);

          if (Number.isNaN(yNum) || Number.isNaN(mNum)) {
            const id = i?._id;
            if (typeof id === 'string') {
              const m = id.match(/(\d{4})\D+(\d{1,2})/);
              if (m) {
                const yy = Number(m[1]);
                const mm = Number(m[2]);
                return { y: yy, m: mm };
              }
            }
          }

          return { y: yNum, m: mNum };
        };

        const findMonth = (arr: any[], y: number, m: number, key: 'revenue' | 'expense') => {
          const monthMatches = (monthValue: number, targetMonth: number) => {
            // Support both month conventions from backends:
            // - 1..12 (target should match directly)
            // - 0..11 (target should match month + 1) 
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
          // Fallbacks for backend shape differences
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

        const growth = (curr: number, prevVal: number) => (prevVal > 0 ? ((curr - prevVal) / prevVal) * 100 : 0);

        setMetrics({
          revenue: { monthly: revenueCurrent, growth: growth(revenueCurrent, revenuePrev) },
          expenses: { monthly: expenseCurrent, growth: growth(expenseCurrent, expensePrev) },
          profit: { monthly: profitCurrent, growth: growth(profitCurrent, profitPrev) },
        });

        // Helpful debug in case backend shape differs
        if (revenueCurrent === 0 && expenseCurrent === 0) {
          console.log('[FinancialOverview] summaries sample', {
            revMonthly0: revMonthly?.[0],
            expMonthly0: expMonthly?.[0],
            revMonthlyLen: revMonthly?.length,
            expMonthlyLen: expMonthly?.length,
            revTotals: (revSummary as any)?.totals,
            expTotals: (expSummary as any)?.totals,
          });
        }
      })
      .catch((e) => {
        console.error('Failed to load financial metrics summaries', e);
      });
  }, []);

  // دالة لجلب البيانات الحقيقية
  const loadRecentTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const [invoices, payrolls, revenues, expenses] = await Promise.all([
        invoiceService.getInvoices({ limit: 5, sort: 'desc' }),
        payrollService.list({ limit: 5, sort: 'desc' }),
        revenueService.list({ limit: 5, sort: 'desc' }),
        expenseService.list({ limit: 5, sort: 'desc' })
      ]);

      const transactions: any[] = [];

      // إضافة الفواتير
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
            source: 'invoice',
            clientName: invoice.clientName || (userMap[invoice.userId]?.name) || '',
          });
        });
      }

      // إضافة الرواتب
      if (payrolls.results) {
        payrolls.results.forEach((payroll: any) => {
          transactions.push({
            id: `payroll_${payroll._id}`,
            type: 'expense',
            description: '', // سنبنيه عند العرض
            amount: -(payroll.salaryAmount || 0),
            date: payroll.paymentDate ? new Date(payroll.paymentDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            category: 'payroll',
            source: 'payroll',
            employeeId: payroll.employeeId,
            employeeName: userMap[payroll.employeeId]?.name || '',
          });
        });
      }

      // إضافة الإيرادات
      if (revenues.results) {
        revenues.results.forEach((revenue: any) => {
          transactions.push({
            id: `revenue_${revenue._id}`,
            type: 'revenue',
            description: revenue.notes || 'إيراد',
            amount: revenue.amount || 0,
            date: revenue.date ? new Date(revenue.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            category: revenue.sourceType || 'other',
            source: 'revenue',
            clientName: revenue.clientName || '',
          });
        });
      }

      // إضافة المصروفات
      if (expenses.results) {
        expenses.results.forEach((expense: any) => {
          transactions.push({
            id: `expense_${expense._id}`,
            type: 'expense',
            description: expense.description || 'مصروف',
            amount: -(expense.amount || 0),
            date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            category: expense.category || 'other',
            source: 'expense',
            vendorName: expense.vendorName || '',
          });
        });
      }

      // ترتيب حسب التاريخ (الأحدث أولاً)
      transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      // أخذ آخر 10 معاملات
      setRecentTransactions(transactions.slice(0, 10));
    } catch (e: any) {
      setError(e?.message || 'فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  // دالة تصدير المعاملات المالية إلى Excel
  const exportTransactionsToExcel = async () => {
    try {
      setLoading(true);
      
      // جلب آخر 30 معاملة مالية
      const [invoices, payrolls, revenues, expenses] = await Promise.all([
        invoiceService.getInvoices({ limit: 30, sort: 'desc' }),
        payrollService.list({ limit: 30, sort: 'desc' }),
        revenueService.list({ limit: 30, sort: 'desc' }),
        expenseService.list({ limit: 30, sort: 'desc' })
      ]);

      const transactions: any[] = [];

      // إضافة الفواتير
      const invoiceResults = Array.isArray(invoices) ? invoices : (invoices as any).results;
      if (invoiceResults) {
        invoiceResults.forEach((invoice: any) => {
          transactions.push({
            'نوع المعاملة': 'إيراد',
            'التفاصيل': `فاتورة #${invoice.invoiceNumber || invoice._id}`,
            'المبلغ (ج.م)': invoice.totalAmount || 0,
            'التاريخ': invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString('ar-EG') : '',
            'الفئة': 'فاتورة',
            'المصدر': 'نظام الفواتير',
            'الحالة': invoice.status || 'مكتملة',
            'العميل': invoice.clientName || 'غير محدد',
            'تاريخ الاستحقاق': invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('ar-EG') : '',
            'تاريخ الدفع': invoice.paymentDate ? new Date(invoice.paymentDate).toLocaleDateString('ar-EG') : '',
          });
        });
      }

      // إضافة الرواتب
      if (payrolls.results) {
        payrolls.results.forEach((payroll: any) => {
          transactions.push({
            'نوع المعاملة': 'مصروف',
            'التفاصيل': `راتب - ${payroll.employeeId || 'موظف'}`,
            'المبلغ (ج.م)': -(payroll.salaryAmount || 0),
            'التاريخ': payroll.paymentDate ? new Date(payroll.paymentDate).toLocaleDateString('ar-EG') : '',
            'الفئة': 'راتب',
            'المصدر': 'نظام الرواتب',
            'الحالة': payroll.status || 'مكتملة',
            'الموظف': payroll.employeeName || 'غير محدد',
            'تاريخ الاستحقاق': '',
            'تاريخ الدفع': payroll.paymentDate ? new Date(payroll.paymentDate).toLocaleDateString('ar-EG') : '',
          });
        });
      }

      // إضافة الإيرادات
      if (revenues.results) {
        revenues.results.forEach((revenue: any) => {
          transactions.push({
            'نوع المعاملة': 'إيراد',
            'التفاصيل': revenue.notes || 'إيراد',
            'المبلغ (ج.م)': revenue.amount || 0,
            'التاريخ': revenue.date ? new Date(revenue.date).toLocaleDateString('ar-EG') : '',
            'الفئة': revenue.sourceType || 'أخرى',
            'المصدر': 'نظام الإيرادات',
            'الحالة': revenue.status || 'مكتملة',
            'العميل': revenue.clientName || 'غير محدد',
            'تاريخ الاستحقاق': '',
            'تاريخ الدفع': revenue.paymentDate ? new Date(revenue.paymentDate).toLocaleDateString('ar-EG') : '',
          });
        });
      }

      // إضافة المصروفات
      if (expenses.results) {
        expenses.results.forEach((expense: any) => {
          transactions.push({
            'نوع المعاملة': 'مصروف',
            'التفاصيل': expense.description || 'مصروف',
            'المبلغ (ج.م)': -(expense.amount || 0),
            'التاريخ': expense.date ? new Date(expense.date).toLocaleDateString('ar-EG') : '',
            'الفئة': expense.category || 'أخرى',
            'المصدر': 'نظام المصروفات',
            'الحالة': expense.status || 'مكتملة',
            'المورد': expense.vendorName || 'غير محدد',
            'تاريخ الاستحقاق': '',
            'تاريخ الدفع': expense.paymentDate ? new Date(expense.paymentDate).toLocaleDateString('ar-EG') : '',
          });
        });
      }

      // ترتيب حسب التاريخ (الأحدث أولاً)
      transactions.sort((a, b) => new Date(b['التاريخ']).getTime() - new Date(a['التاريخ']).getTime());

      // إنشاء ورقة عمل
      const worksheet = XLSX.utils.json_to_sheet(transactions);
      
      // إنشاء كتاب عمل
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'المعاملات المالية');

      // تحديد عرض الأعمدة
      const columnWidths = [
        { wch: 12 }, // نوع المعاملة
        { wch: 25 }, // التفاصيل
        { wch: 15 }, // المبلغ
        { wch: 15 }, // التاريخ
        { wch: 15 }, // الفئة
        { wch: 20 }, // المصدر
        { wch: 12 }, // الحالة
        { wch: 20 }, // العميل/الموظف/المورد
        { wch: 15 }, // تاريخ الاستحقاق
        { wch: 15 }, // تاريخ الدفع
      ];
      worksheet['!cols'] = columnWidths;

      // تصدير الملف
      const fileName = `المعاملات_المالية_${new Date().toLocaleDateString('ar-EG').replace(/\//g, '-')}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      showSuccess('تم التصدير بنجاح', `تم تصدير ${transactions.length} معاملة مالية بنجاح`);
    } catch (error) {
      console.error('خطأ في تصدير المعاملات المالية:', error);
      showError('خطأ في التصدير', 'حدث خطأ أثناء تصدير المعاملات المالية');
    } finally {
      setLoading(false);
    }
  };

  // دالة تصدير التقارير المالية حسب التاب النشط
  const exportReportsToExcel = async () => {
    if (!selectedReport || !reportsData) {
      showError('خطأ في التصدير', 'يرجى تحديد تقرير أولاً');
      return;
    }

    try {
      setReportsLoading(true);
      let exportData: any[] = [];
      let fileName = '';
      let sheetName = '';

      switch (selectedReport) {
        case 'invoices':
          exportData = reportsData.invoices.data.map((invoice: any) => ({
            'رقم الفاتورة': invoice.invoiceNumber || invoice._id,
            'العميل': userMap[invoice.userId]?.name || invoice.userId || 'غير محدد',
            'المبلغ (ج.م)': invoice.totalAmount || invoice.amount || 0,
            'تاريخ الإنشاء': invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString('ar-EG') : '',
            'تاريخ الاستحقاق': invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('ar-EG') : '',
            'تاريخ الدفع': invoice.paymentDate ? new Date(invoice.paymentDate).toLocaleDateString('ar-EG') : '',
            'الحالة': invoice.status === 'paid' ? 'مدفوعة' : invoice.status === 'pending' ? 'معلقة' : 'متأخرة',
            'الوصف': invoice.description || '',
            'طريقة الدفع': invoice.paymentMethod || '',
            'الملاحظات': invoice.notes || '',
          }));
          fileName = `تقرير_الفواتير_${new Date().toLocaleDateString('ar-EG').replace(/\//g, '-')}.xlsx`;
          sheetName = 'الفواتير';
          break;

        case 'payrolls':
          exportData = reportsData.payrolls.data.map((payroll: any) => ({
            'الموظف': userMap[payroll.employeeId]?.name || payroll.employeeId || 'غير محدد',
            'الراتب الأساسي (ج.م)': payroll.salaryAmount || 0,
            'المكافآت (ج.م)': payroll.bonuses || 0,
            'الخصومات (ج.م)': payroll.deductions || 0,
            'صافي الراتب (ج.م)': (payroll.salaryAmount || 0) + (payroll.bonuses || 0) - (payroll.deductions || 0),
            'تاريخ الدفع': payroll.paymentDate ? new Date(payroll.paymentDate).toLocaleDateString('ar-EG') : '',
            'الشهر': payroll.month || '',
            'السنة': payroll.year || '',
            'الحالة': payroll.status || 'مكتملة',
            'الملاحظات': payroll.notes || '',
          }));
          fileName = `تقرير_الرواتب_${new Date().toLocaleDateString('ar-EG').replace(/\//g, '-')}.xlsx`;
          sheetName = 'الرواتب';
          break;

        case 'revenues':
          exportData = reportsData.revenues.data.map((revenue: any) => ({
            'الوصف': revenue.notes || 'إيراد',
            'المبلغ (ج.م)': revenue.amount || 0,
            'التاريخ': revenue.date ? new Date(revenue.date).toLocaleDateString('ar-EG') : '',
            'نوع المصدر': revenue.sourceType || 'أخرى',
            'طريقة الدفع': revenue.paymentMethod || '',
            'العميل': revenue.clientName || 'غير محدد',
            'الحالة': revenue.status || 'مكتملة',
            'الملاحظات': revenue.description || '',
            'تاريخ الإنشاء': revenue.createdAt ? new Date(revenue.createdAt).toLocaleDateString('ar-EG') : '',
          }));
          fileName = `تقرير_الإيرادات_${new Date().toLocaleDateString('ar-EG').replace(/\//g, '-')}.xlsx`;
          sheetName = 'الإيرادات';
          break;

        case 'expenses':
          exportData = reportsData.expenses.data.map((expense: any) => ({
            'الوصف': expense.description || 'مصروف',
            'المبلغ (ج.م)': expense.amount || 0,
            'التاريخ': expense.date ? new Date(expense.date).toLocaleDateString('ar-EG') : '',
            'الفئة': expense.category || 'أخرى',
            'المورد': expense.vendorName || 'غير محدد',
            'طريقة الدفع': expense.paymentMethod || '',
            'الحالة': expense.status || 'مكتملة',
            'الملاحظات': expense.notes || '',
            'تاريخ الإنشاء': expense.createdAt ? new Date(expense.createdAt).toLocaleDateString('ar-EG') : '',
          }));
          fileName = `تقرير_المصروفات_${new Date().toLocaleDateString('ar-EG').replace(/\//g, '-')}.xlsx`;
          sheetName = 'المصروفات';
          break;

        case 'summary':
          // إنشاء تقرير شامل يحتوي على ملخص لجميع البيانات
          const summaryData = [
            {
              'المؤشر': 'إجمالي الإيرادات',
              'القيمة (ج.م)': reportsData.summary.totalRevenue,
              'النسبة': '100%',
              'التفاصيل': 'مجموع جميع الإيرادات'
            },
            {
              'المؤشر': 'إجمالي المصروفات',
              'القيمة (ج.م)': reportsData.summary.totalExpenses,
              'النسبة': reportsData.summary.totalRevenue > 0 
                ? `${((reportsData.summary.totalExpenses / reportsData.summary.totalRevenue) * 100).toFixed(1)}%`
                : '0%',
              'التفاصيل': 'مجموع جميع المصروفات'
            },
            {
              'المؤشر': 'صافي الربح',
              'القيمة (ج.م)': reportsData.summary.netProfit,
              'النسبة': reportsData.summary.profitMargin.toFixed(1) + '%',
              'التفاصيل': reportsData.summary.netProfit >= 0 ? 'ربح إيجابي' : 'خسارة'
            },
            {
              'المؤشر': 'إجمالي الفواتير',
              'القيمة (ج.م)': reportsData.summary.totalInvoices,
              'النسبة': '100%',
              'التفاصيل': 'مجموع جميع الفواتير'
            },
            {
              'المؤشر': 'الفواتير المدفوعة',
              'القيمة (ج.م)': reportsData.summary.paidInvoices,
              'النسبة': reportsData.summary.totalInvoices > 0 
                ? `${((reportsData.summary.paidInvoices / reportsData.summary.totalInvoices) * 100).toFixed(1)}%`
                : '0%',
              'التفاصيل': 'الفواتير التي تم دفعها'
            },
            {
              'المؤشر': 'الفواتير المعلقة',
              'القيمة (ج.م)': reportsData.summary.pendingInvoices,
              'النسبة': reportsData.summary.totalInvoices > 0 
                ? `${((reportsData.summary.pendingInvoices / reportsData.summary.totalInvoices) * 100).toFixed(1)}%`
                : '0%',
              'التفاصيل': 'الفواتير في انتظار الدفع'
            },
            {
              'المؤشر': 'الفواتير المتأخرة',
              'القيمة (ج.م)': reportsData.summary.overdueInvoices,
              'النسبة': reportsData.summary.totalInvoices > 0 
                ? `${((reportsData.summary.overdueInvoices / reportsData.summary.totalInvoices) * 100).toFixed(1)}%`
                : '0%',
              'التفاصيل': 'الفواتير المتأخرة عن موعد الاستحقاق'
            }
          ];
          exportData = summaryData;
          fileName = `التقرير_المالي_الشامل_${new Date().toLocaleDateString('ar-EG').replace(/\//g, '-')}.xlsx`;
          sheetName = 'التقرير الشامل';
          break;

        default:
          showError('خطأ في التصدير', 'نوع التقرير غير صحيح');
          return;
      }

      // إنشاء ورقة عمل
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      // إنشاء كتاب عمل
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      // تحديد عرض الأعمدة
      const columnWidths = exportData.length > 0 ? 
        Object.keys(exportData[0]).map(() => ({ wch: 20 })) : 
        [{ wch: 20 }];
      worksheet['!cols'] = columnWidths;

      // تصدير الملف
      XLSX.writeFile(workbook, fileName);

      showSuccess('تم التصدير بنجاح', `تم تصدير تقرير ${sheetName} بنجاح (${exportData.length} سجل)`);
    } catch (error) {
      console.error('خطأ في تصدير التقارير:', error);
      showError('خطأ في التصدير', 'حدث خطأ أثناء تصدير التقارير المالية');
    } finally {
      setReportsLoading(false);
    }
  };

  const normalizeInvoicesListResponse = (raw: any): { count: number; results: any[] } => {
    if (!raw) return { count: 0, results: [] };
    if (Array.isArray(raw)) return { count: raw.length, results: raw };
    if (Array.isArray(raw.results)) return { count: Number(raw.count ?? raw.results.length ?? 0), results: raw.results };
    if (Array.isArray(raw.data) && raw.pagination) {
      const count = Number(raw.pagination.total ?? raw.data.length ?? 0);
      return { count, results: raw.data };
    }
    if (Array.isArray(raw.data)) return { count: raw.data.length, results: raw.data };
    return { count: 0, results: [] };
  };

  const fetchInvoicesReportPage = async (page: number, pageSize: number) => {
    const safePage = Math.max(1, page);
    const safeSize = Math.max(1, pageSize);
    const skip = (safePage - 1) * safeSize;
    const raw = await invoiceService.getInvoices({ limit: safeSize, skip, sort: 'desc' });
    const { count, results } = normalizeInvoicesListResponse(raw);
    const totalPages = Math.max(1, Math.ceil(count / safeSize));
    return { count, results, totalPages, page: safePage, pageSize: safeSize };
  };

  // دالة لجلب بيانات التقارير المالية
  const loadReportsData = async () => {
    setReportsLoading(true);
    setReportsError(null);
    try {
      const [
        invoicesPage,
        invoicesAllCount,
        invoicesPaidCount,
        invoicesPendingCount,
        invoicesOverdueCount,
        invoicesAllAmount,
        invoicesPaidAmount,
        invoicesPendingAmount,
        invoicesOverdueAmount,
        payrolls,
        revenues,
        expenses,
      ] = await Promise.all([
        fetchInvoicesReportPage(invoicesReportPage, invoicesReportPageSize),
        invoiceService.getInvoices({ limit: 1, skip: 0, sort: 'desc' }),
        invoiceService.getInvoices({ limit: 1, skip: 0, sort: 'desc', status: 'paid' }),
        invoiceService.getInvoices({ limit: 1, skip: 0, sort: 'desc', status: 'pending' }),
        invoiceService.getInvoices({ limit: 1, skip: 0, sort: 'desc', status: 'overdue' }),
        invoiceService.getInvoiceSummary({ sort: 'desc' }),
        invoiceService.getInvoiceSummary({ sort: 'desc', status: 'paid' }),
        invoiceService.getInvoiceSummary({ sort: 'desc', status: 'pending' }),
        invoiceService.getInvoiceSummary({ sort: 'desc', status: 'overdue' }),
        payrollService.list({ limit: 100, sort: 'desc' }),
        revenueService.list({ limit: 100, sort: 'desc' }),
        expenseService.list({ limit: 100, sort: 'desc' })
      ]);

      // حساب الإحصائيات
      const payrollResults = payrolls.results || [];
      const revenueResults = revenues.results || [];
      const expenseResults = expenses.results || [];

      // إحصائيات الفواتير
      const allCount = normalizeInvoicesListResponse(invoicesAllCount).count;
      const paidCount = normalizeInvoicesListResponse(invoicesPaidCount).count;
      const pendingCount = normalizeInvoicesListResponse(invoicesPendingCount).count;
      const overdueCount = normalizeInvoicesListResponse(invoicesOverdueCount).count;

      const invoiceStats = {
        total: allCount,
        paid: paidCount,
        pending: pendingCount,
        overdue: overdueCount,
        totalAmount: Number((invoicesAllAmount as any)?.totals?.amount ?? 0),
        paidAmount: Number((invoicesPaidAmount as any)?.totals?.amount ?? 0),
        pendingAmount: Number((invoicesPendingAmount as any)?.totals?.amount ?? 0),
        overdueAmount: Number((invoicesOverdueAmount as any)?.totals?.amount ?? 0),
        data: invoicesPage.results || [],
        pagination: {
          page: invoicesPage.page,
          limit: invoicesPage.pageSize,
          total: invoicesPage.count,
          totalPages: invoicesPage.totalPages,
        },
      };

      setInvoicesReportTotalPages(invoicesPage.totalPages);

      // إحصائيات الرواتب
      const payrollStats = {
        total: payrollResults.length,
        totalAmount: payrollResults.reduce((sum: number, payroll: any) => sum + (payroll.salaryAmount || 0), 0),
        totalBonuses: payrollResults.reduce((sum: number, payroll: any) => sum + (payroll.bonuses || 0), 0),
        totalDeductions: payrollResults.reduce((sum: number, payroll: any) => sum + (payroll.deductions || 0), 0),
        netAmount: payrollResults.reduce((sum: number, payroll: any) => 
          sum + (payroll.salaryAmount || 0) + (payroll.bonuses || 0) - (payroll.deductions || 0), 0),
        data: payrollResults
      };

      // إحصائيات الإيرادات
      const revenueStats = {
        total: revenueResults.length,
        totalAmount: revenueResults.reduce((sum: number, rev: any) => sum + (rev.amount || 0), 0),
        bySource: revenueResults.reduce((acc: any, rev: any) => {
          const source = rev.sourceType || 'other';
          acc[source] = (acc[source] || 0) + (rev.amount || 0);
          return acc;
        }, {}),
        byPaymentMethod: revenueResults.reduce((acc: any, rev: any) => {
          const method = rev.paymentMethod || 'cash';
          acc[method] = (acc[method] || 0) + (rev.amount || 0);
          return acc;
        }, {}),
        data: revenueResults
      };

      // إحصائيات المصروفات
      const expenseStats = {
        total: expenseResults.length,
        totalAmount: expenseResults.reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0),
        byCategory: expenseResults.reduce((acc: any, exp: any) => {
          const category = exp.category || 'other';
          acc[category] = (acc[category] || 0) + (exp.amount || 0);
          return acc;
        }, {}),
        data: expenseResults
      };

      // التقرير الشامل
      const summaryStats = {
        totalRevenue: revenueStats.totalAmount,
        totalExpenses: expenseStats.totalAmount + payrollStats.netAmount,
        netProfit: revenueStats.totalAmount - (expenseStats.totalAmount + payrollStats.netAmount),
        totalInvoices: invoiceStats.totalAmount,
        paidInvoices: invoiceStats.paidAmount,
        pendingInvoices: invoiceStats.pendingAmount,
        overdueInvoices: invoiceStats.overdueAmount,
        profitMargin: revenueStats.totalAmount > 0 ? 
          ((revenueStats.totalAmount - (expenseStats.totalAmount + payrollStats.netAmount)) / revenueStats.totalAmount) * 100 : 0
      };

      setReportsData({
        invoices: invoiceStats,
        payrolls: payrollStats,
        revenues: revenueStats,
        expenses: expenseStats,
        summary: summaryStats
      });
    } catch (e: any) {
      setReportsError(e?.message || 'فشل في تحميل بيانات التقارير');
    } finally {
      setReportsLoading(false);
    }
  };

  // دالة لجلب بيانات المستخدمين
  const loadUsers = async () => {
    try {
      const res = await userService.getUsers({ page: 1, limit: 500 });
      const list = Array.isArray(res) ? res : (res as any)?.data || [];
      setUsers(list);
    } catch (e) {
      console.error('Failed to load users:', e);
    }
  };

  // تحميل البيانات عند تحميل المكون
  useEffect(() => {
    loadUsers();
    // لا تحمل المعاملات هنا
  }, []);

  // أعد تحميل المعاملات عندما تتغير بيانات المستخدمين (users)
  useEffect(() => {
    if (users.length > 0) {
      loadRecentTransactions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users]);

  // When changing invoices report pagination, fetch only invoices list page
  useEffect(() => {
    if (!reportsData || selectedReport !== 'invoices') return;
    let cancelled = false;
    (async () => {
      try {
        const pageData = await fetchInvoicesReportPage(invoicesReportPage, invoicesReportPageSize);
        if (cancelled) return;
        setInvoicesReportTotalPages(pageData.totalPages);
        setReportsData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            invoices: {
              ...prev.invoices,
              data: pageData.results,
              pagination: {
                page: pageData.page,
                limit: pageData.pageSize,
                total: pageData.count,
                totalPages: pageData.totalPages,
              },
            },
          };
        });
      } catch {
        // ignore: keep previous data
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoicesReportPage, invoicesReportPageSize, selectedReport]);
  

  const getTransactionIcon = (type: string) => {
    return type === 'revenue' ? '💰' : '💸';
  };

  const getTransactionColor = (type: string) => {
    return type === 'revenue' ? 'text-green-600' : 'text-red-600';
  };

  const getCategoryText = (category: string) => {
    const key = `AdminFinancialOverview.categories.${category}`;
    const translated = t(key);
    // إذا لم يجد الترجمة أو رجع نفس النص، اعرض اسم الفئة نفسه
    if (!translated || translated === key) {
      // اجعل أول حرف كابيتال أو اعرضه كما هو
      return category.charAt(0).toUpperCase() + category.slice(1);
    }
    return translated;
  };

  // دالة لعرض الوقت بشكل ودي بالعربي
  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    if (diffInMinutes < 1) return 'الآن';
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `منذ ${diffInDays} يوم`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `منذ ${diffInWeeks} أسبوع`;
  };

  return (
    <div className="space-y-6">
            <VideoTutorial 
              videoId="iJnZkG_QDGQ"
              title=" إزاي تتابع كل العمليات المالية لحظة بلحظة وتتحكم في كل التفاصيل من مكان واحد" 
              position="bottom-right"
              buttonText="شرح"
            />
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">الإيرادات الشهرية</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">ج.م{metrics.revenue.monthly.toLocaleString()}</p>
              <p className="text-sm text-green-600 dark:text-green-400">{metrics.revenue.growth >= 0 ? '+' : ''}{metrics.revenue.growth.toFixed(1)}% من الشهر الماضي</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white text-xl">
              💰
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">المصروفات الشهرية</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">ج.م{metrics.expenses.monthly.toLocaleString()}</p>
              <p className="text-sm text-red-600 dark:text-red-400">{metrics.expenses.growth >= 0 ? '+' : ''}{metrics.expenses.growth.toFixed(1)}% من الشهر الماضي</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center text-white text-xl">
              💸
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">صافي الربح الشهري</p>
              <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">ج.م{metrics.profit.monthly.toLocaleString()}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{metrics.profit.growth >= 0 ? '+' : ''}{metrics.profit.growth.toFixed(1)}% من الشهر الماضي</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg flex items-center justify-center text-white text-xl">
              📈
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 px-6 mb-[85px]">
            {[

              {
                id: 'transactions',
                name: 'المعاملات الأخيرة',
                icon: '💳',
              },
              {
                id: 'reports',
                name: 'التقارير',
                icon: '📈',
              },
              {
                id: 'invoices',
                name: 'الفواتير',
                icon: '🧾',
              },
              {
                id: 'payroll',
                name: 'الرواتب',
                icon: '🧑\u200d💼',
              },
              {
                id: 'revenue',
                name: 'الإيرادات',
                icon: '💹',
              },
              {
                id: 'expenses',
                name: 'المصروفات',
                icon: '💸',
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-gray-500 text-gray-600 dark:text-gray-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
          {/* Mobile Navigation */}
          <div className="md:hidden">
            <div className="overflow-x-auto hide-scrollbar w-full pb-3 ">
              <nav className="flex sm:flex-row flex-col space-x-2 px-4 py-2 min-w-max flex-wrap">
                {[

                  {
                    id: 'transactions',
                    name: 'المعاملات الأخيرة',
                    icon: '💳',
                    shortName: 'المعاملات',
                  },
                  {
                    id: 'reports',
                    name: 'التقارير',
                    icon: '📈',
                    shortName: 'التقارير',
                  },
                  {
                    id: 'invoices',
                    name: 'الفواتير',
                    icon: '🧾',
                    shortName: 'الفواتير',
                  },
                  {
                    id: 'payroll',
                    name: 'الرواتب',
                    icon: '🧑\u200d💼',
                    shortName: 'الرواتب',
                  },
                  {
                    id: 'revenue',
                    name: 'الإيرادات',
                    icon: '💹',
                    shortName: 'الإيرادات',
                  },
                  {
                    id: 'expenses',
                    name: 'المصروفات',
                    icon: '💸',
                    shortName: 'المصروفات',
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-shrink-0 py-2 px-3 border-b-2 font-medium text-xs transition-colors whitespace-nowrap rounded-t-lg ${
                      activeTab === tab.id
                        ? 'border-gray-500 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <span className="mr-1 text-sm">{tab.icon}</span>
                    <span className="text-xs">{tab.shortName}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        <div className="p-6">


          {activeTab === 'transactions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                المعاملات الأخيرة
                </h3>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={exportTransactionsToExcel}
                    disabled={loading}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? 'جارِ التصدير...' : 'تصدير البيانات'}
                  </button>
                  <button 
                    onClick={loadRecentTransactions}
                    disabled={loading}
                    className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
                  >
                    {loading ? 'جارِ التحميل...' : 'تحديث'}
                  </button>
                </div>
              </div>
              
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              )}
              
              {loading && recentTransactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  جارِ تحميل المعاملات...
                </div>
              ) : recentTransactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  لا توجد معاملات حديثة
                </div>
              ) : (
                <div className="space-y-3">
                  {paginatedTransactions.map((transaction) => {
                    // تجهيز وصف مختصر
                    let title = '';
                    let description = '';
                    let icon = getTransactionIcon(transaction.type);
                    let color = transaction.type === 'revenue' ? 'text-green-600' : 'text-red-600';
                    if (transaction.category === 'invoice') {
                      title = `فاتورة #${transaction.description?.match(/\d+/)?.[0] || ''}`;
                      description = transaction.description;
                      icon = '🧾';
                      color = 'text-gray-600';
                    } else if (transaction.category === 'payroll') {
                      title = 'راتب';
                      // عرض اسم الموظف بشكل ذكي
                      const name = transaction.employeeName || userMap?.[transaction.employeeId]?.name || transaction.employeeId || 'موظف';
                      description = `راتب - ${name}`;
                      icon = '🧑‍💼';
                      color = 'text-gray-600';
                    } else if (transaction.type === 'revenue') {
                      title = 'دفعة مستلمة';
                      description = transaction.description;
                      icon = '💰';
                      color = 'text-green-600';
                    } else if (transaction.type === 'expense') {
                      title = 'مصروف';
                      description = transaction.description;
                      icon = '💸';
                      color = 'text-red-600';
                    }
                    // اسم العميل أو الموظف إن وجد
                    let extra = '';
                    if (transaction.clientName) extra = transaction.clientName;
                    if (transaction.employeeName) extra = transaction.employeeName;
                    if (transaction.vendorName) extra = transaction.vendorName;

                    return (
                      <div
                        key={transaction.id}
                        className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${color}`}>
                          {icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">{title}</h4>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{getTimeAgo(transaction.date)}</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
                          {extra && <p className="text-xs text-gray-400 mt-1">{extra}</p>}
                        </div>
                        <div className="text-right min-w-[80px]">
                          <p className={`font-medium ${color}`}>{transaction.amount > 0 ? '+' : ''}ج.م{transaction.amount.toLocaleString()}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {recentTransactions.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 text-sm text-gray-700 dark:text-gray-300">
                  <div>
                    عرض {transactionsStartIndex + 1} إلى {transactionsEndIndex} من {recentTransactions.length} نتيجة
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="px-3 py-1 rounded border border-gray-300 dark:border-gray-700 disabled:opacity-50"
                      onClick={() => setTransactionsCurrentPage(p => Math.max(1, p - 1))}
                      disabled={transactionsCurrentPage === 1}
                    >
                      السابق
                    </button>
                    <span>
                      صفحة {transactionsCurrentPage} من {transactionsPageCount}
                    </span>
                    <button
                      className="px-3 py-1 rounded border border-gray-300 dark:border-gray-700 disabled:opacity-50"
                      onClick={() => setTransactionsCurrentPage(p => Math.min(transactionsPageCount, p + 1))}
                      disabled={transactionsCurrentPage === transactionsPageCount}
                    >
                      التالي
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  التقارير المالية الشاملة
                </h3>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={exportReportsToExcel}
                    disabled={reportsLoading || !selectedReport}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {reportsLoading ? 'جارِ التصدير...' : 'تصدير البيانات'}
                  </button>
                  <button 
                    onClick={loadReportsData}
                    disabled={reportsLoading}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
                  >
                    {reportsLoading ? 'جارِ التحميل...' : 'تحديث التقارير'}
                  </button>
                </div>
              </div>

              {reportsError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {reportsError}
                </div>
              )}

              {reportsLoading && !reportsData ? (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                              جارِ تحميل التقارير المالية...
                            </div>
              ) : reportsData ? (
                <div className="space-y-6">
                  {/* أزرار اختيار التقرير */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <button 
                      onClick={() => {
                        setSelectedReport('invoices');
                        setInvoicesReportPage(1);
                      }}
                      className={`p-3 rounded-lg border transition-colors text-right ${
                        selectedReport === 'invoices' 
                          ? 'bg-gray-50 border-gray-200 text-gray-700' 
                          : 'border-gray-200 hover:bg-gray-500'
                      }`}
                    >
                      <div className="text-2xl mb-1">🧾</div>
                      <div className="font-medium text-sm">الفواتير</div>
                    </button>
                    <button 
                      onClick={() => setSelectedReport('payrolls')}
                      className={`p-3 rounded-lg border transition-colors text-right ${
                        selectedReport === 'payrolls' 
                          ? 'bg-gray-50 border-gray-200 text-gray-700' 
                          : 'border-gray-200 hover:bg-gray-500'
                      }`}
                    >
                      <div className="text-2xl mb-1">🧑‍💼</div>
                      <div className="font-medium text-sm">الرواتب</div>
                    </button>
                    <button 
                      onClick={() => setSelectedReport('revenues')}
                      className={`p-3 rounded-lg border transition-colors text-right ${
                        selectedReport === 'revenues' 
                          ? 'bg-gray-50 border-gray-200 text-gray-700' 
                          : 'border-gray-200 hover:bg-gray-500'
                      }`}
                    >
                      <div className="text-2xl mb-1">💹</div>
                      <div className="font-medium text-sm">الإيرادات</div>
                    </button>
                    <button 
                      onClick={() => setSelectedReport('expenses')}
                      className={`p-3 rounded-lg border transition-colors text-right ${
                        selectedReport === 'expenses' 
                          ? 'bg-gray-50 border-gray-200 text-gray-700' 
                          : 'border-gray-200 hover:bg-gray-500'
                      }`}
                    >
                      <div className="text-2xl mb-1">💸</div>
                      <div className="font-medium text-sm">المصروفات</div>
                    </button>
                    <button 
                      onClick={() => setSelectedReport('summary')}
                      className={`p-3 rounded-lg border transition-colors text-right ${
                        selectedReport === 'summary' 
                          ? 'bg-gray-50 border-gray-200 text-gray-700' 
                          : 'border-gray-200 hover:bg-gray-500'
                      }`}
                    >
                      <div className="text-2xl mb-1">📊</div>
                      <div className="font-medium text-sm">التقرير الشامل</div>
                    </button>
                  </div>

                  {/* عرض التقرير المحدد */}
                  {selectedReport && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                      {selectedReport === 'invoices' && (
                        <div className="space-y-4">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            🧾 تقرير الفواتير
                          </h4>
                          
                          {/* إحصائيات الفواتير */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <div className="text-2xl font-bold text-gray-600">{reportsData.invoices.total}</div>
                              <div className="text-sm text-gray-600 dark:text-black-300">إجمالي الفواتير</div>
                            </div>
                            <div className="p-4 bg-green-50 rounded-lg">
                              <div className="text-2xl font-bold text-green-600">{reportsData.invoices.paid}</div>
                              <div className="text-sm text-gray-600 dark:text-black-300">مدفوعة</div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <div className="text-2xl font-bold text-gray-600">{reportsData.invoices.pending}</div>
                              <div className="text-sm text-gray-600 dark:text-black-300">معلقة</div>
                            </div>
                            <div className="p-4 bg-red-50 rounded-lg">
                              <div className="text-2xl font-bold text-red-600">{reportsData.invoices.overdue}</div>
                              <div className="text-sm text-gray-600 dark:text-black-300">متأخرة</div>
                            </div>
                          </div>

                          {/* المبالغ المالية */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 border border-gray-200 rounded-lg">
                              <h5 className="font-medium text-white-900 mb-2">المبالغ المالية</h5>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">إجمالي الفواتير:</span>
                                  <span className="font-medium">ج.م{new Intl.NumberFormat().format(reportsData.invoices.totalAmount)}</span>
                                </div>
                                <div className="flex justify-between text-green-600">
                                  <span>المدفوع:</span>
                                  <span className="font-medium">ج.م{new Intl.NumberFormat().format(reportsData.invoices.paidAmount)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                  <span>المعلق:</span>
                                  <span className="font-medium">ج.م{new Intl.NumberFormat().format(reportsData.invoices.pendingAmount)}</span>
                                </div>
                                <div className="flex justify-between text-red-600">
                                  <span>المتأخر:</span>
                                  <span className="font-medium">ج.م{new Intl.NumberFormat().format(reportsData.invoices.overdueAmount)}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="p-4 border border-gray-200 rounded-lg">
                              <h5 className="font-medium text-white-900 mb-2">نسب التحصيل</h5>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">نسبة التحصيل:</span>
                                  <span className="font-medium">
                                    {reportsData.invoices.totalAmount > 0 
                                      ? ((reportsData.invoices.paidAmount / reportsData.invoices.totalAmount) * 100).toFixed(1)
                                      : 0}%
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">نسبة المعلق:</span>
                                  <span className="font-medium">
                                    {reportsData.invoices.totalAmount > 0 
                                      ? ((reportsData.invoices.pendingAmount / reportsData.invoices.totalAmount) * 100).toFixed(1)
                                      : 0}%
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">نسبة المتأخر:</span>
                                  <span className="font-medium">
                                    {reportsData.invoices.totalAmount > 0 
                                      ? ((reportsData.invoices.overdueAmount / reportsData.invoices.totalAmount) * 100).toFixed(1)
                                      : 0}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* قائمة الفواتير */}
                          <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-4 py-2 border-b">
                              <div className="flex items-center justify-between gap-3 flex-wrap">
                                <h5 className="font-medium text-gray-900">الفواتير</h5>
                                <div className="flex items-center gap-2 text-sm">
                                  <select
                                    value={invoicesReportPageSize}
                                    onChange={(e) => {
                                      setInvoicesReportPage(1);
                                      setInvoicesReportPageSize(Number(e.target.value));
                                    }}
                                    className="border border-gray-200 rounded px-2 py-1 bg-white"
                                  >
                                    {[10, 20, 50].map((n) => (
                                      <option key={n} value={n}>
                                        {n} / صفحة
                                      </option>
                                    ))}
                                  </select>
                                  <div className="text-gray-600">
                                    صفحة {invoicesReportPage} من {invoicesReportTotalPages}
                                  </div>
                                  <button
                                    onClick={() => setInvoicesReportPage((p) => Math.max(1, p - 1))}
                                    disabled={invoicesReportPage <= 1}
                                    className="px-2 py-1 border rounded disabled:opacity-50"
                                  >
                                    السابق
                                  </button>
                                  <button
                                    onClick={() => setInvoicesReportPage((p) => Math.min(invoicesReportTotalPages, p + 1))}
                                    disabled={invoicesReportPage >= invoicesReportTotalPages}
                                    className="px-2 py-1 border rounded disabled:opacity-50"
                                  >
                                    التالي
                                  </button>
                                </div>
                              </div>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                              {(reportsData.invoices.data || []).map((invoice: any, index: number) => (
                                <div key={invoice._id || index} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${
                                      invoice.status === 'paid' ? 'bg-green-500' :
                                      invoice.status === 'pending' ? 'bg-gray-500' : 'bg-red-500'
                                    }`}></div>
                                    <div>
                                      <div className="font-medium">فاتورة #{invoice.invoiceNumber || invoice._id}</div>
                                      <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {userMap[invoice.userId]?.name || invoice.userId} • {new Date(invoice.createdAt).toLocaleDateString()}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-medium">ج.م{new Intl.NumberFormat().format(invoice.amount || 0)}</div>
                                    <div className={`text-sm ${
                                      invoice.status === 'paid' ? 'text-green-600' :
                                      invoice.status === 'pending' ? 'text-gray-600' : 'text-red-600'
                                    }`}>
                                      {invoice.status === 'paid' ? 'مدفوعة' :
                                       invoice.status === 'pending' ? 'معلقة' : 'متأخرة'}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedReport === 'payrolls' && (
                        <div className="space-y-4">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            🧑‍💼 تقرير الرواتب
                          </h4>
                          
                          {/* إحصائيات الرواتب */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <div className="text-2xl font-bold text-gray-600">{reportsData.payrolls.total}</div>
                              <div className="text-sm text-gray-600 dark:text-black-300">إجمالي الرواتب</div>
                            </div>
                            <div className="p-4 bg-green-50 rounded-lg">
                              <div className="text-2xl font-bold text-green-600">ج.م{new Intl.NumberFormat().format(reportsData.payrolls.totalAmount)}</div>
                              <div className="text-sm text-gray-600 dark:text-black-300">إجمالي الرواتب</div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <div className="text-2xl font-bold text-gray-600">ج.م{new Intl.NumberFormat().format(reportsData.payrolls.totalBonuses)}</div>
                              <div className="text-sm text-gray-600 dark:text-black-300">إجمالي المكافآت</div>
                            </div>
                            <div className="p-4 bg-red-50 rounded-lg">
                              <div className="text-2xl font-bold text-red-600">ج.م{new Intl.NumberFormat().format(reportsData.payrolls.totalDeductions)}</div>
                              <div className="text-sm text-gray-600 dark:text-black-300">إجمالي الخصومات</div>
                            </div>
                          </div>

                          {/* تفاصيل الرواتب */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 border border-gray-200 rounded-lg">
                              <h5 className="font-medium text-gray-500 mb-2">تفاصيل الرواتب</h5>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">صافي الرواتب:</span>
                                  <span className="font-medium text-green-600">ج.م{new Intl.NumberFormat().format(reportsData.payrolls.netAmount)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">متوسط الراتب:</span>
                                  <span className="font-medium">
                                    ج.م{reportsData.payrolls.total > 0 
                                      ? new Intl.NumberFormat().format(reportsData.payrolls.totalAmount / reportsData.payrolls.total)
                                      : 0}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">نسبة المكافآت:</span>
                                  <span className="font-medium">
                                    {reportsData.payrolls.totalAmount > 0 
                                      ? ((reportsData.payrolls.totalBonuses / reportsData.payrolls.totalAmount) * 100).toFixed(1)
                                      : 0}%
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">نسبة الخصومات:</span>
                                  <span className="font-medium">
                                    {reportsData.payrolls.totalAmount > 0 
                                      ? ((reportsData.payrolls.totalDeductions / reportsData.payrolls.totalAmount) * 100).toFixed(1)
                                      : 0}%
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="p-4 border border-gray-200 rounded-lg">
                              <h5 className="font-medium text-gray-500 mb-2">آخر الرواتب</h5>
                              <div className="space-y-2 max-h-48 overflow-y-auto">
                                {reportsData.payrolls.data.slice(0, 5).map((payroll: any, index: number) => (
                                  <div key={payroll._id || index} className="flex justify-between items-center p-2 rounded">
                                    <div>
                                      <div className="font-medium text-sm text-gray-400">راتب - {userMap[payroll.employeeId]?.name || payroll.employeeId || 'موظف'}</div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(payroll.paymentDate).toLocaleDateString()}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-medium text-sm">ج.م{new Intl.NumberFormat().format(payroll.salaryAmount || 0)}</div>
                                      {payroll.bonuses > 0 && (
                                        <div className="text-xs text-green-600">+{payroll.bonuses} مكافأة</div>
                                      )}
                                      {payroll.deductions > 0 && (
                                        <div className="text-xs text-red-600">-{payroll.deductions} خصم</div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedReport === 'revenues' && (
                        <div className="space-y-4">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            💹 تقرير الإيرادات
                          </h4>
                          
                          {/* إحصائيات الإيرادات */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <div className="text-2xl font-bold text-gray-600">{reportsData.revenues.total}</div>
                              <div className="text-sm text-gray-600 dark:text-black-300">إجمالي المعاملات</div>
                            </div>
                            <div className="p-4 bg-green-50 rounded-lg">
                              <div className="text-2xl font-bold text-green-600">ج.م{new Intl.NumberFormat().format(reportsData.revenues.totalAmount)}</div>
                              <div className="text-sm text-gray-600 dark:text-black-300">إجمالي الإيرادات</div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <div className="text-2xl font-bold text-gray-600">
                                ج.م{reportsData.revenues.total > 0 
                                  ? new Intl.NumberFormat().format(reportsData.revenues.totalAmount / reportsData.revenues.total)
                                  : 0}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-black-300">متوسط المعاملة</div>
                            </div>
                          </div>

                          {/* توزيع الإيرادات حسب المصدر */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 border border-gray-200 rounded-lg">
                              <h5 className="font-medium text-gray-400 mb-2">توزيع الإيرادات حسب المصدر</h5>
                              <div className="space-y-2">
                                {Object.entries(reportsData.revenues.bySource).map(([source, amount]: [string, any]) => (
                                  <div key={source} className="flex justify-between">
                                    <span className="text-gray-600 capitalize">{source}:</span>
                                    <span className="font-medium">ج.م{new Intl.NumberFormat().format(amount)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div className="p-4 border border-gray-200 rounded-lg">
                              <h5 className="font-medium text-gray-400 mb-2">توزيع الإيرادات حسب طريقة الدفع</h5>
                              <div className="space-y-2">
                                {Object.entries(reportsData.revenues.byPaymentMethod).map(([method, amount]: [string, any]) => (
                                  <div key={method} className="flex justify-between">
                                    <span className="text-gray-600 capitalize">{method}:</span>
                                    <span className="font-medium">ج.م{new Intl.NumberFormat().format(amount)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* قائمة الإيرادات */}
                          <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-4 py-2 border-b">
                              <h5 className="font-medium text-gray-900">آخر الإيرادات</h5>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                              {reportsData.revenues.data.slice(0, 10).map((revenue: any, index: number) => (
                                <div key={revenue._id || index} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0">
                                  <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <div>
                                      <div className="font-medium">{revenue.notes || 'إيراد'}</div>
                                      <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {revenue.sourceType} • {new Date(revenue.date).toLocaleDateString()}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-medium text-green-600">ج.م{new Intl.NumberFormat().format(revenue.amount || 0)}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{revenue.paymentMethod}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedReport === 'expenses' && (
                        <div className="space-y-4">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            💸 تقرير المصروفات
                          </h4>
                          
                          {/* إحصائيات المصروفات */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <div className="text-2xl font-bold text-gray-600">{reportsData.expenses.total}</div>
                              <div className="text-sm text-gray-600 dark:text-black-300">إجمالي المصروفات</div>
                            </div>
                            <div className="p-4 bg-red-50 rounded-lg">
                              <div className="text-2xl font-bold text-red-600">ج.م{new Intl.NumberFormat().format(reportsData.expenses.totalAmount)}</div>
                              <div className="text-sm text-gray-600 dark:text-black-300">إجمالي المبلغ</div>
                            </div>
                            <div className="p-4 bg-orange-50 rounded-lg">
                              <div className="text-2xl font-bold text-orange-600">
                                ج.م{reportsData.expenses.total > 0 
                                  ? new Intl.NumberFormat().format(reportsData.expenses.totalAmount / reportsData.expenses.total)
                                  : 0}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-black-300">متوسط المصروف</div>
                            </div>
                          </div>

                          {/* توزيع المصروفات حسب الفئة */}
                          <div className="p-4 border border-gray-200 rounded-lg">
                            <h5 className="font-medium text-gray-400 mb-2">توزيع المصروفات حسب الفئة</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {Object.entries(reportsData.expenses.byCategory).map(([category, amount]: [string, any]) => (
                                <div key={category} className="flex justify-between items-center p-3 bg-gray-300 rounded">
                                  <span className="text-white-600 capitalize">{category}:</span>
                                  <span className="font-medium text-red-600">ج.م{new Intl.NumberFormat().format(amount)}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* قائمة المصروفات */}
                          <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-4 py-2 border-b">
                              <h5 className="font-medium text-gray-900">آخر المصروفات</h5>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                              {reportsData.expenses.data.slice(0, 10).map((expense: any, index: number) => (
                                <div key={expense._id || index} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0">
                                  <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <div>
                                      <div className="font-medium">{expense.description || 'مصروف'}</div>
                                      <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {expense.category} • {new Date(expense.date).toLocaleDateString()}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-medium text-red-600">ج.م{new Intl.NumberFormat().format(expense.amount || 0)}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{expense.category}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedReport === 'summary' && (
                        <div className="space-y-4">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            📊 التقرير المالي الشامل
                          </h4>
                          
                          {/* المؤشرات الرئيسية */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                              <div className="text-3xl font-bold text-green-600">ج.م{new Intl.NumberFormat().format(reportsData.summary.totalRevenue)}</div>
                              <div className="text-sm text-gray-600 dark:text-black-300 mt-1">إجمالي الإيرادات</div>
                            </div>
                            <div className="p-6 bg-red-50 rounded-lg border border-red-200">
                              <div className="text-3xl font-bold text-red-600">ج.م{new Intl.NumberFormat().format(reportsData.summary.totalExpenses)}</div>
                              <div className="text-sm text-gray-600 dark:text-black-300 mt-1">إجمالي المصروفات</div>
                            </div>
                            <div className={`p-6 rounded-lg border ${
                              reportsData.summary.netProfit >= 0 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-red-50 border-red-200'
                            }`}>
                              <div className={`text-3xl font-bold ${
                                reportsData.summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                ج.م{new Intl.NumberFormat().format(reportsData.summary.netProfit)}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-black-300 mt-1">صافي الربح</div>
                            </div>
                          </div>

                          {/* تفاصيل الفواتير */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 border border-gray-200 rounded-lg">
                              <h5 className="font-medium text-gray-400 mb-3">حالة الفواتير</h5>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">إجمالي الفواتير:</span>
                                  <span className="font-medium">ج.م{new Intl.NumberFormat().format(reportsData.summary.totalInvoices)}</span>
                                </div>
                                <div className="flex justify-between text-green-600">
                                  <span>المدفوع:</span>
                                  <span className="font-medium">ج.م{new Intl.NumberFormat().format(reportsData.summary.paidInvoices)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                  <span>المعلق:</span>
                                  <span className="font-medium">ج.م{new Intl.NumberFormat().format(reportsData.summary.pendingInvoices)}</span>
                                </div>
                                <div className="flex justify-between text-red-600">
                                  <span>المتأخر:</span>
                                  <span className="font-medium">ج.م{new Intl.NumberFormat().format(reportsData.summary.overdueInvoices)}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="p-4 border border-gray-200 rounded-lg">
                              <h5 className="font-medium text-gray-400 mb-3">مؤشرات الأداء</h5>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">هامش الربح:</span>
                                  <span className={`font-medium ${
                                    reportsData.summary.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {reportsData.summary.profitMargin.toFixed(1)}%
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">نسبة التحصيل:</span>
                                  <span className="font-medium text-gray-600">
                                    {reportsData.summary.totalInvoices > 0 
                                      ? ((reportsData.summary.paidInvoices / reportsData.summary.totalInvoices) * 100).toFixed(1)
                                      : 0}%
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">نسبة المصروفات:</span>
                                  <span className="font-medium text-red-600">
                                    {reportsData.summary.totalRevenue > 0 
                                      ? ((reportsData.summary.totalExpenses / reportsData.summary.totalRevenue) * 100).toFixed(1)
                                      : 0}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* ملخص سريع */}
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <h5 className="font-medium text-gray-900 mb-2">ملخص سريع</h5>
                            <div className="text-sm text-gray-600 dark:text-black-300">
                              {reportsData.summary.netProfit >= 0 ? (
                                <span className="text-green-600 dark:text-green-400">
                                  ✅ المؤسسة تحقق ربحاً إيجابياً بنسبة {reportsData.summary.profitMargin.toFixed(1)}%
                                </span>
                              ) : (
                                <span className="text-red-600 dark:text-red-400">
                                  ⚠️ المؤسسة تعاني من خسارة بقيمة ج.م{new Intl.NumberFormat().format(Math.abs(reportsData.summary.netProfit))}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  اضغط على "تحديث التقارير" لعرض البيانات المالية
                </div>
              )}
            </div>
          )}

          {activeTab === 'invoices' && (
            <div className="space-y-4">
              {(() => {
                const AdminInvoices = dynamic(() => import('./AdminInvoices'), { ssr: false });
                return <AdminInvoices />;
              })()}
            </div>
          )}

          {activeTab === 'payroll' && (
            <div className="space-y-4">
              {(() => {
                const AdminPayroll = dynamic(() => import('./AdminPayroll'), { ssr: false });
                return <AdminPayroll />;
              })()}
            </div>
          )}

          {activeTab === 'revenue' && (
            <div className="space-y-4">
              {(() => {
                const AdminRevenue = dynamic(() => import('./AdminRevenue'), { ssr: false });
                return <AdminRevenue />;
              })()}
            </div>
          )}

          {activeTab === 'expenses' && (
            <div className="space-y-4">
              {(() => {
                const AdminExpenses = dynamic(() => import('./AdminExpenses'), { ssr: false });
                return <AdminExpenses />;
              })()}
            </div>
          )}
        </div>
      </div>
      
      {/* Custom Alert */}
      <CustomAlert
        isOpen={alertState.isOpen}
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
        onClose={hideAlert}
      />
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default AdminFinancialOverview;