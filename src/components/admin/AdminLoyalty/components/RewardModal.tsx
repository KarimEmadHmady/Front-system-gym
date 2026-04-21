import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import type { RedeemableReward } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editReward: RedeemableReward | null;
  loading: boolean;
  error: string | null;
  success: string | null;
  onSubmit: (e: React.FormEvent) => void;
  form: any;
  setForm: (form: any) => void;
}

const RewardModal: React.FC<Props> = ({
  isOpen, onClose, editReward, loading, error, success, onSubmit, form, setForm
}) => {


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
             type === 'number' ? Number(value) : value
    }));
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black/50 z-40" />
        <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl mx-auto p-6 z-50">
          <button
            onClick={onClose}
            className="absolute top-3 left-3 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
            {editReward ? 'تعديل المكافأة' : 'إضافة مكافأة جديدة'}
          </h3>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded">
              {(error as any)?.message && typeof (error as any).message === 'string' ? (
                <div>
                  <div className="font-semibold mb-2">بيانات غير صحيحة</div>
                  {Array.isArray((error as any)?.errors) && (
                    <ul className="list-disc list-inside text-sm">
                      {(error as any).errors.map((err: any, index: number) => (
                        <li key={index}>{err}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <div>{error}</div>
              )}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
              {success}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اسم المكافأة</label>
                <input
                  type="text"
                  name="name"
                  value={typeof form.name === 'string' ? form.name : String(form.name || '')}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">النقاط المطلوبة</label>
                <input
                  type="number"
                  name="pointsRequired"
                  value={typeof form.pointsRequired === 'number' ? form.pointsRequired : Number(form.pointsRequired || 0)}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">التصنيف</label>
                <select
                  name="category"
                  value={typeof form.category === 'string' ? form.category : String(form.category || '')}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                >
                  <option value="discount">خصم</option>
                  <option value="product">منتج</option>
                  <option value="service">خدمة</option>
                  <option value="other">أخرى</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">القيمة</label>
                <input
                  type="number"
                  name="value"
                  value={typeof form.value === 'number' ? form.value : Number(form.value || 0)}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المخزون</label>
                <input
                  type="number"
                  name="stock"
                  value={typeof form.stock === 'number' ? form.stock : Number(form.stock || 0)}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">صالححية حتى</label>
                <input
                  type="date"
                  name="validUntil"
                  value={typeof form.validUntil === 'string' ? form.validUntil : String(form.validUntil || '')}
                  onChange={handleChange}
                   onClick={(e) => (e.currentTarget as HTMLInputElement).showPicker?.()}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الوصف</label>
              <textarea
                name="description"
                value={typeof form.description === 'string' ? form.description : String(form.description || '')}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الشروط</label>
              <textarea
                name="conditions"
                value={typeof form.conditions === 'string' ? form.conditions : String(form.conditions || '')}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={typeof form.isActive === 'boolean' ? form.isActive : Boolean(form.isActive)}
                onChange={handleChange}
                className="ml-2"
              />
              <label className="text-sm text-gray-700 dark:text-gray-300">نشط</label>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">إلغاء</button>
              <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700 disabled:opacity-60">
                {loading ? 'جاري الحفظ...' : 'حفظ المكافأة'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
};

export default RewardModal;
