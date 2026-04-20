import React from 'react';
import type { User } from '@/types/models';

interface Props {
  users: User[];
  addPointsUserId: string;
  setAddPointsUserId: (value: string) => void;
  addPointsValue: number;
  setAddPointsValue: (value: number) => void;
  addPointsReason: string;
  setAddPointsReason: (value: string) => void;
  loading: boolean;
  error: string | null;
  success: string | null;
  onSubmit: (e: React.FormEvent) => void;
}

const AddPointsForm: React.FC<Props> = ({
  users, addPointsUserId, setAddPointsUserId, addPointsValue, setAddPointsValue,
  addPointsReason, setAddPointsReason, loading, error, success, onSubmit
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">إضافة نقاط للمستخدم</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
          {success}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اختيار المستخدم</label>
            <select
              value={addPointsUserId}
              onChange={(e) => setAddPointsUserId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
              required
            >
              <option value="">اختيار مستخدم...</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">قيمة النقاط</label>
            <input
              type="number"
              min="1"
              value={addPointsValue}
              onChange={(e) => setAddPointsValue(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">سبب إضافة النقاط</label>
            <input
              type="text"
              value={addPointsReason}
              onChange={(e) => setAddPointsReason(e.target.value)}
              placeholder="أدخل سبب إضافة النقاط..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60"
        >
          {loading ? 'جاري الإضافة...' : 'إضافة نقاط'}
        </button>
      </form>
    </div>
  );
};

export default AddPointsForm;
