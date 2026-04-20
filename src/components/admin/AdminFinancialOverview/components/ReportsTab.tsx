import React, { useState, useEffect } from 'react';
import { invoiceService, payrollService, revenueService, expenseService } from '@/services';
import * as XLSX from 'xlsx';

interface ReportsTabProps {
  userMap: Record<string, any>;
  onSuccess: (title: string, msg: string) => void;
  onError: (title: string, msg: string) => void;
}

// ─── helpers ───────────────────────────────────────────────────────────────

const normalizeInvoicesList = (raw: any): { count: number; results: any[] } => {
  if (!raw) return { count: 0, results: [] };
  if (Array.isArray(raw)) return { count: raw.length, results: raw };
  if (Array.isArray(raw.results)) return { count: Number(raw.count ?? raw.results.length ?? 0), results: raw.results };
  if (Array.isArray(raw.data) && raw.pagination) return { count: Number(raw.pagination.total ?? raw.data.length ?? 0), results: raw.data };
  if (Array.isArray(raw.data)) return { count: raw.data.length, results: raw.data };
  return { count: 0, results: [] };
};

const fmt = (n: number) => `ج.م${new Intl.NumberFormat().format(n)}`;

// ─── sub-views ─────────────────────────────────────────────────────────────

const InvoicesReport = ({
  data, userMap, page, pageSize, totalPages,
  onPageChange, onPageSizeChange,
}: any) => (
  <div className="space-y-4">
    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">🧾 تقرير الفواتير</h4>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: 'إجمالي', value: data.total, bg: 'bg-gray-50', color: 'text-gray-600' },
        { label: 'مدفوعة', value: data.paid, bg: 'bg-green-50', color: 'text-green-600' },
        { label: 'معلقة', value: data.pending, bg: 'bg-gray-50', color: 'text-gray-600' },
        { label: 'متأخرة', value: data.overdue, bg: 'bg-red-50', color: 'text-red-600' },
      ].map((s) => (
        <div key={s.label} className={`p-4 ${s.bg} rounded-lg`}>
          <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
          <div className="text-sm text-gray-600">{s.label}</div>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-4 border border-gray-200 rounded-lg space-y-2">
        <h5 className="font-medium text-gray-500">المبالغ المالية</h5>
        {[
          { label: 'إجمالي', val: data.totalAmount, color: '' },
          { label: 'المدفوع', val: data.paidAmount, color: 'text-green-600' },
          { label: 'المعلق', val: data.pendingAmount, color: 'text-gray-600' },
          { label: 'المتأخر', val: data.overdueAmount, color: 'text-red-600' },
        ].map((r) => (
          <div key={r.label} className={`flex justify-between ${r.color}`}>
            <span className="text-gray-600">{r.label}:</span>
            <span className="font-medium">{fmt(r.val)}</span>
          </div>
        ))}
      </div>

      <div className="p-4 border border-gray-200 rounded-lg space-y-2">
        <h5 className="font-medium text-gray-500">نسب التحصيل</h5>
        {[
          { label: 'نسبة التحصيل', val: data.paidAmount },
          { label: 'نسبة المعلق', val: data.pendingAmount },
          { label: 'نسبة المتأخر', val: data.overdueAmount },
        ].map((r) => (
          <div key={r.label} className="flex justify-between">
            <span className="text-gray-600">{r.label}:</span>
            <span className="font-medium">
              {data.totalAmount > 0 ? ((r.val / data.totalAmount) * 100).toFixed(1) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>

    {/* قائمة الفواتير مع pagination */}
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 border-b flex items-center justify-between flex-wrap gap-3">
        <h5 className="font-medium text-gray-900">الفواتير</h5>
        <div className="flex items-center gap-2 text-sm">
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="border border-gray-200 rounded px-2 py-1 bg-white"
          >
            {[10, 20, 50].map((n) => <option key={n} value={n}>{n} / صفحة</option>)}
          </select>
          <span className="text-gray-600">صفحة {page} من {totalPages}</span>
          <button onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page <= 1} className="px-2 py-1 border rounded disabled:opacity-50">السابق</button>
          <button onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="px-2 py-1 border rounded disabled:opacity-50">التالي</button>
        </div>
      </div>
      <div className="max-h-64 overflow-y-auto">
        {(data.data || []).map((invoice: any, i: number) => (
          <div key={invoice._id || i} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${invoice.status === 'paid' ? 'bg-green-500' : invoice.status === 'pending' ? 'bg-gray-500' : 'bg-red-500'}`} />
              <div>
                <div className="font-medium">فاتورة #{invoice.invoiceNumber || invoice._id}</div>
                <div className="text-sm text-gray-500">{userMap[invoice.userId]?.name || invoice.userId} • {new Date(invoice.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium">{fmt(invoice.amount || 0)}</div>
              <div className={`text-sm ${invoice.status === 'paid' ? 'text-green-600' : invoice.status === 'pending' ? 'text-gray-600' : 'text-red-600'}`}>
                {invoice.status === 'paid' ? 'مدفوعة' : invoice.status === 'pending' ? 'معلقة' : 'متأخرة'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const PayrollsReport = ({ data, userMap }: any) => (
  <div className="space-y-4">
    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">🧑‍💼 تقرير الرواتب</h4>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: 'إجمالي الرواتب (عدد)', value: data.total, bg: 'bg-gray-50', color: 'text-gray-600' },
        { label: 'إجمالي المبلغ', value: fmt(data.totalAmount), bg: 'bg-green-50', color: 'text-green-600' },
        { label: 'إجمالي المكافآت', value: fmt(data.totalBonuses), bg: 'bg-gray-50', color: 'text-gray-600' },
        { label: 'إجمالي الخصومات', value: fmt(data.totalDeductions), bg: 'bg-red-50', color: 'text-red-600' },
      ].map((s) => (
        <div key={s.label} className={`p-4 ${s.bg} rounded-lg`}>
          <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
          <div className="text-sm text-gray-600">{s.label}</div>
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-4 border border-gray-200 rounded-lg space-y-2">
        <h5 className="font-medium text-gray-500">تفاصيل الرواتب</h5>
        <div className="flex justify-between"><span className="text-gray-600">صافي الرواتب:</span><span className="font-medium text-green-600">{fmt(data.netAmount)}</span></div>
        <div className="flex justify-between"><span className="text-gray-600">متوسط الراتب:</span><span className="font-medium">{fmt(data.total > 0 ? Math.round(data.totalAmount / data.total) : 0)}</span></div>
        <div className="flex justify-between"><span className="text-gray-600">نسبة المكافآت:</span><span className="font-medium">{data.totalAmount > 0 ? ((data.totalBonuses / data.totalAmount) * 100).toFixed(1) : 0}%</span></div>
        <div className="flex justify-between"><span className="text-gray-600">نسبة الخصومات:</span><span className="font-medium">{data.totalAmount > 0 ? ((data.totalDeductions / data.totalAmount) * 100).toFixed(1) : 0}%</span></div>
      </div>
      <div className="p-4 border border-gray-200 rounded-lg">
        <h5 className="font-medium text-gray-500 mb-2">آخر الرواتب</h5>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {data.data.slice(0, 5).map((p: any, i: number) => (
            <div key={p._id || i} className="flex justify-between items-center p-2 rounded">
              <div>
                <div className="font-medium text-sm text-gray-400">راتب - {userMap[p.employeeId]?.name || p.employeeId || 'موظف'}</div>
                <div className="text-xs text-gray-500">{new Date(p.paymentDate).toLocaleDateString()}</div>
              </div>
              <div className="text-right">
                <div className="font-medium text-sm">{fmt(p.salaryAmount || 0)}</div>
                {p.bonuses > 0 && <div className="text-xs text-green-600">+{p.bonuses} مكافأة</div>}
                {p.deductions > 0 && <div className="text-xs text-red-600">-{p.deductions} خصم</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const RevenuesReport = ({ data }: any) => (
  <div className="space-y-4">
    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">💹 تقرير الإيرادات</h4>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-4 bg-gray-50 rounded-lg"><div className="text-2xl font-bold text-gray-600">{data.total}</div><div className="text-sm text-gray-600">إجمالي المعاملات</div></div>
      <div className="p-4 bg-green-50 rounded-lg"><div className="text-2xl font-bold text-green-600">{fmt(data.totalAmount)}</div><div className="text-sm text-gray-600">إجمالي الإيرادات</div></div>
      <div className="p-4 bg-gray-50 rounded-lg"><div className="text-2xl font-bold text-gray-600">{fmt(data.total > 0 ? Math.round(data.totalAmount / data.total) : 0)}</div><div className="text-sm text-gray-600">متوسط المعاملة</div></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-4 border border-gray-200 rounded-lg space-y-2">
        <h5 className="font-medium text-gray-400">حسب المصدر</h5>
        {Object.entries(data.bySource).map(([src, amt]: [string, any]) => (
          <div key={src} className="flex justify-between"><span className="text-gray-600 capitalize">{src}:</span><span className="font-medium">{fmt(amt)}</span></div>
        ))}
      </div>
      <div className="p-4 border border-gray-200 rounded-lg space-y-2">
        <h5 className="font-medium text-gray-400">حسب طريقة الدفع</h5>
        {Object.entries(data.byPaymentMethod).map(([method, amt]: [string, any]) => (
          <div key={method} className="flex justify-between"><span className="text-gray-600 capitalize">{method}:</span><span className="font-medium">{fmt(amt)}</span></div>
        ))}
      </div>
    </div>
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 border-b"><h5 className="font-medium text-gray-900">آخر الإيرادات</h5></div>
      <div className="max-h-64 overflow-y-auto">
        {data.data.slice(0, 10).map((r: any, i: number) => (
          <div key={r._id || i} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <div>
                <div className="font-medium">{r.notes || 'إيراد'}</div>
                <div className="text-sm text-gray-500">{r.sourceType} • {new Date(r.date).toLocaleDateString()}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium text-green-600">{fmt(r.amount || 0)}</div>
              <div className="text-sm text-gray-500">{r.paymentMethod}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ExpensesReport = ({ data }: any) => (
  <div className="space-y-4">
    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">💸 تقرير المصروفات</h4>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-4 bg-gray-50 rounded-lg"><div className="text-2xl font-bold text-gray-600">{data.total}</div><div className="text-sm text-gray-600">إجمالي المصروفات</div></div>
      <div className="p-4 bg-red-50 rounded-lg"><div className="text-2xl font-bold text-red-600">{fmt(data.totalAmount)}</div><div className="text-sm text-gray-600">إجمالي المبلغ</div></div>
      <div className="p-4 bg-orange-50 rounded-lg"><div className="text-2xl font-bold text-orange-600">{fmt(data.total > 0 ? Math.round(data.totalAmount / data.total) : 0)}</div><div className="text-sm text-gray-600">متوسط المصروف</div></div>
    </div>
    <div className="p-4 border border-gray-200 rounded-lg">
      <h5 className="font-medium text-gray-400 mb-2">توزيع حسب الفئة</h5>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(data.byCategory).map(([cat, amt]: [string, any]) => (
          <div key={cat} className="flex justify-between items-center p-3 bg-gray-300 rounded">
            <span className="capitalize">{cat}:</span>
            <span className="font-medium text-red-600">{fmt(amt)}</span>
          </div>
        ))}
      </div>
    </div>
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 border-b"><h5 className="font-medium text-gray-900">آخر المصروفات</h5></div>
      <div className="max-h-64 overflow-y-auto">
        {data.data.slice(0, 10).map((e: any, i: number) => (
          <div key={e._id || i} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div>
                <div className="font-medium">{e.description || 'مصروف'}</div>
                <div className="text-sm text-gray-500">{e.category} • {new Date(e.date).toLocaleDateString()}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium text-red-600">{fmt(e.amount || 0)}</div>
              <div className="text-sm text-gray-500">{e.category}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const SummaryReport = ({ data }: any) => (
  <div className="space-y-4">
    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">📊 التقرير المالي الشامل</h4>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-6 bg-green-50 rounded-lg border border-green-200"><div className="text-3xl font-bold text-green-600">{fmt(data.totalRevenue)}</div><div className="text-sm text-gray-600 mt-1">إجمالي الإيرادات</div></div>
      <div className="p-6 bg-red-50 rounded-lg border border-red-200"><div className="text-3xl font-bold text-red-600">{fmt(data.totalExpenses)}</div><div className="text-sm text-gray-600 mt-1">إجمالي المصروفات</div></div>
      <div className={`p-6 rounded-lg border ${data.netProfit >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <div className={`text-3xl font-bold ${data.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{fmt(data.netProfit)}</div>
        <div className="text-sm text-gray-600 mt-1">صافي الربح</div>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-4 border border-gray-200 rounded-lg space-y-2">
        <h5 className="font-medium text-gray-400">حالة الفواتير</h5>
        {[
          { label: 'إجمالي الفواتير', val: data.totalInvoices, color: '' },
          { label: 'المدفوع', val: data.paidInvoices, color: 'text-green-600' },
          { label: 'المعلق', val: data.pendingInvoices, color: 'text-gray-600' },
          { label: 'المتأخر', val: data.overdueInvoices, color: 'text-red-600' },
        ].map((r) => (
          <div key={r.label} className={`flex justify-between ${r.color}`}>
            <span className="text-gray-600">{r.label}:</span><span className="font-medium">{fmt(r.val)}</span>
          </div>
        ))}
      </div>
      <div className="p-4 border border-gray-200 rounded-lg space-y-2">
        <h5 className="font-medium text-gray-400">مؤشرات الأداء</h5>
        <div className="flex justify-between"><span className="text-gray-600">هامش الربح:</span><span className={`font-medium ${data.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>{data.profitMargin.toFixed(1)}%</span></div>
        <div className="flex justify-between"><span className="text-gray-600">نسبة التحصيل:</span><span className="font-medium text-gray-600">{data.totalInvoices > 0 ? ((data.paidInvoices / data.totalInvoices) * 100).toFixed(1) : 0}%</span></div>
        <div className="flex justify-between"><span className="text-gray-600">نسبة المصروفات:</span><span className="font-medium text-red-600">{data.totalRevenue > 0 ? ((data.totalExpenses / data.totalRevenue) * 100).toFixed(1) : 0}%</span></div>
      </div>
    </div>
    <div className="p-4 bg-gray-50 rounded-lg">
      <h5 className="font-medium text-gray-900 mb-2">ملخص سريع</h5>
      {data.netProfit >= 0
        ? <span className="text-green-600 text-sm">✅ المؤسسة تحقق ربحاً إيجابياً بنسبة {data.profitMargin.toFixed(1)}%</span>
        : <span className="text-red-600 text-sm">⚠️ المؤسسة تعاني من خسارة بقيمة {fmt(Math.abs(data.netProfit))}</span>}
    </div>
  </div>
);

// ─── main component ────────────────────────────────────────────────────────

const REPORT_TYPES = [
  { id: 'invoices',  label: 'الفواتير',       icon: '🧾' },
  { id: 'payrolls',  label: 'الرواتب',        icon: '🧑‍💼' },
  { id: 'revenues',  label: 'الإيرادات',      icon: '💹' },
  { id: 'expenses',  label: 'المصروفات',      icon: '💸' },
  { id: 'summary',   label: 'التقرير الشامل', icon: '📊' },
];

const ReportsTab: React.FC<ReportsTabProps> = ({ userMap, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [reportsData, setReportsData] = useState<any | null>(null);

  const [invoicesPage, setInvoicesPage] = useState(1);
  const [invoicesPageSize, setInvoicesPageSize] = useState(10);
  const [invoicesTotalPages, setInvoicesTotalPages] = useState(1);

  const fetchInvoicesPage = async (page: number, size: number) => {
    const skip = (page - 1) * size;
    const raw = await invoiceService.getInvoices({ limit: size, skip, sort: 'desc' });
    const { count, results } = normalizeInvoicesList(raw);
    return { count, results, totalPages: Math.max(1, Math.ceil(count / size)), page, pageSize: size };
  };

  const loadReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        invoicesPage1, allCount, paidCount, pendingCount, overdueCount,
        allAmt, paidAmt, pendingAmt, overdueAmt,
        payrolls, revenues, expenses,
      ] = await Promise.all([
        fetchInvoicesPage(1, invoicesPageSize),
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
        expenseService.list({ limit: 100, sort: 'desc' }),
      ]);

      setInvoicesPage(1);
      setInvoicesTotalPages(invoicesPage1.totalPages);

      const payrollList = payrolls.results || [];
      const revenueList = revenues.results || [];
      const expenseList = expenses.results || [];

      const invoiceStats = {
        total: normalizeInvoicesList(allCount).count,
        paid: normalizeInvoicesList(paidCount).count,
        pending: normalizeInvoicesList(pendingCount).count,
        overdue: normalizeInvoicesList(overdueCount).count,
        totalAmount: Number((allAmt as any)?.totals?.amount ?? 0),
        paidAmount: Number((paidAmt as any)?.totals?.amount ?? 0),
        pendingAmount: Number((pendingAmt as any)?.totals?.amount ?? 0),
        overdueAmount: Number((overdueAmt as any)?.totals?.amount ?? 0),
        data: invoicesPage1.results,
      };

      const payrollStats = {
        total: payrollList.length,
        totalAmount: payrollList.reduce((s: number, p: any) => s + (p.salaryAmount || 0), 0),
        totalBonuses: payrollList.reduce((s: number, p: any) => s + (p.bonuses || 0), 0),
        totalDeductions: payrollList.reduce((s: number, p: any) => s + (p.deductions || 0), 0),
        netAmount: payrollList.reduce((s: number, p: any) => s + (p.salaryAmount || 0) + (p.bonuses || 0) - (p.deductions || 0), 0),
        data: payrollList,
      };

      const revenueStats = {
        total: revenueList.length,
        totalAmount: revenueList.reduce((s: number, r: any) => s + (r.amount || 0), 0),
        bySource: revenueList.reduce((acc: any, r: any) => { const k = r.sourceType || 'other'; acc[k] = (acc[k] || 0) + (r.amount || 0); return acc; }, {}),
        byPaymentMethod: revenueList.reduce((acc: any, r: any) => { const k = r.paymentMethod || 'cash'; acc[k] = (acc[k] || 0) + (r.amount || 0); return acc; }, {}),
        data: revenueList,
      };

      const expenseStats = {
        total: expenseList.length,
        totalAmount: expenseList.reduce((s: number, e: any) => s + (e.amount || 0), 0),
        byCategory: expenseList.reduce((acc: any, e: any) => { const k = e.category || 'other'; acc[k] = (acc[k] || 0) + (e.amount || 0); return acc; }, {}),
        data: expenseList,
      };

      const totalExpenses = expenseStats.totalAmount + payrollStats.netAmount;
      setReportsData({
        invoices: invoiceStats,
        payrolls: payrollStats,
        revenues: revenueStats,
        expenses: expenseStats,
        summary: {
          totalRevenue: revenueStats.totalAmount,
          totalExpenses,
          netProfit: revenueStats.totalAmount - totalExpenses,
          totalInvoices: invoiceStats.totalAmount,
          paidInvoices: invoiceStats.paidAmount,
          pendingInvoices: invoiceStats.pendingAmount,
          overdueInvoices: invoiceStats.overdueAmount,
          profitMargin: revenueStats.totalAmount > 0 ? ((revenueStats.totalAmount - totalExpenses) / revenueStats.totalAmount) * 100 : 0,
        },
      });
    } catch (e: any) {
      setError(e?.message || 'فشل في تحميل بيانات التقارير');
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch invoices page when pagination changes
  useEffect(() => {
    if (!reportsData || selectedReport !== 'invoices') return;
    let cancelled = false;
    (async () => {
      const pageData = await fetchInvoicesPage(invoicesPage, invoicesPageSize).catch(() => null);
      if (cancelled || !pageData) return;
      setInvoicesTotalPages(pageData.totalPages);
      setReportsData((prev: any) => prev ? {
        ...prev,
        invoices: { ...prev.invoices, data: pageData.results },
      } : prev);
    })();
    return () => { cancelled = true; };
  }, [invoicesPage, invoicesPageSize, selectedReport]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleExport = async () => {
    if (!selectedReport || !reportsData) { onError('خطأ في التصدير', 'يرجى تحديد تقرير أولاً'); return; }
    try {
      setLoading(true);
      let rows: any[] = [];
      let fileName = '';
      let sheet = '';

      if (selectedReport === 'invoices') {
        rows = reportsData.invoices.data.map((inv: any) => ({
          'رقم الفاتورة': inv.invoiceNumber || inv._id,
          'العميل': userMap[inv.userId]?.name || inv.userId || 'غير محدد',
          'المبلغ (ج.م)': inv.totalAmount || inv.amount || 0,
          'تاريخ الإنشاء': inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('ar-EG') : '',
          'الحالة': inv.status === 'paid' ? 'مدفوعة' : inv.status === 'pending' ? 'معلقة' : 'متأخرة',
        }));
        fileName = `تقرير_الفواتير_${new Date().toLocaleDateString('ar-EG').replace(/\//g, '-')}.xlsx`;
        sheet = 'الفواتير';
      } else if (selectedReport === 'payrolls') {
        rows = reportsData.payrolls.data.map((p: any) => ({
          'الموظف': userMap[p.employeeId]?.name || p.employeeId || 'غير محدد',
          'الراتب (ج.م)': p.salaryAmount || 0,
          'المكافآت (ج.م)': p.bonuses || 0,
          'الخصومات (ج.م)': p.deductions || 0,
          'تاريخ الدفع': p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('ar-EG') : '',
        }));
        fileName = `تقرير_الرواتب_${new Date().toLocaleDateString('ar-EG').replace(/\//g, '-')}.xlsx`;
        sheet = 'الرواتب';
      } else if (selectedReport === 'revenues') {
        rows = reportsData.revenues.data.map((r: any) => ({
          'الوصف': r.notes || 'إيراد',
          'المبلغ (ج.م)': r.amount || 0,
          'التاريخ': r.date ? new Date(r.date).toLocaleDateString('ar-EG') : '',
          'المصدر': r.sourceType || '',
          'طريقة الدفع': r.paymentMethod || '',
        }));
        fileName = `تقرير_الإيرادات_${new Date().toLocaleDateString('ar-EG').replace(/\//g, '-')}.xlsx`;
        sheet = 'الإيرادات';
      } else if (selectedReport === 'expenses') {
        rows = reportsData.expenses.data.map((e: any) => ({
          'الوصف': e.description || 'مصروف',
          'المبلغ (ج.م)': e.amount || 0,
          'التاريخ': e.date ? new Date(e.date).toLocaleDateString('ar-EG') : '',
          'الفئة': e.category || '',
          'المورد': e.vendorName || '',
        }));
        fileName = `تقرير_المصروفات_${new Date().toLocaleDateString('ar-EG').replace(/\//g, '-')}.xlsx`;
        sheet = 'المصروفات';
      } else {
        const d = reportsData.summary;
        rows = [
          { 'المؤشر': 'إجمالي الإيرادات', 'القيمة (ج.م)': d.totalRevenue },
          { 'المؤشر': 'إجمالي المصروفات', 'القيمة (ج.م)': d.totalExpenses },
          { 'المؤشر': 'صافي الربح', 'القيمة (ج.م)': d.netProfit },
          { 'المؤشر': 'هامش الربح', 'القيمة (ج.م)': `${d.profitMargin.toFixed(1)}%` },
        ];
        fileName = `التقرير_المالي_الشامل_${new Date().toLocaleDateString('ar-EG').replace(/\//g, '-')}.xlsx`;
        sheet = 'التقرير الشامل';
      }

      const ws = XLSX.utils.json_to_sheet(rows);
      ws['!cols'] = Object.keys(rows[0] || {}).map(() => ({ wch: 20 }));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, sheet);
      XLSX.writeFile(wb, fileName);
      onSuccess('تم التصدير بنجاح', `تم تصدير ${rows.length} سجل`);
    } catch {
      onError('خطأ في التصدير', 'حدث خطأ أثناء التصدير');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">التقارير المالية الشاملة</h3>
        <div className="flex items-center space-x-2">
          <button onClick={handleExport} disabled={loading || !selectedReport} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
            {loading ? 'جارِ التصدير...' : 'تصدير البيانات'}
          </button>
          <button onClick={loadReports} disabled={loading} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50">
            {loading ? 'جارِ التحميل...' : 'تحديث التقارير'}
          </button>
        </div>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>}

      {loading && !reportsData ? (
        <div className="text-center py-8 text-gray-500">جارِ تحميل التقارير المالية...</div>
      ) : reportsData ? (
        <div className="space-y-6">
          {/* أزرار اختيار التقرير */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {REPORT_TYPES.map((r) => (
              <button
                key={r.id}
                onClick={() => { setSelectedReport(r.id); if (r.id === 'invoices') setInvoicesPage(1); }}
                className={`p-3 rounded-lg border transition-colors text-right ${selectedReport === r.id ? 'bg-gray-50 border-gray-200 text-gray-700' : 'border-gray-200 hover:bg-gray-500'}`}
              >
                <div className="text-2xl mb-1">{r.icon}</div>
                <div className="font-medium text-sm">{r.label}</div>
              </button>
            ))}
          </div>

          {/* المحتوى */}
          {selectedReport && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              {selectedReport === 'invoices' && (
                <InvoicesReport
                  data={reportsData.invoices}
                  userMap={userMap}
                  page={invoicesPage}
                  pageSize={invoicesPageSize}
                  totalPages={invoicesTotalPages}
                  onPageChange={setInvoicesPage}
                  onPageSizeChange={(s: number) => { setInvoicesPage(1); setInvoicesPageSize(s); }}
                />
              )}
              {selectedReport === 'payrolls'  && <PayrollsReport data={reportsData.payrolls} userMap={userMap} />}
              {selectedReport === 'revenues'  && <RevenuesReport data={reportsData.revenues} />}
              {selectedReport === 'expenses'  && <ExpensesReport data={reportsData.expenses} />}
              {selectedReport === 'summary'   && <SummaryReport  data={reportsData.summary}  />}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">اضغط على "تحديث التقارير" لعرض البيانات المالية</div>
      )}
    </div>
  );
};

export default ReportsTab;