'use client';

import React from 'react';

interface AttendanceModalProps {
  addModalOpen: boolean;
  addForm: any;
  adding: boolean;
  onClose: () => void;
  onFormChange: (form: any) => void;
  onSave: () => void;
}

const AttendanceModal: React.FC<AttendanceModalProps> = ({
  addModalOpen,
  addForm,
  adding,
  onClose,
  onFormChange,
  onSave
}) => {
  if (!addModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4 p-6 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">إضافة سجل حضور</h2>
          <button onClick={onClose} className="text-white bg-gray-700 hover:bg-gray-900 text-xl absolute left-4 top-4 rounded-full w-8 h-8 flex items-center justify-center">×</button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave(); }} className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">التاريخ</label>
              <input type="date" className="w-full border rounded p-2 bg-gray-800 text-white focus:bg-gray-900 focus:text-white cursor-pointer"
                value={addForm.date}
                onChange={e => onFormChange((prev: typeof addForm) => ({ ...prev, date: e.target.value }))}
                required onFocus={e => e.target.showPicker && e.target.showPicker()} />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">الساعة</label>
              <input type="time" className="w-full border rounded p-2 bg-gray-800 text-white focus:bg-gray-900 focus:text-white cursor-pointer"
                value={addForm.time}
                onChange={e => onFormChange((prev: typeof addForm) => ({ ...prev, time: e.target.value }))}
                required onFocus={e => e.target.showPicker && e.target.showPicker()} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الحالة</label>
            <select className="w-full border rounded p-2 bg-gray-800 text-white focus:bg-gray-900 focus:text-white"
              value={addForm.status}
              onChange={e => onFormChange((prev: typeof addForm) => ({ ...prev, status: e.target.value }))}
              required>
              <option value="present">حاضر</option>
              <option value="absent">غائب</option>
              <option value="excused">بعذر</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">ملاحظات</label>
            <textarea className="w-full border rounded p-2 bg-gray-800 text-white focus:bg-gray-900 focus:text-white"
              value={addForm.notes}
              onChange={e => onFormChange((prev: typeof addForm) => ({ ...prev, notes: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-900" onClick={onClose} disabled={adding}>إلغاء</button>
            <button type="submit" className="px-4 py-2 rounded bg-gray-600 text-white disabled:bg-gray-400" disabled={adding}>{adding ? 'جارٍ الحفظ...' : 'حفظ'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AttendanceModal;
