

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { invoiceService, userService } from "@/services";
import type { Invoice, GetInvoicesFilters, InvoiceSummary } from "@/services/invoiceService";
import type { User } from "@/types/models";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import * as XLSX from 'xlsx';
import CustomAlert from '@/components/ui/CustomAlert';
import { useCustomAlert } from '@/hooks/useCustomAlert';
import { GymSettingsService } from '@/services/gymSettingsService';

type CreateInvoiceItem = { description: string; quantity: number; price: number };
type CreateInvoiceForm = {
  userId: string;
  amount: number;
  issueDate: string;
  dueDate?: string;
  status: "paid" | "pending" | "overdue";
  items: CreateInvoiceItem[];
  notes?: string;
  paidAmount?: number;
};

const defaultFilters: GetInvoicesFilters = {
  sort: "desc",
  limit: 20,
  skip: 0,
};

const AdminInvoices: React.FC = () => {
  const { alertState, showSuccess, showError, showWarning, hideAlert } = useCustomAlert();
  const [filters, setFilters] = useState<GetInvoicesFilters>(defaultFilters);
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [count, setCount] = useState<number>(0);
  const [summary, setSummary] = useState<InvoiceSummary | null>(null);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState<CreateInvoiceForm>({
    userId: "",
    amount: 0,
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: "",
    status: "pending",
    items: [],
    notes: "",
    paidAmount: undefined,
  });
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState<string>("");
  const [itemsModalOpen, setItemsModalOpen] = useState(false);
  const [tempItems, setTempItems] = useState<CreateInvoiceItem[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [itemsContext, setItemsContext] = useState<"create" | "edit">("create");
  const [editForm, setEditForm] = useState<CreateInvoiceForm & { _id?: string }>({
    _id: undefined,
    userId: "",
    amount: 0,
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: "",
    status: "pending",
    items: [],
    notes: "",
    paidAmount: undefined,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState('');
  const [gymName, setGymName] = useState('');

  const canPaginate = useMemo(() => {
    return {
      next: (filters.skip || 0) + (filters.limit || 20) < count,
      prev: (filters.skip || 0) > 0,
    };
  }, [filters.skip, filters.limit, count]);

  // حسابات الصفحة والنطاق للعرض
  const pageSize = filters.limit || 20;
  const currentSkip = filters.skip || 0;
  const currentPage = Math.floor(currentSkip / pageSize) + 1;
  const totalPages = Math.max(1, Math.ceil((count || 0) / pageSize));
  const rangeStart = count > 0 ? currentSkip + 1 : 0;
  const rangeEnd = Math.min(currentSkip + pageSize, count || 0);

  // خريطة userId => بيانات العضو
  const userMap = useMemo(() => {
    const map: Record<string, User> = {};
    users.forEach(u => { map[u._id] = u; });
    return map;
  }, [users]);

  const normalizeInvoicesListResponse = (raw: any): { count: number; results: Invoice[] } => {
    if (!raw) return { count: 0, results: [] };
    if (Array.isArray(raw)) return { count: raw.length, results: raw as Invoice[] };
    if (Array.isArray(raw.results)) return { count: Number(raw.count ?? raw.results.length ?? 0), results: raw.results as Invoice[] };
    if (Array.isArray(raw.data) && raw.pagination) {
      const count = Number(raw.pagination.total ?? raw.data.length ?? 0);
      return { count, results: raw.data as Invoice[] };
    }
    if (Array.isArray(raw.data)) return { count: raw.data.length, results: raw.data as Invoice[] };
    return { count: 0, results: [] };
  };

  const fetchData = async (overrideFilters?: GetInvoicesFilters) => {
    setLoading(true);
    try {
      const base = overrideFilters || filters;
      // If only one date is selected, treat it as an exact day filter.
      const effectiveFilters: GetInvoicesFilters = {
        ...base,
        from: (base.from || base.to) || undefined,
        to: (base.to || base.from) || undefined,
      };

      const raw = await invoiceService.getInvoices(effectiveFilters);
      const res = normalizeInvoicesListResponse(raw);
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
      // noop UI toast placeholder
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.userId, filters.status, filters.from, filters.to, filters.sort, filters.limit, filters.skip]);

  useEffect(() => {
    // تحميل المستخدمين لسيليكتور الفواتير
    (async () => {
      try {
        const res = await userService.getUsers({ page: 1, limit: 200, sortBy: 'name', sortOrder: 'asc' } as any);
        const usersList: User[] =
          Array.isArray(res)
            ? (res as any)
            : Array.isArray((res as any)?.data)
              ? (res as any).data
              : Array.isArray((res as any)?.results)
                ? (res as any).results
                : [];

        setUsers(usersList);
      } catch (e) {
        console.error('Error fetching users:', e);
        setUsers([]);
      }
    })();
  }, []);

  useEffect(() => {
    const gymSettingsService = new GymSettingsService();
    gymSettingsService.get().then((settings) => {
      setLogoUrl(settings?.logoUrl || '');
      setGymName(settings?.gymName || '');
    });
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!createForm.userId) {
        showWarning("تحقق من البيانات", "يرجى اختيار المستخدم");
        return;
      }

      const computedAmount = (createForm.items || []).reduce(
        (sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.price) || 0),
        0
      );
      const finalAmount = createForm.items && createForm.items.length > 0 ? computedAmount : Number(createForm.amount) || 0;
      if (finalAmount <= 0) {
        showWarning("تحقق من البيانات", "يرجى إدخال مبلغ صحيح أو إضافة عناصر للفاتورة");
        return;
      }

      setCreating(true);
      const payload: any = {
        userId: createForm.userId,
        amount: finalAmount,
        issueDate: createForm.issueDate,
        dueDate: createForm.dueDate || undefined,
        status: createForm.status || "pending",
        items: createForm.items || [],
        notes: createForm.notes || "",
        paidAmount: typeof createForm.paidAmount === "number" ? createForm.paidAmount : undefined,
      };
      await invoiceService.createInvoice(payload);
      setCreateForm({
        userId: "",
        amount: 0,
        issueDate: new Date().toISOString().slice(0, 10),
        dueDate: "",
        status: "pending",
        items: [],
        notes: "",
        paidAmount: undefined,
      });
      // After create: jump to first page (newest) + refresh + close modal
      const nextFilters: GetInvoicesFilters = { ...filters, skip: 0, sort: "desc" };
      setFilters(nextFilters);
      await fetchData(nextFilters);
      closeCreateModal();
      showSuccess("تم بنجاح", "تم إنشاء الفاتورة وتحديث القائمة");
    } catch (e) {
      console.error(e);
      const err: any = e;
      const message =
        err?.message ||
        err?.error ||
        err?.data?.message ||
        err?.response?.data?.message ||
        "حدث خطأ أثناء إنشاء الفاتورة";
      showError("خطأ", String(message));
    } finally {
      setCreating(false);
    }
  };

  const openItemsModal = () => {
    if (itemsContext === "edit") {
      setTempItems([...(editForm.items || [])]);
    } else {
      setTempItems([...createForm.items]);
    }
    setItemsModalOpen(true);
  };

  const closeItemsModal = () => {
    setItemsModalOpen(false);
    setTempItems([]);
  };

  const confirmItems = () => {
    if (itemsContext === "edit") {
      const computedAmount = tempItems.reduce(
        (sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.price) || 0),
        0
      );
      setEditForm((prev) => ({ ...prev, items: tempItems, amount: computedAmount }));
    } else {
      const computedAmount = tempItems.reduce(
        (sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.price) || 0),
        0
      );
      setCreateForm((prev) => ({ ...prev, items: tempItems, amount: computedAmount }));
    }
    closeItemsModal();
  };

  const addItem = () => {
    setTempItems(prev => [...prev, { description: "", quantity: 1, price: 0 }]);
  };

  const removeItem = (index: number) => {
    setTempItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof CreateInvoiceItem, value: string | number) => {
    setTempItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const itemsTotal = tempItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  const openViewModal = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setViewModalOpen(true);
  };

  const closeViewModal = () => {
    setViewModalOpen(false);
    setSelectedInvoice(null);
  };

  const handleDeleteInvoice = async (id: string) => {
    setDeleteTargetId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteInvoice = async () => {
    if (!deleteTargetId) return;
    try {
      setUpdatingId(deleteTargetId);
      closeViewModal(); // أغلق نافذة التفاصيل أولاً
      await invoiceService.deleteInvoice(deleteTargetId);
      await fetchData(); // ثم جلب البيانات الجديدة
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
      setDeleteDialogOpen(false);
      setDeleteTargetId(null);
    }
  };

  const openEditModal = (inv: Invoice) => {
    setEditForm({
      _id: inv._id,
      userId: inv.userId,
      amount: inv.amount,
      issueDate: String(inv.issueDate).slice(0, 10),
      dueDate: inv.dueDate ? String(inv.dueDate).slice(0, 10) : "",
      status: inv.status,
      items: inv.items || [],
      notes: inv.notes || "",
      paidAmount: typeof inv.paidAmount === "number" ? inv.paidAmount : undefined,
    });
    setItemsContext("edit");
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setItemsContext("create");
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm._id) return;
    try {
      setUpdatingId(editForm._id);
      const payload: any = {
        userId: editForm.userId,
        amount: Number(editForm.amount) || 0,
        issueDate: editForm.issueDate,
        dueDate: editForm.dueDate || undefined,
        status: editForm.status,
        items: editForm.items || [],
        notes: editForm.notes || "",
        paidAmount: typeof editForm.paidAmount === "number" ? editForm.paidAmount : undefined,
      };
      await invoiceService.updateInvoice(editForm._id, payload);
      await fetchData();
      closeEditModal();
      closeViewModal();
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  const printInvoice = (inv: Invoice) => {
    const user = userMap[inv.userId];
    const win = window.open('', '_blank');
    if (!win) return;
    const itemsHtml = (inv.items || [])
      .map((it) =>
        `<tr>
          <td class="desc">${it.description || '-'}</td>
          <td class="qty">${it.quantity || 0}</td>
          <td class="price">${it.price || 0}</td>
          <td class="total">${(it.quantity || 0) * (it.price || 0)}</td>
        </tr>`
      )
      .join('');

    const fmtMoney = (n: any) => {
      const num = Number(n || 0);
      try { return new Intl.NumberFormat('ar-EG').format(num); } catch { return String(num); }
    };
    const paid = typeof (inv as any).paidAmount === 'number' ? Number((inv as any).paidAmount) : 0;
    const total = Number((inv as any).amount || 0);
    const remaining = Math.max(0, total - paid);
    const issue = inv.issueDate ? String(inv.issueDate).slice(0, 10) : '-';
    const due = inv.dueDate ? String(inv.dueDate).slice(0, 10) : '-';

    win.document.write(`
      <html>
        <head>
          <meta charset="utf-8" />
          <title>فاتورة ${inv.invoiceNumber}</title>
          <style>
            :root { --paper: 80mm; --pad: 10px; --fg: #111; --muted: #555; }
            @page { size: var(--paper) auto; margin: 0; }
            * { box-sizing: border-box; }
            body {
              margin: 0;
              padding: 0;
              direction: rtl;
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", Tahoma, Arial, sans-serif;
              color: var(--fg);
              background: #fff;
            }
            .receipt {
              width: var(--paper);
              margin: 0 auto;
              padding: var(--pad);
              font-size: 12px;
              line-height: 1.35;
            }
            .center { text-align: center; }
            .muted { color: var(--muted); }
            .sep {
              border: 0;
              border-top: 1px dashed #777;
              margin: 10px 0;
            }
            .logo img { max-width: 52px; max-height: 52px; display: block; margin: 0 auto 6px auto; }
            .gym { font-weight: 800; font-size: 14px; }
            .title { font-weight: 900; font-size: 13px; margin-top: 4px; }
            .meta { display: grid; gap: 4px; margin-top: 8px; }
            .row { display: flex; justify-content: space-between; gap: 8px; }
            .row b { font-weight: 700; }
            .kv { display: flex; gap: 6px; align-items: baseline; }
            .kv .k { min-width: 64px; color: var(--muted); }
            table { width: 100%; border-collapse: collapse; }
            thead th {
              text-align: right;
              font-weight: 800;
              padding: 6px 0;
              border-bottom: 1px solid #333;
            }
            tbody td {
              padding: 6px 0;
              border-bottom: 1px dashed #bbb;
              vertical-align: top;
            }
            td.qty, td.price, td.total { white-space: nowrap; text-align: left; direction: ltr; }
            td.desc { width: 100%; }
            .totals { margin-top: 8px; display: grid; gap: 6px; }
            .big {
              font-size: 14px;
              font-weight: 900;
              display: flex;
              justify-content: space-between;
              direction: ltr;
            }
            .big span { direction: rtl; }
            .thanks { margin-top: 10px; }
            @media print {
              .receipt { width: var(--paper); }
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="center logo">
              ${logoUrl ? `<img src='${logoUrl}' alt='شعار' />` : ""}
              <div class="gym">${gymName || 'Gym'}</div>
              <div class="title">إيصال (فاتورة)</div>
            </div>

            <hr class="sep" />

            <div class="meta">
              <div class="row">
                <div class="kv"><span class="k">رقم</span><b>${inv.invoiceNumber || inv._id || '-'}</b></div>
                <div class="kv"><span class="k">الحالة</span><b>${inv.status === "paid" ? "مدفوعة" : inv.status === "overdue" ? "متأخرة" : "قيد الانتظار"}</b></div>
              </div>
              <div class="row">
                <div class="kv"><span class="k">الإصدار</span><span>${issue}</span></div>
                <div class="kv"><span class="k">الاستحقاق</span><span>${due}</span></div>
              </div>
            </div>

            <hr class="sep" />

            <div class="meta">
              <div class="kv"><span class="k">العميل</span><b>${user?.name || inv.userId || '-'}</b></div>
              <div class="kv"><span class="k">الهاتف</span><span>${user?.phone || '-'}</span></div>
            </div>

            <hr class="sep" />

            <table>
              <thead>
                <tr>
                  <th>الصنف</th>
                  <th style="text-align:left; direction:ltr;">Qty</th>
                  <th style="text-align:left; direction:ltr;">Price</th>
                  <th style="text-align:left; direction:ltr;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml || `<tr><td colspan='4' class='center muted' style='padding:10px 0;border-bottom:0'>لا توجد عناصر</td></tr>`}
              </tbody>
            </table>

            <div class="totals">
              <div class="row"><span class="muted">الإجمالي</span><b>${fmtMoney(total)} ج.م</b></div>
              <div class="row"><span class="muted">المدفوع</span><b>${fmtMoney(paid)} ج.م</b></div>
              <div class="row"><span class="muted">المتبقي</span><b>${fmtMoney(remaining)} ج.م</b></div>
              <hr class="sep" />
              <div class="big"><span>صافي المطلوب</span><span>${fmtMoney(remaining)} ج.م</span></div>
            </div>

            ${inv.notes ? `<hr class="sep" /><div class="meta"><div class="kv"><span class="k">ملاحظات</span><span>${String(inv.notes)}</span></div></div>` : ''}

            <hr class="sep" />
            <div class="center muted thanks">
              شكراً لزيارتكم
              <div style="margin-top:6px">${new Date().toLocaleString('ar-EG')}</div>
            </div>
          </div>

          <script>
            setTimeout(function () {
              try { window.focus(); } catch (e) {}
              window.print();
              window.close();
            }, 250);
          </script>
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
  };

  const openCreateModal = () => {
    setCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setCreateModalOpen(false);
    setCreateForm({
      userId: "",
      amount: 0,
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: "",
      status: "pending",
      items: [],
      notes: "",
      paidAmount: undefined,
    });
  };

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

  const onChangeFilter = (k: keyof GetInvoicesFilters, v: any) => {
    setFilters((prev) => {
      // If selecting only one date, mirror it to the other end (exact-day filter UX)
      if (k === "from") {
        const nextFrom = v;
        const nextTo = (prev.to || "") ? prev.to : v;
        return { ...prev, from: nextFrom, to: nextTo, skip: 0 };
      }
      if (k === "to") {
        const nextTo = v;
        const nextFrom = (prev.from || "") ? prev.from : v;
        return { ...prev, from: nextFrom, to: nextTo, skip: 0 };
      }
      return { ...prev, [k]: v, skip: 0 };
    });
  };

  // دالة تصدير الفواتير إلى Excel
  const exportInvoicesToExcel = () => {
    try {
      const exportData = invoices.map(invoice => {
        const user = userMap[invoice.userId];
        return {
          'رقم الفاتورة': invoice.invoiceNumber || '',
          'العميل': user?.name || invoice.userId || 'غير محدد',
          'هاتف العميل': user?.phone || 'غير محدد',
          'بريد العميل': user?.email || 'غير محدد',
          'المبلغ الإجمالي (ج.م)': invoice.amount || 0,
          'المبلغ المدفوع (ج.م)': invoice.paidAmount || 0,
          'المبلغ المتبقي (ج.م)': (invoice.amount || 0) - (invoice.paidAmount || 0),
          'تاريخ الإصدار': invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString('ar-EG') : '',
          'تاريخ الاستحقاق': invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('ar-EG') : '',
          'الحالة': invoice.status === 'paid' ? 'مدفوعة' : invoice.status === 'overdue' ? 'متأخرة' : 'قيد الانتظار',
          'عدد العناصر': invoice.items?.length || 0,
          'تفاصيل العناصر': invoice.items?.map(item => 
            `${item.description} (${item.quantity} × ${item.price} = ${item.quantity * item.price})`
          ).join(' | ') || '',
          'الملاحظات': invoice.notes || '',
          'تاريخ الإنشاء': invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString('ar-EG') : '',
          'آخر تعديل': invoice.updatedAt ? new Date(invoice.updatedAt).toLocaleDateString('ar-EG') : '',
        };
      });

      // إنشاء ورقة عمل
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      // إنشاء كتاب عمل
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'الفواتير');

      // تحديد عرض الأعمدة
      const columnWidths = [
        { wch: 15 }, // رقم الفاتورة
        { wch: 20 }, // العميل
        { wch: 15 }, // هاتف العميل
        { wch: 25 }, // بريد العميل
        { wch: 15 }, // المبلغ الإجمالي
        { wch: 15 }, // المبلغ المدفوع
        { wch: 15 }, // المبلغ المتبقي
        { wch: 15 }, // تاريخ الإصدار
        { wch: 15 }, // تاريخ الاستحقاق
        { wch: 12 }, // الحالة
        { wch: 12 }, // عدد العناصر
        { wch: 50 }, // تفاصيل العناصر
        { wch: 30 }, // الملاحظات
        { wch: 15 }, // تاريخ الإنشاء
        { wch: 15 }, // آخر تعديل
      ];
      worksheet['!cols'] = columnWidths;

      // تصدير الملف
      const fileName = `الفواتير_${new Date().toLocaleDateString('ar-EG').replace(/\//g, '-')}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      showSuccess('تم التصدير بنجاح', `تم تصدير ${exportData.length} فاتورة بنجاح`);
    } catch (error) {
      console.error('خطأ في تصدير الفواتير:', error);
      showError('خطأ في التصدير', 'حدث خطأ أثناء تصدير الفواتير');
    }
  };

  const fmt = (n: number) => new Intl.NumberFormat().format(n || 0);
  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phone && u.phone.toLowerCase().includes(q)) ||
        (u._id && u._id.toLowerCase().includes(q))
    );
  }, [users, userSearch]);

  // نطاق زمني مشتق من الفلاتر أو من بيانات الفواتير (مطابق لسلوك المنجر)
  const derivedRange = useMemo(() => {
    const safeFormat = (d?: Date | null) => (d && !isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : '-');
    const fromStr = (filters.from || '').trim();
    const toStr = (filters.to || '').trim();
    if (fromStr || toStr) {
      return { from: fromStr || '-', to: toStr || '-' };
    }
    const issueDates = (invoices || [])
      .map((inv) => new Date(inv.issueDate as any))
      .filter((d) => !isNaN(d.getTime()));
    if (issueDates.length === 0) return { from: '-', to: '-' };
    const minD = new Date(Math.min(...issueDates.map((d) => d.getTime())));
    const maxD = new Date(Math.max(...issueDates.map((d) => d.getTime())));
    return { from: safeFormat(minD), to: safeFormat(maxD) };
  }, [filters.from, filters.to, invoices]);

  return (
    <div className="space-y-6">
      {/* المرشحات */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">
              المستخدم ({users.length} مستخدم)
            </label>
            <select
              className="px-1.5  py-0.5 rounded border dark:bg-gray-900 text-xs w-full h-8  min-w-[110px] sm:max-w-[160px] w-full"
              value={filters.userId || ""}
              onChange={(e) => onChangeFilter("userId", e.target.value)}
            >
              <option value="">الكل</option>
              {filteredUsers.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.email}){u.phone ? ` - ${u.phone}` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">بحث عن مستخدم</label>
            <input
              className="px-1.5 py-0.5 rounded border dark:bg-gray-900 text-xs w-full h-8 min-w-[110px] sm:max-w-[160px] w-full"
              placeholder="اكتب اسم/بريد/ID للبحث"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">بحث برقم الفاتورة</label>
            <input
              className="px-1.5 py-0.5 rounded border dark:bg-gray-900 text-xs w-full h-8 min-w-[110px] sm:max-w-[160px] w-full"
              placeholder="مثال: INV-1001"
              value={filters.invoiceNumber || ""}
              onChange={(e) => onChangeFilter("invoiceNumber", e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">الحالة</label>
            <select
              className="px-1.5 py-0.5 rounded border dark:bg-gray-900 text-xs w-full h-8 min-w-[110px] sm:max-w-[160px] w-full"
              value={filters.status || ""}
              onChange={(e) => onChangeFilter("status", e.target.value as any)}
            >
              <option value="">الكل</option>
              <option value="pending">قيد الانتظار</option>
              <option value="paid">مدفوعة</option>
              <option value="overdue">متأخرة</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">من تاريخ</label>
            <input
              type="date"
              className="px-1.5 py-0.5 rounded border dark:bg-gray-900 text-xs w-full h-8 min-w-[110px] sm:max-w-[160px] w-full cursor-pointer"
              value={filters.from || ""}
              onChange={(e) => onChangeFilter("from", e.target.value)}
              onClick={(e) => (e.currentTarget as HTMLInputElement).showPicker?.()}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">إلى تاريخ</label>
            <input
              type="date"
              className="px-1.5 py-0.5 rounded border dark:bg-gray-900 text-xs w-full h-8 min-w-[110px] sm:max-w-[160px] w-full cursor-pointer"
              value={filters.to || ""}
              onChange={(e) => onChangeFilter("to", e.target.value)}
              onClick={(e) => (e.currentTarget as HTMLInputElement).showPicker?.()}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">الترتيب</label>
            <select
              className="px-1.5 py-0.5 rounded border dark:bg-gray-900 text-xs w-full h-8 min-w-[110px] sm:max-w-[160px] w-full"
              value={filters.sort || "desc"}
              onChange={(e) => onChangeFilter("sort", e.target.value as any)}
            >
              <option value="desc">الأحدث</option>
              <option value="asc">الأقدم</option>
            </select>
          </div>
          <div className="flex items-end space-x-2">
            <button
              onClick={exportInvoicesToExcel}
              disabled={invoices.length === 0}
              className="px-1.5 py-0.5 rounded bg-green-600 text-white text-xs h-8 min-w-[110px] max-w-[160px] disabled:opacity-50"
            >
              تصدير البيانات
            </button>
            <button
              className="w-full px-1.5 py-0.5 rounded bg-gray-600 text-white text-xs h-8 min-w-[110px] max-w-[160px]"
              onClick={() => fetchData()}
            >
              {loading ? "جارِ التحميل..." : "تحديث"}
            </button>
          </div>
        </div>
      </div>

      {/* الملخص */}
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

      {/* زر إنشاء فاتورة */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex justify-center">
          <button
            onClick={openCreateModal}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-lg"
          >
            إنشاء فاتورة جديدة
          </button>
        </div>
      </div>

      {/* جدول الفواتير */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-auto">
        <table className="min-w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-2 text-center">رقم الفاتورة</th>
              <th className="px-4 py-2 text-center">المستخدم</th>
              <th className="px-4 py-2 text-center">المبلغ</th>
              <th className="px-4 py-2 text-center">تاريخ الإصدار</th>
              <th className="px-4 py-2 text-center">تاريخ الاستحقاق</th>
              <th className="px-4 py-2 text-center">الحالة</th>
              <th className="px-4 py-2 text-right">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => {
              const user = userMap[inv.userId];
              return (
                <tr key={inv._id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-2 font-medium text-center">{inv.invoiceNumber}</td>
                  <td className="px-4 py-2 text-sm text-center">
                    {user ? (
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs">
                          {user.phone ? `📞 ${user.phone}` : '📞 لا يوجد رقم هاتف'}
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-400 dark:text-gray-500">
                        <div>مستخدم غير موجود</div>
                        <div className="text-xs">ID: {inv.userId}</div>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2 text-center">ج.م{fmt(inv.amount)}</td>
                  <td className="px-4 py-2 text-sm text-center">{String(inv.issueDate).slice(0, 10)}</td>
                  <td className="px-4 py-2 text-sm text-center">{inv.dueDate ? String(inv.dueDate).slice(0, 10) : '-'}</td>
                <td className="px-4 py-2 text-center">
                  <span
                    className={
                      inv.status === "paid"
                        ? "text-green-600"
                        : inv.status === "overdue"
                        ? "text-red-600"
                        : "text-gray-600"
                    }
                  >
                    {inv.status === 'paid' ? 'مدفوعة' : inv.status === 'overdue' ? 'متأخرة' : 'قيد الانتظار'}
                  </span>
                </td>
                <td className="px-4 py-2 text-right space-x-2">
                  <button
                    className="px-3 py-1 rounded bg-gray-600 text-white text-sm"
                    onClick={() => openViewModal(inv)}
                  >
                    عرض
                  </button>
                  {inv.status !== "paid" && (
                    <button
                      className="px-3 py-1 rounded bg-green-600 text-white text-sm disabled:opacity-60"
                      onClick={() => markPaid(inv._id)}
                      disabled={updatingId === inv._id}
                    >
                      {updatingId === inv._id ? "جارِ الحفظ..." : "تحديد كمدفوعة"}
                    </button>
                  )}
                </td>
                </tr>
              );
            })}
            {invoices.length === 0 && !loading && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                  لا توجد فواتير
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* التصفح */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-700 dark:text-gray-300">
        <div>
          عرض {rangeStart} إلى {rangeEnd} من {fmt(count)} نتيجة • صفحة {currentPage} من {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1 rounded border dark:border-gray-700 disabled:opacity-50"
            disabled={!canPaginate.prev}
            onClick={() =>
              setFilters((p) => ({
                ...p,
                skip: Math.max((p.skip || 0) - (p.limit || 20), 0),
              }))
            }
          >
            السابق
          </button>
          <button
            className="px-3 py-1 rounded border dark:border-gray-700 disabled:opacity-50"
            disabled={!canPaginate.next}
            onClick={() =>
              setFilters((p) => ({
                ...p,
                skip: (p.skip || 0) + (p.limit || 20),
              }))
            }
          >
            التالي
          </button>
        </div>
      </div>

      {/* Modal إنشاء فاتورة */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full mx-4 p-6 relative animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">إنشاء فاتورة جديدة</h2>
              <button 
                onClick={closeCreateModal} 
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                    المستخدم ({users.length} مستخدم)
                  </label>
                  <select
                    className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600"
                    value={createForm.userId || ""}
                    onChange={(e) => setCreateForm((p) => ({ ...p, userId: e.target.value }))}
                    required
                  >
                    <option value="">اختر مستخدماً</option>
                    {users.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name} ({u.email}){u.phone ? ` - ${u.phone}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">المبلغ</label>
                  <input
                    type="number"
                    className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600"
                    placeholder="0"
                    value={Number(createForm.amount) || 0}
                    onChange={(e) => setCreateForm((p) => ({ ...p, amount: Number(e.target.value) }))}
                    readOnly={createForm.items && createForm.items.length > 0}
                    required
                  />
                  {createForm.items && createForm.items.length > 0 && (
                    <span className="text-xs text-gray-400 mt-1">المبلغ محسوب تلقائياً من العناصر</span>
                  )}
                </div>
                
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">تاريخ الإصدار</label>
                  <input
                    type="date"
                    className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600"
                    value={(createForm.issueDate as string) || ""}
                    onClick={(e) => e.currentTarget.showPicker?.()}
                    onChange={(e) => setCreateForm((p) => ({ ...p, issueDate: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">تاريخ الاستحقاق</label>
                  <input
                    type="date"
                    className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600"
                    value={(createForm.dueDate as string) || ""}
                    onClick={(e) => e.currentTarget.showPicker?.()}
                    onChange={(e) => setCreateForm((p) => ({ ...p, dueDate: e.target.value }))}
                  />
                </div>
                
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">الحالة</label>
                  <select
                    className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600"
                    value={createForm.status || "pending"}
                    onChange={(e) => setCreateForm((p) => ({ ...p, status: e.target.value as any }))}
                  >
                    <option value="pending">قيد الانتظار</option>
                    <option value="paid">مدفوعة</option>
                    <option value="overdue">متأخرة</option>
                  </select>
                </div>
                
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">المبلغ المدفوع (اختياري)</label>
                  <input
                    type="number"
                    className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600"
                    placeholder="0"
                    value={typeof createForm.paidAmount === "number" ? createForm.paidAmount : ""}
                    onChange={(e) => setCreateForm((p) => ({ ...p, paidAmount: e.target.value === "" ? undefined : Number(e.target.value) }))}
                  />
                </div>
              </div>
              
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">ملاحظات (اختياري)</label>
                <textarea
                  className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600"
                  placeholder="اكتب أي ملاحظات هنا"
                  value={createForm.notes || ""}
                  onChange={(e) => setCreateForm((p) => ({ ...p, notes: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">العناصر</label>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700 w-fit"
                    onClick={openItemsModal}
                  >
                    إدارة العناصر ({createForm.items?.length || 0})
                  </button>
                  {createForm.items && createForm.items.length > 0 && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      الإجمالي: {fmt(createForm.items.reduce((s, it) => s + (Number(it.quantity) || 0) * (Number(it.price) || 0), 0))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  onClick={closeCreateModal}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {creating ? "جارِ الإنشاء..." : "إنشاء فاتورة"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal عرض الفاتورة */}
      {viewModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-3xl w-full mx-4 p-6 relative animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 dark:bg-gray-900/30 text-gray-700 dark:text-gray-200 text-xs font-bold">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 3h9a2 2 0 0 1 2 2v3h-2V5H6v14h9v-3h2v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" stroke="#2563eb" strokeWidth="2"/></svg>
                  فاتورة #{selectedInvoice.invoiceNumber}
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${selectedInvoice.status === 'paid' ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-200' : selectedInvoice.status === 'overdue' ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-200' : 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-200'}`}>
                  {selectedInvoice.status}
                </span>
              </div>
              <button onClick={closeViewModal} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl">×</button>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/40">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" stroke="#64748b" strokeWidth="2"/><path d="M20 22a8 8 0 1 0-16 0" stroke="#64748b" strokeWidth="2"/></svg>
                  بيانات العميل
                </div>
                <div className="space-y-1">
                  <div><span className="text-gray-500">الاسم:</span> <span className="font-medium">{userMap[selectedInvoice.userId]?.name || selectedInvoice.userId}</span></div>
                  <div><span className="text-gray-500">الهاتف:</span> <span className="font-medium">{userMap[selectedInvoice.userId]?.phone || '-'}</span></div>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/40">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 5h18M3 12h18M3 19h18" stroke="#64748b" strokeWidth="2"/></svg>
                  تفاصيل الفاتورة
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                  <div className="text-gray-500">القيمة</div>
                  <div className="font-medium text-right md:text-left">{fmt(selectedInvoice.amount)}</div>
                  <div className="text-gray-500">مدفوع</div>
                  <div className="font-medium text-right md:text-left">{fmt(selectedInvoice.paidAmount || 0)}</div>
                  <div className="text-gray-500">الإصدار</div>
                  <div className="font-medium text-right md:text-left">{String(selectedInvoice.issueDate).slice(0,10)}</div>
                  <div className="text-gray-500">الاستحقاق</div>
                  <div className="font-medium text-right md:text-left">{selectedInvoice.dueDate ? String(selectedInvoice.dueDate).slice(0,10) : '-'}</div>
                </div>
              </div>

              <div className="md:col-span-2 rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/40">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="#64748b" strokeWidth="2"/></svg>
                  العناصر
                </div>
                <div className="overflow-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-800/60">
                      <tr>
                        <th className="px-3 py-2">الوصف</th>
                        <th className="px-3 py-2">الكمية</th>
                        <th className="px-3 py-2">السعر</th>
                        <th className="px-3 py-2">الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedInvoice.items || []).map((it, i) => (
                        <tr key={i} className="border-t border-gray-200 dark:border-gray-700">
                          <td className="px-3 py-2">{it.description}</td>
                          <td className="px-3 py-2">{it.quantity}</td>
                          <td className="px-3 py-2">{fmt(it.price)}</td>
                          <td className="px-3 py-2">{fmt((it.quantity || 0) * (it.price || 0))}</td>
                        </tr>
                      ))}
                      {(!selectedInvoice.items || selectedInvoice.items.length === 0) && (
                        <tr>
                          <td className="px-3 py-3 text-center text-gray-500" colSpan={4}>لا توجد عناصر</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="md:col-span-2 rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/40">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h16" stroke="#64748b" strokeWidth="2"/></svg>
                  ملاحظات
                </div>
                <div className="font-medium">{selectedInvoice.notes || '-'}</div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex flex-wrap justify-end gap-2 mt-6">
              <button className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600" onClick={() => printInvoice(selectedInvoice)}>
                <span className="inline-flex items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 9V2h12v7" stroke="#fff" strokeWidth="2"/><path d="M6 18h12v4H6z" stroke="#fff" strokeWidth="2"/><path d="M6 14h12" stroke="#fff" strokeWidth="2"/></svg>
                  طباعة الفاتورة
                </span>
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50" disabled={updatingId === selectedInvoice._id} onClick={() => handleDeleteInvoice(selectedInvoice._id)}>
                {updatingId === selectedInvoice._id ? 'جارٍ الحذف...' : 'حذف الفاتورة'}
              </button>
              <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700" onClick={() => openEditModal(selectedInvoice)}>
                تعديل الفاتورة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal تعديل الفاتورة */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full mx-4 p-6 relative animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">تعديل الفاتورة</h2>
              <button 
                onClick={closeEditModal} 
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">المستخدم</label>
                  <select
                    className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600"
                    value={editForm.userId || ''}
                    onChange={(e) => setEditForm((p) => ({ ...p, userId: e.target.value }))}
                    required
                  >
                    <option value="">اختر مستخدماً</option>
                    {users.map((u) => (
                      <option key={u._id} value={u._id}>{u.name} ({u.email}){u.phone ? ` - ${u.phone}` : ''}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">المبلغ</label>
                  <input
                    type="number"
                    className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600"
                    value={Number(editForm.amount) || 0}
                    onChange={(e) => setEditForm((p) => ({ ...p, amount: Number(e.target.value) }))}
                    readOnly={editForm.items && editForm.items.length > 0}
                    required
                  />
                  {editForm.items && editForm.items.length > 0 && (
                    <span className="text-xs text-gray-400 mt-1">المبلغ محسوب تلقائياً من العناصر</span>
                  )}
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">تاريخ الإصدار</label>
                  <input type="date" className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600" onClick={(e) => e.currentTarget.showPicker?.()} value={editForm.issueDate} onChange={(e) => setEditForm((p) => ({ ...p, issueDate: e.target.value }))} required />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">تاريخ الاستحقاق</label>
                  <input type="date" className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600" onClick={(e) => e.currentTarget.showPicker?.()} value={editForm.dueDate || ''} onChange={(e) => setEditForm((p) => ({ ...p, dueDate: e.target.value }))} />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">الحالة</label>
                  <select className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600" value={editForm.status} onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value as any }))}>
                    <option value="pending">قيد الانتظار</option>
                    <option value="paid">مدفوعة</option>
                    <option value="overdue">متأخرة</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">المبلغ المدفوع</label>
                  <input type="number" className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600" value={typeof editForm.paidAmount === 'number' ? editForm.paidAmount : ''} onChange={(e) => setEditForm((p) => ({ ...p, paidAmount: e.target.value === '' ? undefined : Number(e.target.value) }))} />
                </div>
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">ملاحظات</label>
                <textarea className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600" rows={3} value={editForm.notes || ''} onChange={(e) => setEditForm((p) => ({ ...p, notes: e.target.value }))} />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">العناصر</label>
                <button type="button" className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700 w-fit" onClick={() => { setItemsContext('edit'); openItemsModal(); }}>إدارة العناصر ({editForm.items?.length || 0})</button>
                {editForm.items && editForm.items.length > 0 && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">الإجمالي: {fmt(editForm.items.reduce((s, it) => s + (Number(it.quantity) || 0) * (Number(it.price) || 0), 0))}</div>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="button" className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600" onClick={closeEditModal}>إلغاء</button>
                <button type="submit" disabled={!!updatingId} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">{updatingId ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal إدارة العناصر */}
      {itemsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full mx-4 p-6 relative animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">إدارة عناصر الفاتورة</h2>
              <button 
                onClick={closeItemsModal} 
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              {/* إضافة عنصر جديد */}
              <div className="flex justify-end">
                <button
                  type="button"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  onClick={addItem}
                >
                  إضافة عنصر جديد
                </button>
              </div>

              {/* قائمة العناصر */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {tempItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end p-3 border border-gray-200 dark:border-gray-700 rounded">
                    <div className="md:col-span-5">
                      <label className="block text-sm font-medium mb-1">الوصف</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-600"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        placeholder="وصف العنصر"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">الكمية</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-600"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                        min="1"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">السعر</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-600"
                        value={item.price}
                        onChange={(e) => updateItem(index, 'price', Number(e.target.value))}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <div className="text-sm text-gray-600 dark:text-gray-400">الإجمالي</div>
                      <div className="font-semibold text-lg">
                        {fmt(item.quantity * item.price)}
                      </div>
                    </div>
                    <div className="md:col-span-1">
                      <button
                        type="button"
                        className="w-full px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        onClick={() => removeItem(index)}
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                ))}
                
                {tempItems.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    لا توجد عناصر. اضغط "إضافة عنصر جديد" لبدء إضافة العناصر.
                  </div>
                )}
              </div>

              {/* إجمالي العناصر */}
              {tempItems.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>إجمالي العناصر:</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {fmt(itemsTotal)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* أزرار الإجراءات */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                onClick={closeItemsModal}
              >
                إلغاء
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                onClick={confirmItems}
              >
                تأكيد العناصر
              </button>
            </div>
          </div>
        </div>
      )}
      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => { setDeleteDialogOpen(false); setDeleteTargetId(null); }}
        onConfirm={confirmDeleteInvoice}
        title="تأكيد حذف الفاتورة"
        message="هل أنت متأكد أنك تريد حذف هذه الفاتورة؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="حذف نهائي"
        cancelText="إلغاء"
        type="danger"
        isLoading={!!updatingId}
      />
      
      {/* Custom Alert */}
      <CustomAlert
        isOpen={alertState.isOpen}
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
        onClose={hideAlert}
      />
    </div>
  );
};

export default AdminInvoices;
