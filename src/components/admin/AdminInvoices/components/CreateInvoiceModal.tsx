import React, { useState } from "react";
import type { User } from "@/types/models";
import type { InvoiceFormData, CreateInvoiceItem } from "../types";
import ItemsModal from "./ItemsModal";

interface Props {
  open: boolean;
  users: User[];
  creating: boolean;
  fmt: (n: number) => string;
  onClose: () => void;
  onSubmit: (form: InvoiceFormData) => Promise<boolean>;
}

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

const CreateInvoiceModal: React.FC<Props> = ({ open, users, creating, fmt, onClose, onSubmit }) => {
  const [form, setForm] = useState<InvoiceFormData>(emptyForm());
  const [itemsOpen, setItemsOpen] = useState(false);

  const handleClose = () => { setForm(emptyForm()); onClose(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await onSubmit(form);
    if (ok) { setForm(emptyForm()); onClose(); }
  };

  const handleItemsConfirm = (items: CreateInvoiceItem[]) => {
    const computed = items.reduce((s, it) => s + (Number(it.quantity) || 0) * (Number(it.price) || 0), 0);
    setForm((p) => ({ ...p, items, amount: computed }));
    setItemsOpen(false);
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full mx-4 p-6 relative animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">إنشاء فاتورة جديدة</h2>
            <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">المستخدم ({users.length} مستخدم)</label>
                <select
                  className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600"
                  value={form.userId}
                  onChange={(e) => setForm((p) => ({ ...p, userId: e.target.value }))}
                  required
                >
                  <option value="">اختر مستخدماً</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>{u.name} ({u.email}){u.phone ? ` - ${u.phone}` : ""}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">المبلغ</label>
                <input
                  type="number"
                  className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600"
                  placeholder="0"
                  value={Number(form.amount) || 0}
                  onChange={(e) => setForm((p) => ({ ...p, amount: Number(e.target.value) }))}
                  readOnly={form.items.length > 0}
                  required
                />
                {form.items.length > 0 && <span className="text-xs text-gray-400 mt-1">المبلغ محسوب تلقائياً من العناصر</span>}
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">تاريخ الإصدار</label>
                <input type="date" className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600"
                  value={form.issueDate} onClick={(e) => e.currentTarget.showPicker?.()}
                  onChange={(e) => setForm((p) => ({ ...p, issueDate: e.target.value }))} required />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">تاريخ الاستحقاق</label>
                <input type="date" className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600"
                  value={form.dueDate || ""} onClick={(e) => e.currentTarget.showPicker?.()}
                  onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))} />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">الحالة</label>
                <select className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600"
                  value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as any }))}>
                  <option value="pending">قيد الانتظار</option>
                  <option value="paid">مدفوعة</option>
                  <option value="overdue">متأخرة</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">المبلغ المدفوع (اختياري)</label>
                <input type="number" className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600"
                  placeholder="0"
                  value={typeof form.paidAmount === "number" ? form.paidAmount : ""}
                  onChange={(e) => setForm((p) => ({ ...p, paidAmount: e.target.value === "" ? undefined : Number(e.target.value) }))} />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">ملاحظات (اختياري)</label>
              <textarea className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600" rows={3}
                value={form.notes || ""} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">العناصر</label>
              <button type="button" className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700 w-fit"
                onClick={() => setItemsOpen(true)}>
                إدارة العناصر ({form.items.length})
              </button>
              {form.items.length > 0 && (
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  الإجمالي: {fmt(form.items.reduce((s, it) => s + (Number(it.quantity) || 0) * (Number(it.price) || 0), 0))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button type="button" className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600" onClick={handleClose}>إلغاء</button>
              <button type="submit" disabled={creating} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
                {creating ? "جارِ الإنشاء..." : "إنشاء فاتورة"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <ItemsModal open={itemsOpen} initialItems={form.items} fmt={fmt}
        onClose={() => setItemsOpen(false)} onConfirm={handleItemsConfirm} />
    </>
  );
};

export default CreateInvoiceModal;