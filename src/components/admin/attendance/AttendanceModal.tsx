import React from 'react';
import type { User } from '@/types/models';
import type { AttendanceModalProps } from './types';

export const AttendanceModal: React.FC<AttendanceModalProps> = ({
  isOpen,
  onClose,
  mode,
  form,
  setForm,
  users,
  addUserQuery,
  setAddUserQuery,
  onSubmit,
  loading,
  title,
}) => {
  if (!isOpen) return null;

  const filteredUsers = addUserQuery
    ? users.filter(u => 
        (u.name || '').toLowerCase().includes(addUserQuery.toLowerCase()) || 
        (u.phone || '').toLowerCase().includes(addUserQuery.toLowerCase())
      )
    : users;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4 p-6 relative animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <button 
            onClick={onClose} 
            className="text-white hover:text-red-500 text-xl absolute right-4 top-4 w-8 h-8 flex items-center justify-center transition-colors duration-150"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">العضو</label>
            {mode === 'add' && (
              <input
                type="text"
                value={addUserQuery}
                onChange={(e) => setAddUserQuery(e.target.value)}
                placeholder="البحث بالاسم أو الهاتف"
                className="w-full border rounded p-2 mb-2 bg-gray-800 text-white focus:bg-gray-900 focus:text-white"
              />
            )}
            <select
              className="w-full border rounded p-2 bg-gray-800 text-white focus:bg-gray-900 focus:text-white"
              value={form.userId}
              onChange={e => setForm({ ...form, userId: e.target.value })}
              required
            >
              <option value="">اختر العضو</option>
              {filteredUsers.map(u => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.phone || '-'})
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">التاريخ</label>
              <input
                type="date"
                className="w-full border rounded p-2 bg-gray-800 text-white focus:bg-gray-900 focus:text-white cursor-pointer"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                required
                onFocus={e => e.target.showPicker && e.target.showPicker()}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">الوقت</label>
              <input
                type="time"
                className="w-full border rounded p-2 bg-gray-800 text-white focus:bg-gray-900 focus:text-white cursor-pointer"
                value={form.time}
                onChange={e => setForm({ ...form, time: e.target.value })}
                required
                onFocus={e => e.target.showPicker && e.target.showPicker()}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الحالة</label>
            <select
              className="w-full border rounded p-2 bg-gray-800 text-white focus:bg-gray-900 focus:text-white"
              value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value })}
              required
            >
              <option value="present">حاضر</option>
              <option value="absent">غائب</option>
              <option value="excused">معتذر</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">ملاحظات</label>
            <textarea
              className="w-full border rounded p-2 bg-gray-800 text-white focus:bg-gray-900 focus:text-white"
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button 
              type="button" 
              className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-900" 
              onClick={onClose} 
              disabled={loading}
            >
              إلغاء
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 rounded bg-gray-600 text-white" 
              disabled={loading}
            >
              {loading ? 'جاري الحفظ...' : 'حفظ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
