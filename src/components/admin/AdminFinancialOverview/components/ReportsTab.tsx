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

const fmt = (n: number) =>
  `ج.م ${new Intl.NumberFormat('ar-EG').format(n)}`;

// ─── Status Badge ──────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { label: string; cls: string }> = {
    paid:    { label: 'مدفوعة', cls: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
    pending: { label: 'معلقة',  cls: 'bg-amber-100 text-amber-700 border border-amber-200' },
    overdue: { label: 'متأخرة', cls: 'bg-red-100 text-red-700 border border-red-200' },
  };
  const s = map[status] ?? { label: status, cls: 'bg-gray-100 text-gray-600 border border-gray-200' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>
      {s.label}
    </span>
  );
};

// ─── Stat Card ─────────────────────────────────────────────────────────────

const StatCard = ({
  label, value, accent = 'gray',
}: { label: string; value: string | number; accent?: 'gray' | 'green' | 'red' | 'amber' | 'blue' }) => {
  const accents: Record<string, string> = {
    gray:  'border-t-4 border-gray-400 bg-white',
    green: 'border-t-4 border-emerald-500 bg-white',
    red:   'border-t-4 border-red-500 bg-white',
    amber: 'border-t-4 border-amber-500 bg-white',
    blue:  'border-t-4 border-blue-500 bg-white',
  };
  const textColors: Record<string, string> = {
    gray:  'text-gray-700',
    green: 'text-emerald-700',
    red:   'text-red-700',
    amber: 'text-amber-700',
    blue:  'text-blue-700',
  };
  return (
    <div className={`p-5 rounded-xl shadow-sm ${accents[accent]}`}>
      <div className={`text-2xl font-bold tabular-nums ${textColors[accent]}`}>{value}</div>
      <div className="text-sm text-gray-500 mt-1 font-medium">{label}</div>
    </div>
  );
};

// ─── Section Box ───────────────────────────────────────────────────────────

const SectionBox = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
    <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
      <h5 className="font-semibold text-gray-700 text-sm">{title}</h5>
    </div>
    <div className="p-5 space-y-2">{children}</div>
  </div>
);

const Row = ({ label, value, colorCls = 'text-gray-800' }: { label: string; value: string | number; colorCls?: string }) => (
  <div className="flex justify-between items-center py-1 border-b border-gray-100 last:border-0">
    <span className="text-gray-500 text-sm">{label}</span>
    <span className={`font-semibold text-sm tabular-nums ${colorCls}`}>{value}</span>
  </div>
);

// ─── sub-views ─────────────────────────────────────────────────────────────

const InvoicesReport = ({
  data, userMap, page, pageSize, totalPages,
  onPageChange, onPageSizeChange,
}: any) => (
  <div className="space-y-5">
    <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
      🧾 <span>تقرير الفواتير</span>
    </h4>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard label="إجمالي الفواتير" value={data.total} accent="gray" />
      <StatCard label="مدفوعة" value={data.paid} accent="green" />
      <StatCard label="معلقة" value={data.pending} accent="amber" />
      <StatCard label="متأخرة" value={data.overdue} accent="red" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <SectionBox title="المبالغ المالية">
        <Row label="إجمالي" value={fmt(data.totalAmount)} />
        <Row label="المدفوع" value={fmt(data.paidAmount)} colorCls="text-emerald-700" />
        <Row label="المعلق" value={fmt(data.pendingAmount)} colorCls="text-amber-700" />
        <Row label="المتأخر" value={fmt(data.overdueAmount)} colorCls="text-red-700" />
      </SectionBox>

      <SectionBox title="نسب التحصيل">
        {[
          { label: 'نسبة التحصيل', val: data.paidAmount, cls: 'text-emerald-700' },
          { label: 'نسبة المعلق',  val: data.pendingAmount, cls: 'text-amber-700' },
          { label: 'نسبة المتأخر', val: data.overdueAmount, cls: 'text-red-700' },
        ].map((r) => (
          <Row
            key={r.label}
            label={r.label}
            value={`${data.totalAmount > 0 ? ((r.val / data.totalAmount) * 100).toFixed(1) : 0}%`}
            colorCls={r.cls}
          />
        ))}
      </SectionBox>
    </div>

    {/* قائمة الفواتير */}
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex items-center justify-between flex-wrap gap-3">
        <h5 className="font-semibold text-gray-700 text-sm">قائمة الفواتير</h5>
        <div className="flex items-center gap-2 text-sm">
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            {[10, 20, 50].map((n) => <option key={n} value={n}>{n} / صفحة</option>)}
          </select>
          <span className="text-gray-500">صفحة {page} من {totalPages}</span>
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="px-3 py-1 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            السابق
          </button>
          <button
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            التالي
          </button>
        </div>
      </div>
      <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
        {(data.data || []).map((invoice: any, i: number) => (
          <div
            key={invoice._id || i}
            className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${invoice.status === 'paid' ? 'bg-emerald-500' : invoice.status === 'pending' ? 'bg-amber-400' : 'bg-red-500'}`} />
              <div>
                <div className="font-semibold text-gray-800 text-sm">فاتورة #{invoice.invoiceNumber || invoice._id}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {userMap[invoice.userId]?.name || invoice.userId} • {new Date(invoice.createdAt).toLocaleDateString('ar-EG')}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="font-semibold text-gray-800 text-sm tabular-nums">{fmt(invoice.amount || 0)}</div>
              <StatusBadge status={invoice.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const PayrollsReport = ({ data, userMap }: any) => (
  <div className="space-y-5">
    <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
      🧑‍💼 <span>تقرير الرواتب</span>
    </h4>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard label="إجمالي السجلات" value={data.total} accent="gray" />
      <StatCard label="إجمالي المبلغ" value={fmt(data.totalAmount)} accent="green" />
      <StatCard label="إجمالي المكافآت" value={fmt(data.totalBonuses)} accent="blue" />
      <StatCard label="إجمالي الخصومات" value={fmt(data.totalDeductions)} accent="red" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <SectionBox title="تفاصيل الرواتب">
        <Row label="صافي الرواتب" value={fmt(data.netAmount)} colorCls="text-emerald-700" />
        <Row label="متوسط الراتب" value={fmt(data.total > 0 ? Math.round(data.totalAmount / data.total) : 0)} />
        <Row label="نسبة المكافآت" value={`${data.totalAmount > 0 ? ((data.totalBonuses / data.totalAmount) * 100).toFixed(1) : 0}%`} colorCls="text-blue-700" />
        <Row label="نسبة الخصومات" value={`${data.totalAmount > 0 ? ((data.totalDeductions / data.totalAmount) * 100).toFixed(1) : 0}%`} colorCls="text-red-700" />
      </SectionBox>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
          <h5 className="font-semibold text-gray-700 text-sm">آخر الرواتب</h5>
        </div>
        <div className="max-h-52 overflow-y-auto divide-y divide-gray-100">
          {data.data.slice(0, 5).map((p: any, i: number) => (
            <div key={p._id || i} className="flex justify-between items-center px-5 py-3 hover:bg-gray-50 transition-colors">
              <div>
                <div className="font-semibold text-sm text-gray-800">
                  {userMap[p.employeeId]?.name || p.employeeId || 'موظف'}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{new Date(p.paymentDate).toLocaleDateString('ar-EG')}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-sm text-gray-800 tabular-nums">{fmt(p.salaryAmount || 0)}</div>
                <div className="flex gap-2 justify-end mt-0.5">
                  {p.bonuses > 0 && <span className="text-xs text-emerald-600 font-medium">+{fmt(p.bonuses)}</span>}
                  {p.deductions > 0 && <span className="text-xs text-red-600 font-medium">-{fmt(p.deductions)}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const RevenuesReport = ({ data }: any) => (
  <div className="space-y-5">
    <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
      💹 <span>تقرير الإيرادات</span>
    </h4>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard label="إجمالي المعاملات" value={data.total} accent="gray" />
      <StatCard label="إجمالي الإيرادات" value={fmt(data.totalAmount)} accent="green" />
      <StatCard label="متوسط المعاملة" value={fmt(data.total > 0 ? Math.round(data.totalAmount / data.total) : 0)} accent="blue" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <SectionBox title="حسب المصدر">
        {Object.entries(data.bySource).map(([src, amt]: [string, any]) => (
          <Row key={src} label={src} value={fmt(amt)} colorCls="text-emerald-700" />
        ))}
      </SectionBox>
      <SectionBox title="حسب طريقة الدفع">
        {Object.entries(data.byPaymentMethod).map(([method, amt]: [string, any]) => (
          <Row key={method} label={method} value={fmt(amt)} colorCls="text-emerald-700" />
        ))}
      </SectionBox>
    </div>

    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
        <h5 className="font-semibold text-gray-700 text-sm">آخر الإيرادات</h5>
      </div>
      <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
        {data.data.slice(0, 10).map((r: any, i: number) => (
          <div key={r._id || i} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-emerald-500" />
              <div>
                <div className="font-semibold text-gray-800 text-sm">{r.notes || 'إيراد'}</div>
                <div className="text-xs text-gray-500 mt-0.5">{r.sourceType} • {new Date(r.date).toLocaleDateString('ar-EG')}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-emerald-700 text-sm tabular-nums">{fmt(r.amount || 0)}</div>
              <div className="text-xs text-gray-500 mt-0.5">{r.paymentMethod}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ExpensesReport = ({ data }: any) => (
  <div className="space-y-5">
    <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
      💸 <span>تقرير المصروفات</span>
    </h4>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard label="عدد المصروفات" value={data.total} accent="gray" />
      <StatCard label="إجمالي المبلغ" value={fmt(data.totalAmount)} accent="red" />
      <StatCard label="متوسط المصروف" value={fmt(data.total > 0 ? Math.round(data.totalAmount / data.total) : 0)} accent="amber" />
    </div>

    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
        <h5 className="font-semibold text-gray-700 text-sm">توزيع حسب الفئة</h5>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(data.byCategory).map(([cat, amt]: [string, any]) => (
            <div key={cat} className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
              <span className="text-gray-700 text-sm font-medium capitalize">{cat}</span>
              <span className="font-bold text-red-700 text-sm tabular-nums">{fmt(amt)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
        <h5 className="font-semibold text-gray-700 text-sm">آخر المصروفات</h5>
      </div>
      <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
        {data.data.slice(0, 10).map((e: any, i: number) => (
          <div key={e._id || i} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-red-500" />
              <div>
                <div className="font-semibold text-gray-800 text-sm">{e.description || 'مصروف'}</div>
                <div className="text-xs text-gray-500 mt-0.5">{e.category} • {new Date(e.date).toLocaleDateString('ar-EG')}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-red-700 text-sm tabular-nums">{fmt(e.amount || 0)}</div>
              <div className="text-xs text-gray-500 mt-0.5">{e.category}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const SummaryReport = ({ data }: any) => (
  <div className="space-y-5">
    <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
      📊 <span>التقرير المالي الشامل</span>
    </h4>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-6 bg-white rounded-xl border-t-4 border-emerald-500 shadow-sm">
        <div className="text-3xl font-bold text-emerald-700 tabular-nums">{fmt(data.totalRevenue)}</div>
        <div className="text-sm text-gray-500 mt-1 font-medium">إجمالي الإيرادات</div>
      </div>
      <div className="p-6 bg-white rounded-xl border-t-4 border-red-500 shadow-sm">
        <div className="text-3xl font-bold text-red-700 tabular-nums">{fmt(data.totalExpenses)}</div>
        <div className="text-sm text-gray-500 mt-1 font-medium">إجمالي المصروفات</div>
      </div>
      <div className={`p-6 bg-white rounded-xl border-t-4 shadow-sm ${data.netProfit >= 0 ? 'border-emerald-500' : 'border-red-500'}`}>
        <div className={`text-3xl font-bold tabular-nums ${data.netProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
          {fmt(data.netProfit)}
        </div>
        <div className="text-sm text-gray-500 mt-1 font-medium">صافي الربح</div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <SectionBox title="حالة الفواتير">
        <Row label="إجمالي الفواتير" value={fmt(data.totalInvoices)} />
        <Row label="المدفوع" value={fmt(data.paidInvoices)} colorCls="text-emerald-700" />
        <Row label="المعلق" value={fmt(data.pendingInvoices)} colorCls="text-amber-700" />
        <Row label="المتأخر" value={fmt(data.overdueInvoices)} colorCls="text-red-700" />
      </SectionBox>
      <SectionBox title="مؤشرات الأداء">
        <Row
          label="هامش الربح"
          value={`${data.profitMargin.toFixed(1)}%`}
          colorCls={data.profitMargin >= 0 ? 'text-emerald-700' : 'text-red-700'}
        />
        <Row
          label="نسبة التحصيل"
          value={`${data.totalInvoices > 0 ? ((data.paidInvoices / data.totalInvoices) * 100).toFixed(1) : 0}%`}
          colorCls="text-amber-700"
        />
        <Row
          label="نسبة المصروفات"
          value={`${data.totalRevenue > 0 ? ((data.totalExpenses / data.totalRevenue) * 100).toFixed(1) : 0}%`}
          colorCls="text-red-700"
        />
      </SectionBox>
    </div>

    <div className={`p-4 rounded-xl border ${data.netProfit >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
      <p className={`font-semibold text-sm ${data.netProfit >= 0 ? 'text-emerald-800' : 'text-red-800'}`}>
        {data.netProfit >= 0
          ? `✅ المؤسسة تحقق ربحاً إيجابياً بنسبة ${data.profitMargin.toFixed(1)}%`
          : `⚠️ المؤسسة تعاني من خسارة بقيمة ${fmt(Math.abs(data.netProfit))}`}
      </p>
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
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">التقارير المالية الشاملة</h3>
          <p className="text-sm text-gray-500 mt-0.5">استعرض وصدّر بيانات مالية مفصّلة</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            disabled={loading || !selectedReport}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <span>⬇</span>
            {loading ? 'جارِ التصدير...' : 'تصدير البيانات'}
          </button>
          <button
            onClick={loadReports}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg hover:bg-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <span>↻</span>
            {loading ? 'جارِ التحميل...' : 'تحديث التقارير'}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <span className="text-base">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {loading && !reportsData ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
          <span className="text-gray-500 text-sm">جارِ تحميل التقارير المالية...</span>
        </div>
      ) : reportsData ? (
        <div className="space-y-5">
          {/* Report Type Selector */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {REPORT_TYPES.map((r) => (
              <button
                key={r.id}
                onClick={() => { setSelectedReport(r.id); if (r.id === 'invoices') setInvoicesPage(1); }}
                className={`p-4 rounded-xl border-2 transition-all text-right ${
                  selectedReport === r.id
                    ? 'border-gray-800 bg-gray-800 text-white shadow-md'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="text-2xl mb-2">{r.icon}</div>
                <div className="font-semibold text-sm leading-tight">{r.label}</div>
              </button>
            ))}
          </div>

          {/* Report Content */}
          {selectedReport && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
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
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <div className="text-5xl">📊</div>
          <div>
            <p className="font-semibold text-gray-700">لا توجد بيانات بعد</p>
            <p className="text-sm text-gray-500 mt-1">اضغط على "تحديث التقارير" لعرض البيانات المالية</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsTab;