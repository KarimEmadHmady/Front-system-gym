import { useState, useEffect, useMemo } from "react";
import { invoiceService, userService } from "@/services";
import type { Invoice, GetInvoicesFilters, InvoiceSummary } from "@/services/invoiceService";
import type { User } from "@/types/models";
import * as XLSX from "xlsx";
import type { InvoiceFormData, EditInvoiceFormData } from "../types";

const DEFAULT_FILTERS: GetInvoicesFilters = { sort: "desc", sortBy: "createdAt", limit: 20, skip: 0 };

const emptyForm = (): InvoiceFormData => ({
  userId: "",
  amount: 0,
  issueDate: new Date().toISOString().slice(0, 10),
  dueDate: "",
  status: "pending",
  items: [],
  notes: "",
  paidAmount: undefined,
});

export const useInvoices = (onSuccess: (t: string, m: string) => void, onError: (t: string, m: string) => void, onWarning: (t: string, m: string) => void) => {
  const [filters, setFilters] = useState<GetInvoicesFilters>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [count, setCount] = useState(0);
  const [summary, setSummary] = useState<InvoiceSummary | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // ── pagination ──────────────────────────────────────────────────────────────
  const pageSize = filters.limit || 20;
  const currentSkip = filters.skip || 0;
  const currentPage = Math.floor(currentSkip / pageSize) + 1;
  const totalPages = Math.max(1, Math.ceil((count || 0) / pageSize));
  const rangeStart = count > 0 ? currentSkip + 1 : 0;
  const rangeEnd = Math.min(currentSkip + pageSize, count || 0);
  const canPaginate = {
    next: currentSkip + pageSize < count,
    prev: currentSkip > 0,
  };

  // ── derived ─────────────────────────────────────────────────────────────────
  const userMap = useMemo(() => {
    const map: Record<string, User> = {};
    users.forEach((u) => { map[u._id] = u; });
    return map;
  }, [users]);

  const fmt = (n: number) => new Intl.NumberFormat().format(n || 0);

  const normalizeResponse = (raw: any): { count: number; results: Invoice[] } => {
    if (!raw) return { count: 0, results: [] };
    if (Array.isArray(raw)) return { count: raw.length, results: raw };
    if (Array.isArray(raw.results)) return { count: Number(raw.count ?? raw.results.length ?? 0), results: raw.results };
    if (Array.isArray(raw.data) && raw.pagination) return { count: Number(raw.pagination.total ?? raw.data.length ?? 0), results: raw.data };
    if (Array.isArray(raw.data)) return { count: raw.data.length, results: raw.data };
    return { count: 0, results: [] };
  };

  // ── fetch ────────────────────────────────────────────────────────────────────
  const fetchData = async (overrideFilters?: GetInvoicesFilters) => {
    setLoading(true);
    try {
      const base = overrideFilters || filters;
      const effectiveFilters: GetInvoicesFilters = {
        ...base,
        from: base.from || undefined,
        to: base.to || undefined,
      };
      const raw = await invoiceService.getInvoices(effectiveFilters);
      const res = normalizeResponse(raw);
      setInvoices(res.results || []);
      setCount(res.count || 0);
      const sum = await invoiceService.getInvoiceSummary({
        from: effectiveFilters.from,
        to: effectiveFilters.to,
        userId: effectiveFilters.userId,
        status: effectiveFilters.status as any,
        sort: effectiveFilters.sort,
      });
      setSummary(sum);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters.userId, filters.status, filters.from, filters.to, filters.sort, filters.sortBy, filters.limit, filters.skip, filters.invoiceNumber]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    (async () => {
      try {
        const res = await userService.getUsers({ page: 1, limit: 200, sortBy: "name", sortOrder: "asc" } as any);
        const list: User[] = Array.isArray(res) ? res : Array.isArray((res as any)?.data) ? (res as any).data : Array.isArray((res as any)?.results) ? (res as any).results : [];
        setUsers(list);
      } catch (e) {
        console.error("Error fetching users:", e);
      }
    })();
  }, []);

  // ── filter change ────────────────────────────────────────────────────────────
  const onChangeFilter = (k: keyof GetInvoicesFilters, v: any) => {
    setFilters((prev) => {
      const newFilters = k === "from" ? { ...prev, from: v, skip: 0 } :
                         k === "to" ? { ...prev, to: v, skip: 0 } :
                         { ...prev, [k]: v, skip: 0 };
      return newFilters;
    });
  };

  const goNextPage = () => setFilters((p) => ({ ...p, skip: (p.skip || 0) + (p.limit || 20) }));
  const goPrevPage = () => setFilters((p) => ({ ...p, skip: Math.max((p.skip || 0) - (p.limit || 20), 0) }));

  // ── create ───────────────────────────────────────────────────────────────────
  const createInvoice = async (form: InvoiceFormData) => {
    if (!form.userId) { onWarning("تحقق من البيانات", "يرجى اختيار المستخدم"); return false; }
    const computedAmount = form.items.reduce((s, it) => s + (Number(it.quantity) || 0) * (Number(it.price) || 0), 0);
    const finalAmount = form.items.length > 0 ? computedAmount : Number(form.amount) || 0;
    if (finalAmount <= 0) { onWarning("تحقق من البيانات", "يرجى إدخال مبلغ صحيح أو إضافة عناصر للفاتورة"); return false; }

    try {
        setCreating(true);
        await invoiceService.createInvoice({
            userId: form.userId, amount: finalAmount,
            issueDate: form.issueDate, dueDate: form.dueDate || undefined,
            status: form.status || "pending", items: form.items || [],
            notes: form.notes || "",
            invoiceNumber: `INV-${Date.now()}`,
        });
      const nextFilters: GetInvoicesFilters = { ...filters, skip: 0, sort: "desc" };
      setFilters(nextFilters);
      await fetchData(nextFilters);
      onSuccess("تم بنجاح", "تم إنشاء الفاتورة وتحديث القائمة");
      return true;
    } catch (e: any) {
      const message = e?.message || e?.error || e?.data?.message || e?.response?.data?.message || "حدث خطأ أثناء إنشاء الفاتورة";
      onError("خطأ", String(message));
      return false;
    } finally {
      setCreating(false);
    }
  };

  // ── update ───────────────────────────────────────────────────────────────────
  const updateInvoice = async (form: EditInvoiceFormData) => {
    if (!form._id) return false;
    try {
      setUpdatingId(form._id);
      await invoiceService.updateInvoice(form._id, {
        userId: form.userId, amount: Number(form.amount) || 0,
        issueDate: form.issueDate, dueDate: form.dueDate || undefined,
        status: form.status, items: form.items || [],
        notes: form.notes || "",
        paidAmount: typeof form.paidAmount === "number" ? form.paidAmount : undefined,
      });
      await fetchData();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    } finally {
      setUpdatingId(null);
    }
  };

  // ── mark paid ────────────────────────────────────────────────────────────────
  const markPaid = async (id: string) => {
    try {
      setUpdatingId(id);
      await invoiceService.updateInvoice(id, { status: "paid" });
      await fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  // ── delete ───────────────────────────────────────────────────────────────────
  const deleteInvoice = async (id: string) => {
    try {
      setUpdatingId(id);
      await invoiceService.deleteInvoice(id);
      await fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  // ── export ───────────────────────────────────────────────────────────────────
  const exportToExcel = () => {
    try {
      const data = invoices.map((inv) => {
        const user = userMap[inv.userId];
        return {
          "رقم الفاتورة": inv.invoiceNumber || "",
          "العميل": user?.name || inv.userId || "غير محدد",
          "هاتف العميل": user?.phone || "غير محدد",
          "بريد العميل": user?.email || "غير محدد",
          "المبلغ الإجمالي (ج.م)": inv.amount || 0,
          "المبلغ المدفوع (ج.م)": inv.paidAmount || 0,
          "المبلغ المتبقي (ج.م)": (inv.amount || 0) - (inv.paidAmount || 0),
          "تاريخ الإصدار": inv.issueDate ? new Date(inv.issueDate).toLocaleDateString("ar-EG") : "",
          "تاريخ الاستحقاق": inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("ar-EG") : "",
          "الحالة": inv.status === "paid" ? "مدفوعة" : inv.status === "overdue" ? "متأخرة" : "قيد الانتظار",
          "عدد العناصر": inv.items?.length || 0,
          "تفاصيل العناصر": inv.items?.map((it) => `${it.description} (${it.quantity} × ${it.price} = ${it.quantity * it.price})`).join(" | ") || "",
          "الملاحظات": inv.notes || "",
          "تاريخ الإنشاء": inv.createdAt ? new Date(inv.createdAt).toLocaleDateString("ar-EG") : "",
          "آخر تعديل": inv.updatedAt ? new Date(inv.updatedAt).toLocaleDateString("ar-EG") : "",
        };
      });

      const ws = XLSX.utils.json_to_sheet(data);
      ws["!cols"] = [15, 20, 15, 25, 15, 15, 15, 15, 15, 12, 12, 50, 30, 15, 15].map((wch) => ({ wch }));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "الفواتير");
      XLSX.writeFile(wb, `الفواتير_${new Date().toLocaleDateString("ar-EG").replace(/\//g, "-")}.xlsx`);
      onSuccess("تم التصدير بنجاح", `تم تصدير ${data.length} فاتورة بنجاح`);
    } catch (e) {
      console.error(e);
      onError("خطأ في التصدير", "حدث خطأ أثناء تصدير الفواتير");
    }
  };

  return {
    // state
    filters, loading, invoices, count, summary, users, userMap,
    updatingId, creating, fmt,
    // pagination
    currentPage, totalPages, rangeStart, rangeEnd, canPaginate,
    // actions
    fetchData, onChangeFilter, goNextPage, goPrevPage,
    createInvoice, updateInvoice, markPaid, deleteInvoice, exportToExcel,
    emptyForm,
  };
};