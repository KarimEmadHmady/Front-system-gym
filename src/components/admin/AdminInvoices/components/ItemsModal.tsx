import React, { useState, useEffect } from "react";
import type { CreateInvoiceItem } from "../types";

interface Props {
  open: boolean;
  initialItems: CreateInvoiceItem[];
  fmt: (n: number) => string;
  onClose: () => void;
  onConfirm: (items: CreateInvoiceItem[]) => void;
}

const ItemsModal: React.FC<Props> = ({ open, initialItems, fmt, onClose, onConfirm }) => {
  const [items, setItems] = useState<CreateInvoiceItem[]>([]);

  useEffect(() => {
    if (open) setItems([...initialItems]);
  }, [open, initialItems]);

  if (!open) return null;

  const total = items.reduce((s, it) => s + (it.quantity * it.price), 0);

  const addItem = () => setItems((p) => [...p, { description: "", quantity: 1, price: 0 }]);
  const removeItem = (i: number) => setItems((p) => p.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof CreateInvoiceItem, value: string | number) =>
    setItems((p) => p.map((it, idx) => (idx === i ? { ...it, [field]: value } : it)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full mx-4 p-6 relative animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">إدارة عناصر الفاتورة</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
        </div>

        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              type="button"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={addItem}
            >
              إضافة عنصر جديد
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end p-3 border border-gray-200 dark:border-gray-700 rounded">
                <div className="md:col-span-5">
                  <label className="block text-sm font-medium mb-1">الوصف</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-600"
                    value={item.description}
                    onChange={(e) => updateItem(index, "description", e.target.value)}
                    placeholder="وصف العنصر"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">الكمية</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-600"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">السعر</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-600"
                    value={item.price}
                    onChange={(e) => updateItem(index, "price", Number(e.target.value))}
                  />
                </div>
                <div className="md:col-span-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400">الإجمالي</div>
                  <div className="font-semibold text-lg">{fmt(item.quantity * item.price)}</div>
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

            {items.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                لا توجد عناصر. اضغط "إضافة عنصر جديد" لبدء الإضافة.
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-between items-center text-lg font-semibold">
              <span>إجمالي العناصر:</span>
              <span className="text-gray-600 dark:text-gray-400">{fmt(total)}</span>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button type="button" className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600" onClick={onClose}>إلغاء</button>
          <button type="button" className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700" onClick={() => onConfirm(items)}>تأكيد العناصر</button>
        </div>
      </div>
    </div>
  );
};

export default ItemsModal;