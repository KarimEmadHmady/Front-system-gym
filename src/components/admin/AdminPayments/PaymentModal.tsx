import React from 'react';
import type { Payment } from '@/services/paymentService';
import type { User } from '@/types/models';

interface PaymentModalProps {
  isOpen: boolean;
  editing: Payment | null;
  form: any;
  users: User[];
  saving: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onFormChange: (field: string, value: string) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  editing,
  form,
  users,
  saving,
  onClose,
  onSubmit,
  onFormChange
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4 p-6 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">{editing ? 'تعديل دفعة' : 'إضافة دفعة'}</h2>
          <button className="text-white  hover:text-red-500  text-xl absolute right-4 top-4  w-8 h-8 flex items-center justify-center" onClick={onClose}>×</button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">المستخدم</label>
            <select 
              className="w-full border rounded p-2 bg-gray-800 text-white" 
              value={form.userId} 
              onChange={e=>onFormChange('userId', e.target.value)} 
              required
            >
              <option value="">اختر المستخدم</option>
              {users.map(u => (
                <option key={u._id} value={u._id}>{u.name} {u.phone ? `(${u.phone})` : ''}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">المبلغ</label>
            <input 
              type="number" 
              className="w-full border rounded p-2 bg-gray-800 text-white" 
              value={form.amount} 
              onChange={e=>onFormChange('amount', e.target.value)} 
              min={0} 
              step="0.01" 
              required 
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">التاريخ</label>
              <input 
                type="date" 
                onClick={(e) => e.currentTarget.showPicker?.()} 
                className="w-full border rounded p-2 bg-gray-800 text-white" 
                value={form.date} 
                onChange={e=>onFormChange('date', e.target.value)} 
                required 
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">الساعة</label>
              <input 
                type="time" 
                onClick={(e) => e.currentTarget.showPicker?.()} 
                className="w-full border rounded p-2 bg-gray-800 text-white" 
                value={form.time || ''} 
                onChange={e=>onFormChange('time', e.target.value)} 
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">طريقة الدفع</label>
            <select 
              className="w-full border rounded p-2 bg-gray-800 text-white" 
              value={form.method} 
              onChange={e=>onFormChange('method', e.target.value)}
            >
              <option value="cash">نقدي</option>
              <option value="card">بطاقة</option>
              <option value="bank_transfer">تحويل بنكي</option>
              <option value="other">أخرى</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">ملاحظات</label>
            <textarea 
              className="w-full border rounded p-2 bg-gray-800 text-white" 
              value={form.notes} 
              onChange={e=>onFormChange('notes', e.target.value)} 
            />
          </div>
          <div className="flex justify-end gap-2">
            <button 
              type="button" 
              className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-900" 
              onClick={onClose} 
              disabled={saving}
            >
              إلغاء
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 rounded bg-gray-600 text-white" 
              disabled={saving}
            >
              {saving ? 'جارٍ الحفظ...' : 'حفظ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
