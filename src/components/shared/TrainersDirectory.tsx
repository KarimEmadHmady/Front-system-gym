'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { User } from '@/types/models';
import { UserService } from '@/services/userService';
import VideoTutorial from '../VideoTutorial';

type TrainersDirectoryProps = {
  scope: 'admin' | 'manager';
};

const TrainersDirectory: React.FC<TrainersDirectoryProps> = ({ scope }) => {
  const svc = useMemo(() => new UserService(), []);
  const [trainers, setTrainers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedTrainer, setSelectedTrainer] = useState<User | null>(null);
  const [clients, setClients] = useState<User[]>([]);
  const [allMembers, setAllMembers] = useState<User[]>([]); // أضف هذا السطر
  const [clientsLoading, setClientsLoading] = useState<boolean>(false);
  const [clientsError, setClientsError] = useState<string | null>(null);
  const [trainerClientCount, setTrainerClientCount] = useState<Record<string, number>>({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res: any = await svc.getUsersByRole('trainer', { page: 1, limit: 100, sortBy: 'name', sortOrder: 'asc' });
        const raw = Array.isArray(res) ? res : (res?.data || []);
        const onlyTrainers = (raw || []).filter((u: any) => u?.role === 'trainer');
        setTrainers(onlyTrainers);

        // Fetch members to compute counts per trainer
        try {
          const membersRes: any = await svc.getUsersByRole('member', { page: 1, limit: 1000 });
          const members = Array.isArray(membersRes) ? membersRes : (membersRes?.data || []);
          setAllMembers(members); // خزّن كل الأعضاء هنا
          const counts: Record<string, number> = {};
          (members || []).forEach((m: any) => {
            const tid = (m?.trainerId && typeof m.trainerId === 'object' ? m.trainerId._id : m.trainerId) as string | undefined;
            if (tid) counts[tid] = (counts[tid] || 0) + 1;
          });
          setTrainerClientCount(counts);
        } catch (e) {
          // ignore counts error
        }
      } catch (e: any) {
        setError(e?.message || 'تعذر جلب المدربين');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [svc]);

  const openClients = (trainer: User) => {
    setSelectedTrainer(trainer);
    setModalOpen(true);
    setClients([]);
    setClientsLoading(true);
    setClientsError(null);
    try {
      // فلتر العملاء من allMembers فقط
      const filtered = allMembers.filter((m: any) => {
        const tid = (m?.trainerId && typeof m.trainerId === 'object' ? m.trainerId._id : m.trainerId);
        return tid === trainer._id;
      });
      setClients(filtered || []);
    } catch (e: any) {
      setClientsError(e?.message || 'تعذر جلب العملاء');
    } finally {
      setClientsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
            <VideoTutorial 
              videoId="5VTzE6sptIQ" 
              title="  اعرف كل مدرب معاه كام عميل وتفاصيل الأعضاء المرتبطين بيه 🏋️‍♂️"
              position="bottom-right"
              buttonText="شرح"
            />
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">المدربون</h3>
      </div>

      {loading ? (
        <div className="text-gray-500 dark:text-gray-400">جارٍ التحميل...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : trainers.length === 0 ? (
        <div className="text-gray-600 dark:text-gray-300">لا يوجد مدربون حتى الآن.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {trainers.map((t) => (
            <div
              key={t._id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col items-center border border-gray-100 dark:border-gray-700 group transition-transform duration-200 hover:scale-105 hover:shadow-2xl relative"
              style={{ minHeight: 200 }}
            >
              <div className="relative mb-3">
                {t.avatarUrl ? (
                  <img
                    src={t.avatarUrl}
                    alt={t.name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-gradient-to-tr from-gray-500 to-gray-500 shadow-md"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-gray-500 to-gray-600 text-white flex items-center justify-center font-bold text-3xl border-4 border-gray-500 shadow-md">
                    {t.name?.charAt(0)?.toUpperCase()}
                  </div>
                )}
                <span className="absolute -top-2 -right-2 bg-gradient-to-tr from-gray-500 to-gray-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold shadow-lg border-2 border-white dark:border-gray-800">
                  {trainerClientCount[t._id] ?? 0}
                </span>
              </div>
              <div className="text-center w-full">
                <div className="text-gray-900 dark:text-white font-bold text-lg truncate group-hover:text-gray-700 dark:group-hover:text-gray-400 transition-colors duration-200">
                  {t.name}
                </div>
                <div className="text-gray-500 dark:text-gray-400 text-sm truncate">{t.email}</div>
                <div className="text-gray-400 dark:text-gray-500 text-xs mt-0.5 truncate">{t.phone || '- لا يوجد رقم هاتف -'}</div>
              </div>
              <button
                onClick={() => openClients(t)}
                className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm bg-gradient-to-tr from-gray-600 to-gray-600 hover:from-gray-700 hover:to-gray-700 text-white font-semibold shadow transition-colors duration-200"
              >
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="#fff" strokeWidth="2"/><circle cx="12" cy="12" r="3" stroke="#fff" strokeWidth="2"/></svg>
                عرض العملاء
              </button>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-3xl w-full mx-4 p-8 border border-gray-100 dark:border-gray-800">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-600" onClick={() => setModalOpen(false)}>✕</button>
            <div className="flex items-center gap-4 mb-6">
              {selectedTrainer?.avatarUrl ? (
                <img src={selectedTrainer.avatarUrl} alt={selectedTrainer.name} className="w-16 h-16 rounded-full object-cover border-4 border-gradient-to-tr from-gray-500 to-gray-500 shadow" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-gray-500 to-gray-600 text-white flex items-center justify-center font-bold text-2xl border-4 border-gray-500 shadow">
                  {selectedTrainer?.name?.charAt(0)?.toUpperCase()}
                </div>
              )}
              <div>
                <div className="text-gray-900 dark:text-white font-semibold text-xl">{selectedTrainer?.name}</div>
                <div className="text-gray-500 dark:text-gray-400 text-sm">عملاؤه</div>
              </div>
            </div>
            {clientsLoading ? (
              <div className="text-gray-500 dark:text-gray-400">جارٍ التحميل...</div>
            ) : clientsError ? (
              <div className="text-red-600">{clientsError}</div>
            ) : clients.length === 0 ? (
              <div className="text-gray-600 dark:text-gray-300">لا يوجد عملاء مسندون لهذا المدرب.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto">
                {clients.map((c) => (
                  <div key={c._id} className="border border-gray-200 dark:border-gray-800 rounded-xl p-5 bg-gray-50 dark:bg-gray-800/50 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-1">
                      {c.avatarUrl ? (
                        <img src={c.avatarUrl} alt={c.name} className="w-12 h-12 rounded-full object-cover border-2 border-emerald-400" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-lg border-2 border-emerald-400">
                          {c.name?.charAt(0)?.toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-gray-900 dark:text-white font-medium truncate text-base">{c.name}</div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs truncate">{c.email}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3 text-sm text-gray-800 dark:text-gray-100">
                      <div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-300">
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.61 2.63a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.45-1.13a2 2 0 0 1 2.11-.45c.85.28 1.73.49 2.63.61A2 2 0 0 1 22 16.92Z" stroke="#06b6d4" strokeWidth="2"/></svg>
                            الهاتف
                          </span>
                          <span className="text-gray-900 dark:text-white font-medium">{c.phone || '-'}</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-300">
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke="#6366f1" strokeWidth="2"/><path d="M12 7v5l4 2" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"/></svg>
                            مستوى العضوية
                          </span>
                          <span className="text-gray-900 dark:text-white font-medium">{c.membershipLevel}</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-300">
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M12 2l2.39 4.85L20 7.27l-3.8 3.7.9 5.25L12 14.77 6.9 16.22l.9-5.25L4 7.27l5.61-.42L12 2z" stroke="#f59e42" strokeWidth="2"/></svg>
                            نقاط الولاء
                          </span>
                          <span className="text-gray-900 dark:text-white font-medium">{c.loyaltyPoints ?? 0}</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-300">
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" stroke="#10b981" strokeWidth="2"/><path d="M16 2v4M8 2v4M3 10h18" stroke="#10b981" strokeWidth="2"/></svg>
                            مدة الاشتراك
                          </span>
                          <span className="text-gray-900 dark:text-white font-medium">{c.subscriptionStartDate ? new Date(c.subscriptionStartDate).toLocaleDateString() : '-'} → {c.subscriptionEndDate ? new Date(c.subscriptionEndDate).toLocaleDateString() : '-'}</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-300">
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M8 3h8M6 7h12M6 11h12M6 15h12M6 19h12" stroke="#334155" strokeWidth="2"/></svg>
                            الطول / الوزن
                          </span>
                          <span className="text-gray-900 dark:text-white font-medium">{c.heightCm ?? '-'} سم / {c.baselineWeightKg ?? '-'} كجم</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-300">
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke="#ef4444" strokeWidth="2"/><path d="M12 7v10M7 12h10" stroke="#ef4444" strokeWidth="2"/></svg>
                            الأهداف
                          </span>
                          <span className="text-gray-900 dark:text-white font-medium">{['weightLoss','muscleGain','endurance'].filter(k => (c.goals as any)?.[k]).map(k => ({weightLoss:'تنحيف',muscleGain:'عضلات',endurance:'تحمل'} as any)[k]).join('، ') || '-'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainersDirectory;


