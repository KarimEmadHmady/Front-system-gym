'use client';

import React from 'react';

interface ClientDetailsModalProps {
  isViewOpen: boolean;
  viewLoading: boolean;
  viewUser: any;
  viewProgress: any;
  userViewFields: any[];
  formatDate: (val: any) => string;
  calcAge: (dob: any) => string;
  calcBMI: (weightKg?: number, heightCm?: number) => string;
  onClose: () => void;
}

const ClientDetailsModal: React.FC<ClientDetailsModalProps> = ({
  isViewOpen,
  viewLoading,
  viewUser,
  viewProgress,
  userViewFields,
  formatDate,
  calcAge,
  calcBMI,
  onClose
}) => {
  if (!isViewOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl p-6 z-10 overflow-y-auto max-h-[90vh]">
        <div className="relative flex flex-col items-center mb-6 mt-2">
          <button
            onClick={onClose}
            className="absolute top-2 left-2 md:left-auto md:right-2 text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl font-bold focus:outline-none"
            aria-label="إغلاق"
          >
            ×
          </button>
          {viewUser?.avatarUrl ? (
            <img src={viewUser.avatarUrl} alt={viewUser?.name || 'User'} className="w-20 h-20 rounded-full object-cover border-2 border-gray-300 dark:border-gray-700 shadow mb-2" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 flex items-center justify-center text-white text-3xl font-bold mb-2">
              {viewUser?.name ? viewUser.name.charAt(0) : '?'}
            </div>
          )}
          <div className="text-lg font-semibold text-gray-900 dark:text-white">{viewUser?.name}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{viewUser?.email}</div>
        </div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">بيانات العميل</h4>
        {viewLoading ? (
          <div className="text-center py-8">جاري التحميل...</div>
        ) : viewUser && !viewUser.error ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6">
              {userViewFields.map(({ key, label, type }) => {
                const value = (viewUser as any)[key as any];
                if (
                  typeof value === 'undefined' ||
                  value === '' ||
                  value === null ||
                  Array.isArray(value) ||
                  (typeof value === 'object' && value !== null && Object.keys(value).length === 0) ||
                  key === 'dob' ||
                  key === '__v'
                ) return null;

                if (type === 'date') {
                  return (
                    <div key={String(key)} className="flex flex-col border-b pb-2">
                      <span className="font-bold text-gray-700 dark:text-gray-300 mb-1">{label}</span>
                      <span className="text-gray-900 dark:text-white break-all">{formatDate(value)}</span>
                    </div>
                  );
                }

                if (type === 'goals') {
                  const entries = value && typeof value === 'object' ? Object.entries(value).filter(([_, v]) => v) : [];
                  return (
                    <div key={String(key)} className="flex flex-col border-b pb-2">
                      <span className="font-bold text-gray-700 dark:text-gray-300 mb-1">{label}</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {entries.length > 0 ? (
                          entries.map(([k], idx) => (
                            <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
                              {k === 'weightLoss' ? 'تخسيس' : k === 'muscleGain' ? 'بناء عضلات' : k === 'endurance' ? 'قوة تحمل' : k}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">لا يوجد أهداف</span>
                        )}
                      </div>
                    </div>
                  );
                }

                if (type === 'object' && typeof value === 'object' && value !== null) {
                  const filtered = Object.entries(value).filter(([k]) => k !== 'lastLogin' && k !== 'ipAddress');
                  if (filtered.length === 0) return null;
                  return (
                    <div key={String(key)} className="flex flex-col border-b pb-2">
                      <span className="font-bold text-gray-700 dark:text-gray-300 mb-1">{label}</span>
                      <div className="bg-gray-50 dark:bg-gray-900 rounded p-2 text-xs">
                        {filtered.map(([k, v]) => (
                          <div key={k} className="flex justify-between border-b last:border-b-0 py-1">
                            <span className="text-gray-600 dark:text-gray-400">{k}</span>
                            <span className="text-gray-900 dark:text-white">{v === true ? '✔️' : v === false ? '❌' : (v === null || v === undefined || typeof v === 'object' ? '-' : String(v))}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={String(key)} className="flex flex-col border-b pb-2">
                    <span className="font-bold text-gray-700 dark:text-gray-300 mb-1">{label}</span>
                    <span className="text-gray-900 dark:text-white break-all">
                      {value === true ? '✔️' : value === false ? '❌' : value}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* قسم بيانات المستخدم */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <h5 className="font-semibold text-gray-900 dark:text-white mb-3">بيانات المستخدم</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">العمر:</span>
                  <span className="text-gray-900 dark:text-white">{calcAge(viewUser?.dob)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">الوزن (آخر قياس):</span>
                  <span className="text-gray-900 dark:text-white">{viewProgress?.weight ?? '-'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">نسبة الدهون (آخر قياس):</span>
                  <span className="text-gray-900 dark:text-white">{viewProgress?.bodyFat ?? '-'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">الطول (من metadata إن وجد):</span>
                  <span className="text-gray-900 dark:text-white">{viewUser?.metadata?.heightCm ?? '-'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">BMI:</span>
                  <span className="text-gray-900 dark:text-white">{calcBMI(viewProgress?.weight, viewUser?.metadata?.heightCm)}</span>
                </div>
                {viewProgress?.measurements && (
                  <div className="md:col-span-2">
                    <span className="text-gray-600 dark:text-gray-400">القياسات:</span>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 text-xs">
                      {Object.entries(viewProgress.measurements).map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 px-2 py-1">
                          <span className="text-gray-600 dark:text-gray-400">{k}</span>
                          <span className="text-gray-900 dark:text-white">
                          {v === null || v === undefined || typeof v === 'object' ? '-' : String(v)}
                        </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-red-600 py-8">{viewUser?.error || 'تعذر جلب البيانات'}</div>
        )}
        <div className="flex items-center justify-center gap-3 pt-6">
          <button onClick={onClose} className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">إغلاق</button>
        </div>
      </div>
    </div>
  );
};

export default ClientDetailsModal;
