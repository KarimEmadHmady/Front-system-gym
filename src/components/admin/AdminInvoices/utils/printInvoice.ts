import type { Invoice } from "@/services/invoiceService";
import type { User } from "@/types/models";

export const printInvoice = (
  inv: Invoice,
  userMap: Record<string, User>,
  logoUrl: string,
  gymName: string
) => {
  const user = userMap[inv.userId];
  const win = window.open("", "_blank");
  if (!win) return;

  const fmtMoney = (n: any) => {
    const num = Number(n || 0);
    try { return new Intl.NumberFormat("ar-EG").format(num); } catch { return String(num); }
  };

  const paid = typeof (inv as any).paidAmount === "number" ? Number((inv as any).paidAmount) : 0;
  const total = Number((inv as any).amount || 0);
  const remaining = Math.max(0, total - paid);
  const issue = inv.issueDate ? String(inv.issueDate).slice(0, 10) : "-";
  const due = inv.dueDate ? String(inv.dueDate).slice(0, 10) : "-";

  const itemsHtml = (inv.items || [])
    .map((it) => `<tr>
      <td class="desc">${it.description || "-"}</td>
      <td class="qty">${it.quantity || 0}</td>
      <td class="price">${it.price || 0}</td>
      <td class="total">${(it.quantity || 0) * (it.price || 0)}</td>
    </tr>`)
    .join("");

  win.document.write(`
    <html>
      <head>
        <meta charset="utf-8" />
        <title>فاتورة ${inv.invoiceNumber}</title>
        <style>
          :root { --paper: 80mm; --pad: 10px; --fg: #111; --muted: #555; }
          @page { size: var(--paper) auto; margin: 0; }
          * { box-sizing: border-box; }
          body { margin:0; padding:0; direction:rtl; font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Courier New",Tahoma,Arial,sans-serif; color:var(--fg); background:#fff; }
          .receipt { width:var(--paper); margin:0 auto; padding:var(--pad); font-size:12px; line-height:1.35; }
          .center { text-align:center; }
          .muted { color:var(--muted); }
          .sep { border:0; border-top:1px dashed #777; margin:10px 0; }
          .logo img { max-width:52px; max-height:52px; display:block; margin:0 auto 6px; }
          .gym { font-weight:800; font-size:14px; }
          .title { font-weight:900; font-size:13px; margin-top:4px; }
          .meta { display:grid; gap:4px; margin-top:8px; }
          .row { display:flex; justify-content:space-between; gap:8px; }
          .row b { font-weight:700; }
          .kv { display:flex; gap:6px; align-items:baseline; }
          .kv .k { min-width:64px; color:var(--muted); }
          table { width:100%; border-collapse:collapse; }
          thead th { text-align:right; font-weight:800; padding:6px 0; border-bottom:1px solid #333; }
          tbody td { padding:6px 0; border-bottom:1px dashed #bbb; vertical-align:top; }
          td.qty,td.price,td.total { white-space:nowrap; text-align:left; direction:ltr; }
          td.desc { width:100%; }
          .totals { margin-top:8px; display:grid; gap:6px; }
          .big { font-size:14px; font-weight:900; display:flex; justify-content:space-between; direction:ltr; }
          .big span { direction:rtl; }
          .thanks { margin-top:10px; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="center logo">
            ${logoUrl ? `<img src="${logoUrl}" alt="شعار" />` : ""}
            <div class="gym">${gymName || "Gym"}</div>
            <div class="title">إيصال (فاتورة)</div>
          </div>
          <hr class="sep" />
          <div class="meta">
            <div class="row">
              <div class="kv"><span class="k">رقم</span><b>${inv.invoiceNumber || inv._id || "-"}</b></div>
              <div class="kv"><span class="k">الحالة</span><b>${inv.status === "paid" ? "مدفوعة" : inv.status === "overdue" ? "متأخرة" : "قيد الانتظار"}</b></div>
            </div>
            <div class="row">
              <div class="kv"><span class="k">الإصدار</span><span>${issue}</span></div>
              <div class="kv"><span class="k">الاستحقاق</span><span>${due}</span></div>
            </div>
          </div>
          <hr class="sep" />
          <div class="meta">
            <div class="kv"><span class="k">العميل</span><b>${user?.name || inv.userId || "-"}</b></div>
            <div class="kv"><span class="k">الهاتف</span><span>${user?.phone || "-"}</span></div>
          </div>
          <hr class="sep" />
          <table>
            <thead>
              <tr>
                <th>الصنف</th>
                <th style="text-align:left;direction:ltr;">Qty</th>
                <th style="text-align:left;direction:ltr;">Price</th>
                <th style="text-align:left;direction:ltr;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml || `<tr><td colspan="4" class="center muted" style="padding:10px 0;border-bottom:0">لا توجد عناصر</td></tr>`}
            </tbody>
          </table>
          <div class="totals">
            <div class="row"><span class="muted">الإجمالي</span><b>${fmtMoney(total)} ج.م</b></div>
            <div class="row"><span class="muted">المدفوع</span><b>${fmtMoney(paid)} ج.م</b></div>
            <div class="row"><span class="muted">المتبقي</span><b>${fmtMoney(remaining)} ج.م</b></div>
            <hr class="sep" />
            <div class="big"><span>صافي المطلوب</span><span>${fmtMoney(remaining)} ج.م</span></div>
          </div>
          ${inv.notes ? `<hr class="sep" /><div class="meta"><div class="kv"><span class="k">ملاحظات</span><span>${String(inv.notes)}</span></div></div>` : ""}
          <hr class="sep" />
          <div class="center muted thanks">
            شكراً لزيارتكم
            <div style="margin-top:6px">${new Date().toLocaleString("ar-EG")}</div>
          </div>
        </div>
        <script>setTimeout(function(){ try{window.focus();}catch(e){} window.print(); window.close(); }, 250);</script>
      </body>
    </html>
  `);
  win.document.close();
  win.focus();
};