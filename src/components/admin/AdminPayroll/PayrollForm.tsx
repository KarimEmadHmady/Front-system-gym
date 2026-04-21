import React from 'react';
import type { User } from '@/types/models';

interface PayrollFormProps {
  form: {
    employeeId?: string;
    salaryAmount?: number;
    paymentDate?: string;
    bonuses?: number;
    deductions?: number;
    notes?: string;
  };
  selectedId: string | null;
  payrollUsers: User[];
  loading: boolean;
  userMap: Record<string, User>;
  onFormChange: (form: any) => void;
  onCreate: () => void;
  onUpdate: () => void;
  onResetForm: () => void;
}

const PayrollForm: React.FC<PayrollFormProps> = ({
  form,
  selectedId,
  payrollUsers,
  loading,
  userMap,
  onFormChange,
  onCreate,
  onUpdate,
  onResetForm
}) => {
  // Create form (when selectedId is null)
  if (selectedId == null) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">إضافة راتب</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select 
            className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600" 
            value={form.employeeId || ''} 
            onChange={(e) => onFormChange({ ...form, employeeId: e.target.value })}
          >
            <option value="">اختر موظفاً</option>
            {payrollUsers.map(u => (
              <option key={u._id} value={u._id}>
                {u.name}{u.phone ? ` - ${u.phone}` : ''}
              </option>
            ))}
          </select>
          <input 
            className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600" 
            type="number" 
            placeholder="قيمة الراتب" 
            value={form.salaryAmount as any || ''} 
            onChange={(e) => onFormChange({ 
              ...form, 
              salaryAmount: e.target.value === '' ? undefined : Number(e.target.value) 
            })} 
          />
          <input 
            className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600" 
            type="date" 
            onClick={(e) => e.currentTarget.showPicker?.()} 
            value={form.paymentDate || ''} 
            onChange={(e) => onFormChange({ ...form, paymentDate: e.target.value })} 
          />
          <input 
            className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600" 
            type="number" 
            placeholder="مكافآت (اختياري)" 
            value={typeof form.bonuses === 'number' ? form.bonuses : ''} 
            onChange={(e) => onFormChange({ 
              ...form, 
              bonuses: e.target.value === '' ? undefined : Number(e.target.value) 
            })} 
          />
          <input 
            className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600" 
            type="number" 
            placeholder="خصومات (اختياري)" 
            value={typeof form.deductions === 'number' ? form.deductions : ''} 
            onChange={(e) => onFormChange({ 
              ...form, 
              deductions: e.target.value === '' ? undefined : Number(e.target.value) 
            })} 
          />
          <input 
            className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600" 
            placeholder="ملاحظات" 
            value={form.notes || ''} 
            onChange={(e) => onFormChange({ ...form, notes: e.target.value })} 
          />
        </div>
        <div className="mt-3 flex gap-2">
          <button 
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50" 
            onClick={onCreate} 
            disabled={loading}
          >
            إنشاء
          </button>
        </div>
      </div>
    );
  }

  // Edit form (when selectedId is not null)
  return (
    <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-lg w-full p-6 relative animate-fade-in">
        <button 
          onClick={onResetForm} 
          className="absolute -top-4 -right-4 bg-white border border-gray-200 rounded-full shadow p-2 text-xl text-black hover:bg-gray-100" 
          title="إغلاق"
        >
          ✕
        </button>
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">تعديل راتب</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input 
            type="text" 
            className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600 bg-gray-100 text-gray-700" 
            value={userMap[form.employeeId || '']?.name || form.employeeId || ''} 
            disabled 
            readOnly 
          />
          <input 
            className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600" 
            type="number" 
            placeholder="قيمة الراتب" 
            value={form.salaryAmount as any || ''} 
            onChange={(e) => onFormChange({ 
              ...form, 
              salaryAmount: e.target.value === '' ? undefined : Number(e.target.value) 
            })} 
          />
          <input 
            className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600" 
            type="date" 
            onClick={(e) => e.currentTarget.showPicker?.()} 
            value={form.paymentDate || ''} 
            onChange={(e) => onFormChange({ ...form, paymentDate: e.target.value })} 
          />
          <input 
            className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600" 
            type="number" 
            placeholder="مكافآت (اختياري)" 
            value={typeof form.bonuses === 'number' ? form.bonuses : ''} 
            onChange={(e) => onFormChange({ 
              ...form, 
              bonuses: e.target.value === '' ? undefined : Number(e.target.value) 
            })} 
          />
          <input 
            className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600" 
            type="number" 
            placeholder="خصومات (اختياري)" 
            value={typeof form.deductions === 'number' ? form.deductions : ''} 
            onChange={(e) => onFormChange({ 
              ...form, 
              deductions: e.target.value === '' ? undefined : Number(e.target.value) 
            })} 
          />
          <input 
            className="px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600" 
            placeholder="ملاحظات" 
            value={form.notes || ''} 
            onChange={(e) => onFormChange({ ...form, notes: e.target.value })} 
          />
        </div>
        <div className="mt-3 flex gap-2 justify-end">
          <button 
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50" 
            onClick={onUpdate} 
            disabled={loading}
          >
            حفظ
          </button>
          <button 
            className="px-4 py-2 border rounded" 
            onClick={onResetForm} 
            disabled={loading}
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayrollForm;
