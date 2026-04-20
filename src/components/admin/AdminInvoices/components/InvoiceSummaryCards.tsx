import React, { useMemo } from "react";
import type { Invoice } from "@/services/invoiceService";
import type { InvoiceSummary } from "@/services/invoiceService";
import type { GetInvoicesFilters } from "@/services/invoiceService";

interface Props {
  summary: InvoiceSummary | null;
  count: number;
  invoices: Invoice[];
  filters: GetInvoicesFilters;
  fmt: (n: number) => string;
}

const InvoiceSummaryCards: React.FC<Props> = ({ summary, count, invoices, filters, fmt }) => {
  const derivedRange = useMemo(() => {
    const safeFormat = (d?: Date | null) =>
      d && !isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : "-";
    const fromStr = (filters.from || "").trim();
    const toStr = (filters.to || "").trim();
    if (fromStr || toStr) return { from: fromStr || "-", to: toStr || "-" };

    const issueDates = (invoices || [])
      .map((inv) => new Date(inv.issueDate as any))
      .filter((d) => !isNaN(d.getTime()));
    if (issueDates.length === 0) return { from: "-", to: "-" };

    const minD = new Date(Math.min(...issueDates.map((d) => d.getTime())));
    const maxD = new Date(Math.max(...issueDates.map((d) => d.getTime())));
    return { from: safeFormat(minD), to: safeFormat(maxD) };
  }, [filters.from, filters.to, invoices]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
        <div className="text-sm text-gray-500">إجمالي المبلغ</div>
        <div className="text-2xl font-semibold">ج.م{fmt(summary?.totals.amount || 0)}</div>
      </div>
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
        <div className="text-sm text-gray-500">النطاق الزمني</div>
        <div className="text-sm">{derivedRange.from} → {derivedRange.to}</div>
      </div>
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
        <div className="text-sm text-gray-500">عدد الفواتير</div>
        <div className="text-2xl font-semibold">{fmt(count)}</div>
      </div>
    </div>
  );
};

export default InvoiceSummaryCards;