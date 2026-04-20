'use client';

import React from 'react';

type ExpenseForm = {
  amount?: number;
  date?: string;
  category: string;
  paidTo?: string;
  notes?: string;
  imageUrl?: string;
};

interface ExpenseFormProps {
  form: ExpenseForm;
  setForm: (form: ExpenseForm | ((prev: ExpenseForm) => ExpenseForm)) => void;
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => void;
  loading: boolean;
  isEdit: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

const ExpenseFormComponent: React.FC<ExpenseFormProps> = ({
  form,
  setForm,
  uploadedFile,
  setUploadedFile,
  loading,
  isEdit,
  onSubmit,
  onCancel,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
        {isEdit ? 'تعديل مصروف' : 'اضافة مصروف '}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input 
          className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600" 
          type="number" 
          placeholder="المجموع"
          value={form.amount as any || ''}
          onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value === '' ? undefined : Number(e.target.value) }))} 
        />
        <input
          className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600 cursor-pointer"
          type="date"
          value={form.date || ''}
          onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          onClick={(e) => (e.currentTarget as HTMLInputElement).showPicker?.()}
        />
        <input 
          className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600" 
          placeholder="الفئة"
          value={form.category || ''}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} 
        />
        <input 
          className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600" 
          placeholder="المدفوع لـ"
          value={form.paidTo || ''}
          onChange={(e) => setForm((f) => ({ ...f, paidTo: e.target.value }))} 
        />
        <input 
          className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600" 
          placeholder="ملاحظات"
          value={form.notes || ''}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} 
        />
        <div className="flex flex-col mt-2 mb-2">
          <label className="text-xs text-gray-700 dark:text-gray-300 mb-1"> إضافة صورة الفاتورة أو المرفق (اختياري)</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => setUploadedFile(e.target.files?.[0] || null)}
          />
          {uploadedFile ? (
            <img src={URL.createObjectURL(uploadedFile)} alt="preview" style={{ width: 90, marginTop: 8 }} className="rounded border mt-1" />
          ) : form.imageUrl ? (
            <img src={form.imageUrl} alt="current" style={{ width: 90, marginTop: 8, opacity: 0.75 }} className="rounded border mt-1" />
          ) : null}
          {(uploadedFile || form.imageUrl) && (
            <button type="button" className="text-xs text-red-500 mt-1" onClick={() => { setUploadedFile(null); setForm(f => ({ ...f, imageUrl: '' })); }}>
              مسح الصورة
            </button>
          )}
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button 
          className={`px-4 py-2 ${isEdit ? 'bg-gray-600 hover:bg-gray-700' : 'bg-green-600 hover:bg-green-700'} text-white rounded disabled:opacity-50`} 
          onClick={onSubmit} 
          disabled={loading}
        >
          {isEdit ? 'حفظ' : 'إنشاء'}
        </button>
        {isEdit && (
          <button className="px-4 py-2 border rounded" onClick={onCancel} disabled={loading}>إلغاء</button>
        )}
      </div>
    </div>
  );
};

export default ExpenseFormComponent;
