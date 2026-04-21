'use client';

import React from 'react';
import type { ClientProgress, User } from '@/types/models';

type Props = {
  selectedTrainer: User;
  trainerClients: User[];
  trainerProgress: ClientProgress[];
  saving: boolean;
  formUserId: string;
  setFormUserId: (id: string) => void;
  onClose: () => void;
  onLoadClientProgress: (clientId: string) => void;
  onExportClient: (clientId: string) => void;
  onAddMemberProgress: (userId: string) => void;
  onViewDetails: (p: ClientProgress) => void;
  onEditProgress: (p: ClientProgress) => void;
  onDeleteProgress: (id: string) => void;
};

const TrainerDetailsModal = ({
  selectedTrainer,
  trainerClients,
  trainerProgress,
  saving,
  formUserId,
  setFormUserId,
  onClose,
  onLoadClientProgress,
  onExportClient,
  onAddMemberProgress,
  onViewDetails,
  onEditProgress,
  onDeleteProgress,
}: Props) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-4xl bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 overflow-y-auto max-h-[80vh]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-base font-semibold text-gray-900 dark:text-white">تفاصيل المدرب</div>
            <div className="text-xs text-gray-500">{selectedTrainer.name} • {selectedTrainer.email}</div>
          </div>
          <button onClick={onClose} className="px-3 py-1.5 text-sm rounded-md bg-gray-200 dark:bg-gray-800 dark:text-white">
            إغلاق
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Clients List */}
          <div className="border rounded-md p-3 dark:border-gray-700">
            <div className="text-sm font-medium mb-2 text-gray-900 dark:text-white">
              العملاء ({trainerClients.length})
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {trainerClients.map(c => (
                <div key={c._id} className="flex items-center justify-between px-2 py-1 rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                  <button
                    onClick={() => onLoadClientProgress(c._id)}
                    className="flex-1 text-center text-sm flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">{c.name}</span>
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-600 text-white text-xs font-bold">
                        {trainerProgress.filter(p => p.userId === c._id).length}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">عرض السجلات</span>
                  </button>
                  <button
                    onClick={() => onExportClient(c._id)}
                    className="ml-2 px-2 py-1 text-xs rounded bg-green-600 hover:bg-green-700 text-white"
                    title="تصدير بيانات العميل"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7,10 12,15 17,10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Records */}
          <div className="border rounded-md p-3 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                سجلات التقدم ({trainerProgress.length})
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={formUserId}
                  onChange={e => setFormUserId(e.target.value)}
                  className="px-2 py-1 border rounded-md bg-white dark:bg-gray-900 dark:text-white text-xs"
                >
                  <option value="">اختر عضو</option>
                  {trainerClients.map(u => (
                    <option key={u._id} value={u._id}>{u.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    if (!formUserId) return;
                    onAddMemberProgress(formUserId);
                  }}
                  className="px-3 py-1.5 text-sm rounded-md bg-green-600 hover:bg-green-700 text-white"
                >
                  إضافة سجل
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {trainerProgress.map(p => (
                <div key={p._id} className="flex items-center gap-2 border rounded-xl p-3 bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm mb-2">
                  <div className="flex flex-row items-center gap-2 flex-wrap">
                    <div className="flex flex-col items-center min-w-[70px]">
                      <div className="text-xs text-gray-500">التاريخ</div>
                      <div className="font-bold text-xs text-gray-900 dark:text-white">{new Date(p.date).toLocaleDateString()}</div>
                    </div>
                    <div className="flex flex-col items-center min-w-[70px]">
                      <div className="text-xs text-gray-500">الوزن</div>
                      <div className="font-bold text-xs text-gray-900 dark:text-white">{p.weight ?? '-'}</div>
                    </div>
                    <div className="flex flex-col items-center min-w-[70px]">
                      <div className="text-xs text-gray-500">الدهون %</div>
                      <div className="font-bold text-xs text-gray-900 dark:text-white">{p.bodyFatPercentage ?? '-'}</div>
                    </div>
                  </div>
                  <div className="flex flex-row gap-1 items-center justify-center min-w-[40px] ml-auto">
                    {p.image?.url && (
                      <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center" title="يوجد صورة">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21,15 16,10 5,21" />
                        </svg>
                      </div>
                    )}
                    <button title="عرض المزيد" onClick={() => onViewDetails(p)} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-900">
                      <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="#2563eb" strokeWidth="2" />
                        <circle cx="12" cy="12" r="3" stroke="#2563eb" strokeWidth="2" />
                      </svg>
                    </button>
                    <button title="تعديل" onClick={() => onEditProgress(p)} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-900">
                      <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                        <rect x="3" y="3" width="18" height="18" rx="3" stroke="#2563eb" strokeWidth="2" />
                        <path d="M8 16l7.5-7.5a1.06 1.06 0 0 1 1.5 1.5L9.5 17.5H8v-1.5Z" stroke="#2563eb" strokeWidth="2" />
                      </svg>
                    </button>
                    <button title="حذف" onClick={() => onDeleteProgress(p._id)} className="p-2 rounded hover:bg-red-100 dark:hover:bg-red-900">
                      <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                        <rect x="5" y="7" width="14" height="12" rx="2" stroke="#dc2626" strokeWidth="2" />
                        <path d="M3 7h18M10 11v4M14 11v4M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="#dc2626" strokeWidth="2" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
              {saving && <div className="text-xs text-gray-500">جارٍ الحفظ...</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerDetailsModal;