'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { ClientProgress, User } from '@/types/models';
import { userService } from '@/services';
import { ProgressService } from '@/services/progressService';
import * as XLSX from 'xlsx';
import VideoTutorial from '../VideoTutorial';

type TrainerRow = {
  trainer: User;
  clientsCount: number;
  progressCount: number;
  latestProgressDate?: string;
};

const progressService = new ProgressService();

const AdminProgress = () => {
  const [loading, setLoading] = useState(false);
  const [trainers, setTrainers] = useState<TrainerRow[]>([]);
  const [query, setQuery] = useState('');
  const [selectedTrainer, setSelectedTrainer] = useState<User | null>(null);
  const [trainerClients, setTrainerClients] = useState<User[]>([]);
  const [trainerProgress, setTrainerProgress] = useState<ClientProgress[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [formTrainerId, setFormTrainerId] = useState<string>('');
  const [formUserId, setFormUserId] = useState<string>('');
  const [formUsersOfTrainer, setFormUsersOfTrainer] = useState<User[]>([]);
  const [allMembersForForm, setAllMembersForForm] = useState<User[]>([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [formMembersLoading, setFormMembersLoading] = useState(false);
  const [formDate, setFormDate] = useState<string>('');
  const [formWeight, setFormWeight] = useState<string>('');
  const [formBodyFat, setFormBodyFat] = useState<string>('');
  const [formNotes, setFormNotes] = useState<string>('');
  const [editProgressId, setEditProgressId] = useState<string | null>(null);
  const [editProgressData, setEditProgressData] = useState<{date: string, weight: string, bodyFat: string, notes: string} | null>(null);
  const [deleteProgressId, setDeleteProgressId] = useState<string | null>(null);
  const [addProgressPopupOpen, setAddProgressPopupOpen] = useState(false);
  const [addProgressData, setAddProgressData] = useState<{userId: string, date: string, weight: string, bodyFat: string, notes: string} | null>(null);
  // إضافة state جديد لبوب أب إضافة سجل لعضو محدد
  const [addMemberProgressPopup, setAddMemberProgressPopup] = useState<{userId: string} | null>(null);
  const [addMemberProgressData, setAddMemberProgressData] = useState<{date: string, weight: string, bodyFat: string, notes: string}>({date: '', weight: '', bodyFat: '', notes: ''});
  // 1. أضف state جديدة للحقول الجديدة في النماذج:
  const [formMuscleMass, setFormMuscleMass] = useState<string>('');
  const [formWaist, setFormWaist] = useState<string>('');
  const [formChest, setFormChest] = useState<string>('');
  const [formArms, setFormArms] = useState<string>('');
  const [formLegs, setFormLegs] = useState<string>('');
  const [formWeightChange, setFormWeightChange] = useState<string>('');
  const [formFatChange, setFormFatChange] = useState<string>('');
  const [formMuscleChange, setFormMuscleChange] = useState<string>('');
  const [formStatus, setFormStatus] = useState<'ممتاز' | 'جيد' | 'يحتاج لتحسين'>('جيد');
  const [formAdvice, setFormAdvice] = useState<string>('');
  // 1. أضف state جديدة للحقول في addMemberProgressPopup إذا لم تكن موجودة:
  const [addMemberMuscleMass, setAddMemberMuscleMass] = useState('');
  const [addMemberWaist, setAddMemberWaist] = useState('');
  const [addMemberChest, setAddMemberChest] = useState('');
  const [addMemberArms, setAddMemberArms] = useState('');
  const [addMemberLegs, setAddMemberLegs] = useState('');
  const [addMemberWeightChange, setAddMemberWeightChange] = useState('');
  const [addMemberFatChange, setAddMemberFatChange] = useState('');
  const [addMemberMuscleChange, setAddMemberMuscleChange] = useState('');
  const [addMemberStatus, setAddMemberStatus] = useState<'ممتاز' | 'جيد' | 'يحتاج لتحسين'>('جيد');
  const [addMemberAdvice, setAddMemberAdvice] = useState('');
  // 1. أضف state جديدة للحقول في التعديل:
  const [editMuscleMass, setEditMuscleMass] = useState('');
  const [editWaist, setEditWaist] = useState('');
  const [editChest, setEditChest] = useState('');
  const [editArms, setEditArms] = useState('');
  const [editLegs, setEditLegs] = useState('');
  const [editWeightChange, setEditWeightChange] = useState('');
  const [editFatChange, setEditFatChange] = useState('');
  const [editMuscleChange, setEditMuscleChange] = useState('');
  const [editStatus, setEditStatus] = useState<'ممتاز' | 'جيد' | 'يحتاج لتحسين'>('جيد');
  const [editAdvice, setEditAdvice] = useState('');
  // 1. State جديد لبوب أب التفاصيل
  const [selectedProgressDetails, setSelectedProgressDetails] = useState<ClientProgress | null>(null);
  
  // States للصور
  const [formImage, setFormImage] = useState<File | null>(null);
  const [formImagePreview, setFormImagePreview] = useState<string | null>(null);
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [addMemberImage, setAddMemberImage] = useState<File | null>(null);
  const [addMemberImagePreview, setAddMemberImagePreview] = useState<string | null>(null);

  // دالة لمعالجة رفع الصور
  const handleImageChange = (file: File | null, setImage: (file: File | null) => void, setPreview: (preview: string | null) => void) => {
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const trainersRes = await userService.getUsersByRole('trainer', { limit: 100 } as any);
        const tdata = (trainersRes as any).data || (trainersRes as any);
        const trainersOnly: User[] = (tdata?.items || tdata || []) as any[];
        const rows: TrainerRow[] = [];
        for (const t of trainersOnly) {
          const [clients, progress] = await Promise.all([
            userService.getClientsOfTrainer(t._id).catch(() => []),
            progressService.getTrainerProgress(t._id).catch(() => []),
          ]);
          const latestProgressDate = progress && progress.length > 0 ? new Date(progress[0].date as any).toISOString() : undefined;
          rows.push({ trainer: t, clientsCount: clients.length, progressCount: progress.length, latestProgressDate });
        }
        setTrinersSafe(rows);
      } finally {
        setLoading(false);
      }
    };
    const setTrinersSafe = (rows: TrainerRow[]) => {
      try { setTrainers(rows); } catch {}
    };
    run();
  }, []);

  // Ensure trainers list exists for add modal even if table failed to load counts
  useEffect(() => {
    if (!addModalOpen || trainers.length > 0) return;
    (async () => {
      try {
        const trainersRes = await userService.getUsersByRole('trainer', { limit: 100 } as any);
        const tdata = (trainersRes as any).data || (trainersRes as any);
        const trainersOnly: User[] = (tdata?.items || tdata || []) as any[];
        const minimalRows: TrainerRow[] = trainersOnly.map(t => ({ trainer: t, clientsCount: 0, progressCount: 0 }));
        setTrainers(prev => (prev.length ? prev : minimalRows));
      } catch {}
    })();
  }, [addModalOpen, trainers.length]);

  // Load members for the add-progress modal (reuse pattern from AdminPlansOverview)
  useEffect(() => {
    if (!addModalOpen) return;
    let mounted = true;
    (async () => {
      try {
        setFormMembersLoading(true);
        const membersRes = await userService.getUsersByRole('member', { limit: 1000 } as any);
        const raw = (membersRes as any).data || (membersRes as any);
        const list: User[] = (raw?.items || raw || []) as any[];
        if (mounted) setAllMembersForForm(list);
      } catch {
        if (mounted) setAllMembersForForm([]);
      } finally {
        if (mounted) setFormMembersLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [addModalOpen]);

  // Recompute members list when trainer changes and members arrive later
  useEffect(() => {
    if (!formTrainerId) return;
    if (formUsersOfTrainer.length > 0) return;
    const normalizeId = (val: any): string => {
      if (!val) return '';
      if (typeof val === 'string') return val;
      if (typeof val === 'object') return (val._id || (val as any).id || '') as string;
      return String(val);
    };
    const filtered = allMembersForForm.filter(u => normalizeId((u as any).trainerId) === formTrainerId);
    if (filtered.length > 0) {
      setFormUsersOfTrainer(filtered);
    }
  }, [formTrainerId, allMembersForForm, formUsersOfTrainer.length]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return trainers;
    return trainers.filter(r =>
      r.trainer.name?.toLowerCase().includes(q) ||
      r.trainer.email?.toLowerCase().includes(q) ||
      (r.trainer.phone ? r.trainer.phone.toLowerCase().includes(q) : false)
    );
  }, [query, trainers]);

  const openTrainer = async (t: User) => {
    setSelectedTrainer(t);
    setModalOpen(true);
    setSaving(true);
    setFormUserId(''); // إعادة تعيين العضو المختار عند كل فتح
    try {
      const [clients, progress] = await Promise.all([
        userService.getClientsOfTrainer(t._id).catch(() => []),
        progressService.getTrainerProgress(t._id).catch(() => []),
      ]);
      setTrainerClients(clients);
      setTrainerProgress(progress);
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async (payload: Omit<ClientProgress, '_id' | 'createdAt' | 'updatedAt'>, imageFile?: File) => {
    setSaving(true);
    try {
      const created = await progressService.create(payload, imageFile);
      setTrainerProgress(prev => [created, ...prev]);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: string, data: Partial<ClientProgress>, imageFile?: File, oldImagePublicId?: string) => {
    setSaving(true);
    try {
      const updated = await progressService.update(id, data, imageFile, oldImagePublicId);
      setTrainerProgress(prev => prev.map(p => (p._id === id ? updated : p)));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    try {
      await progressService.delete(id);
      setTrainerProgress(prev => prev.filter(p => p._id !== id));
    } finally {
      setSaving(false);
    }
  };

  // 2. عند فتح التعديل، املأ الحقول الجديدة:
  useEffect(() => {
    if (editProgressId && editProgressData) {
      const progress = trainerProgress.find(p => p._id === editProgressId);
      if (progress) {
        setEditMuscleMass(progress.muscleMass?.toString() ?? '');
        setEditWaist(progress.waist?.toString() ?? '');
        setEditChest(progress.chest?.toString() ?? '');
        setEditArms(progress.arms?.toString() ?? '');
        setEditLegs(progress.legs?.toString() ?? '');
        setEditWeightChange(progress.weightChange?.toString() ?? '');
        setEditFatChange(progress.fatChange?.toString() ?? '');
        setEditMuscleChange(progress.muscleChange?.toString() ?? '');
        setEditStatus(progress.status ?? 'جيد');
        setEditAdvice(progress.advice ?? '');
      }
    }
  }, [editProgressId, editProgressData, trainerProgress]);

  // تصدير بيانات تقدم عميل محدد
  const handleExportClientProgress = (clientId: string) => {
    const client = trainerClients.find(c => c._id === clientId);
    const clientProgress = trainerProgress.filter(p => p.userId === clientId);
    
    const exportData = clientProgress.map((progress) => {
      const dateObj = new Date(progress.date);
      return {
        'اسم العميل': client?.name || '---',
        'هاتف العميل': client?.phone || '-',
        'إيميل العميل': client?.email || '-',
        'التاريخ': dateObj.toLocaleDateString('en-GB'),
        'الوزن (كجم)': progress.weight || '-',
        'نسبة الدهون (%)': progress.bodyFatPercentage || '-',
        'الكتلة العضلية (كجم)': progress.muscleMass || '-',
        'مقاس الوسط (سم)': progress.waist || '-',
        'مقاس الصدر (سم)': progress.chest || '-',
        'مقاس الذراع (سم)': progress.arms || '-',
        'مقاس الرجل (سم)': progress.legs || '-',
        'تغير الوزن (كجم)': progress.weightChange || '-',
        'تغير الدهون (%)': progress.fatChange || '-',
        'تغير الكتلة العضلية (كجم)': progress.muscleChange || '-',
        'الحالة العامة': progress.status || '-',
        'نصيحة المدرب': progress.advice || '-',
        'ملاحظات': progress.notes || '-'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `تقدم_${client?.name || 'عميل'}`);
    
    const fileName = `تقدم_${client?.name || 'عميل'}_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // تصدير بيانات تقدم مدرب محدد
  const handleExportTrainerProgress = (trainerId: string) => {
    const trainer = trainers.find(t => t.trainer._id === trainerId);
    const trainerProgressData = trainerProgress;
    
    const exportData = trainerProgressData.map((progress) => {
      const client = trainerClients.find(c => c._id === progress.userId);
      const dateObj = new Date(progress.date);
      return {
        'اسم المدرب': trainer?.trainer.name || '---',
        'هاتف المدرب': trainer?.trainer.phone || '-',
        'إيميل المدرب': trainer?.trainer.email || '-',
        'اسم العميل': client?.name || '---',
        'هاتف العميل': client?.phone || '-',
        'إيميل العميل': client?.email || '-',
        'التاريخ': dateObj.toLocaleDateString('en-GB'),
        'الوزن (كجم)': progress.weight || '-',
        'نسبة الدهون (%)': progress.bodyFatPercentage || '-',
        'الكتلة العضلية (كجم)': progress.muscleMass || '-',
        'مقاس الوسط (سم)': progress.waist || '-',
        'مقاس الصدر (سم)': progress.chest || '-',
        'مقاس الذراع (سم)': progress.arms || '-',
        'مقاس الرجل (سم)': progress.legs || '-',
        'تغير الوزن (كجم)': progress.weightChange || '-',
        'تغير الدهون (%)': progress.fatChange || '-',
        'تغير الكتلة العضلية (كجم)': progress.muscleChange || '-',
        'الحالة العامة': progress.status || '-',
        'نصيحة المدرب': progress.advice || '-',
        'ملاحظات': progress.notes || '-'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `تقدم_${trainer?.trainer.name || 'مدرب'}`);
    
    const fileName = `تقدم_${trainer?.trainer.name || 'مدرب'}_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
       <VideoTutorial 
        videoId="kVBMpJAjK7U"
        title="كل عميل يقدر يشوف تطوره لحظة بلحظة" 
         position="bottom-right"
        buttonText="شرح"
       />
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">إدارة تقدم العملاء</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAddModalOpen(true)}
            className="px-3 py-2 text-sm rounded-md bg-green-600 hover:bg-green-700 text-white"
          >إضافة تقدم</button>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="ابحث عن مدرب أو بريد إلكتروني"
          className="flex-1 px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white"
        />
      </div>

      {loading ? (
        <div className="text-sm text-gray-500 dark:text-gray-400">جاري التحميل...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300">المدرب</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300">العملاء</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300">سجلات التقدم</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300">آخر تحديث</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filtered.map(row => (
                <tr key={row.trainer._id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="px-3 py-2 text-center">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{row.trainer.name}</div>
                    <div className="text-xs text-gray-500">{row.trainer.email}</div>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 text-center">{row.clientsCount}</td>
                  <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 text-center">{row.progressCount}</td>
                  <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 text-center">{row.latestProgressDate ? new Date(row.latestProgressDate).toLocaleDateString() : '-'}</td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleExportTrainerProgress(row.trainer._id)}
                        className="px-3 py-1.5 text-sm rounded-md bg-green-600 hover:bg-green-700 text-white"
                        title="تصدير بيانات المدرب"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="7,10 12,15 17,10"/>
                          <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => openTrainer(row.trainer)}
                        className="px-3 py-1.5 text-sm rounded-md bg-gray-600 hover:bg-gray-700 text-white"
                      >عرض التفاصيل</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && selectedTrainer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModalOpen(false)} />
          <div className="relative z-10 w-full max-w-4xl bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 overflow-y-auto max-h-[80vh]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-base font-semibold text-gray-900 dark:text-white">تفاصيل المدرب</div>
                <div className="text-xs text-gray-500">{selectedTrainer.name} • {selectedTrainer.email}</div>
              </div>
              <button onClick={() => setModalOpen(false)} className="px-3 py-1.5 text-sm rounded-md bg-gray-200 dark:bg-gray-800 dark:text-white">إغلاق</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-md p-3 dark:border-gray-700">
                <div className="text-sm font-medium mb-2 text-gray-900 dark:text-white">العملاء ({trainerClients.length})</div>
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {trainerClients.map(c => (
                    <div key={c._id} className="flex items-center justify-between px-2 py-1 rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                      <button
                        onClick={async () => {
                          setSaving(true);
                          try {
                            const list = await progressService.getUserProgress(c._id);
                            setTrainerProgress(list);
                          } finally {
                            setSaving(false);
                          }
                        }}
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
                        onClick={() => handleExportClientProgress(c._id)}
                        className="ml-2 px-2 py-1 text-xs rounded bg-green-600 hover:bg-green-700 text-white"
                        title="تصدير بيانات العميل"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="7,10 12,15 17,10"/>
                          <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border rounded-md p-3 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">سجلات التقدم ({trainerProgress.length})</div>
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
                        if (!selectedTrainer || !formUserId) return;
                        setAddMemberProgressPopup({ userId: formUserId });
                        setAddMemberProgressData({ date: '', weight: '', bodyFat: '', notes: '' });
                      }}
                      className="px-3 py-1.5 text-sm rounded-md bg-green-600 hover:bg-green-700 text-white"
                    >إضافة سجل</button>
                  </div>
                </div>
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {trainerProgress.map(p => (
                    <div key={p._id} className="flex items-center gap-2 border rounded-xl p-3 bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm mb-2">
                      {/* مختصر: التاريخ، الوزن، نسبة الدهون - بجانب بعض */}
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
                        {/* أيقونة الصورة إذا كانت موجودة */}
                        {p.image?.url && (
                          <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center" title="يوجد صورة">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                              <circle cx="8.5" cy="8.5" r="1.5"/>
                              <polyline points="21,15 16,10 5,21"/>
                            </svg>
                          </div>
                        )}
                        <button
                          title="عرض المزيد"
                          onClick={() => setSelectedProgressDetails(p)}
                          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-900"
                        >
                          {/* SVG أيقونة عين */}
                          <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="#2563eb" strokeWidth="2"/>
                            <circle cx="12" cy="12" r="3" stroke="#2563eb" strokeWidth="2"/>
                          </svg>
                        </button>
                        <button
                          title="تعديل"
                          onClick={() => {
                            const progress = trainerProgress.find(x => x._id === p._id);
                            if (progress) {
                              setEditProgressId(p._id);
                              setEditProgressData({
                                date: new Date(progress.date).toISOString().slice(0,10),
                                weight: progress.weight?.toString() ?? '',
                                bodyFat: progress.bodyFatPercentage?.toString() ?? '',
                                notes: progress.notes ?? '',
                              });
                            }
                          }}
                          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-900"
                        >
                          <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3" stroke="#2563eb" strokeWidth="2"/><path d="M8 16l7.5-7.5a1.06 1.06 0 0 1 1.5 1.5L9.5 17.5H8v-1.5Z" stroke="#2563eb" strokeWidth="2"/></svg>
                        </button>
                        <button
                          title="حذف"
                          onClick={() => setDeleteProgressId(p._id)}
                          className="p-2 rounded hover:bg-red-100 dark:hover:bg-red-900"
                        >
                          <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><rect x="5" y="7" width="14" height="12" rx="2" stroke="#dc2626" strokeWidth="2"/><path d="M3 7h18M10 11v4M14 11v4M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="#dc2626" strokeWidth="2"/></svg>
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
      )}

      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setAddModalOpen(false)} />
          <div className="relative z-10 w-full max-w-lg bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 overflow-y-auto max-h-[80vh]">
            <div className="flex items-center justify-between mb-3">
              <div className="text-base font-semibold text-gray-900 dark:text-white">إضافة سجل تقدم</div>
              <button onClick={() => setAddModalOpen(false)} className="px-3 py-1.5 text-sm rounded-md bg-gray-200 dark:bg-gray-800 dark:text-white">إغلاق</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">اختر المدرب</label>
                <select
                  value={formTrainerId}
                  onChange={async e => {
                    const id = e.target.value;
                    setFormTrainerId(id);
                    setFormUserId('');
                    if (!id) { setFormUsersOfTrainer([]); return; }
                    // جلب العملاء المرتبطين بالمدرب فقط
                    const users = await userService.getClientsOfTrainer(id).catch(() => []);
                    setFormUsersOfTrainer(users);
                  }}
                  className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white"
                >
                  <option value="">— اختر —</option>
                  {trainers.map(r => (
                    <option key={r.trainer._id} value={r.trainer._id}>
                      {r.trainer.name} {r.trainer.phone ? `• ${r.trainer.phone}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">اختر العضو</label>
                <select
                  value={formUserId}
                  onChange={e => setFormUserId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white"
                  disabled={formMembersLoading}
                >
                  <option value="">— اختر —</option>
                  {formUsersOfTrainer.map(u => (
                    <option key={u._id} value={u._id}>
                      {(u.phone || 'بدون هاتف')} - {u.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">التاريخ</label>
                  <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">الوزن (كجم)</label>
                  <input type="number" value={formWeight} onChange={e => setFormWeight(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">نسبة الدهون %</label>
                  <input type="number" value={formBodyFat} onChange={e => setFormBodyFat(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">ملاحظات</label>
                  <input type="text" value={formNotes} onChange={e => setFormNotes(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white" />
                </div>
              </div>

              {/* 2. أضف الحقول الجديدة في نموذج الإضافة (داخل addModalOpen): */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">الكتلة العضلية (كجم)</label>
                  <input type="number" value={formMuscleMass} onChange={e => setFormMuscleMass(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">مقاس الوسط (سم)</label>
                  <input type="number" value={formWaist} onChange={e => setFormWaist(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">مقاس الصدر (سم)</label>
                  <input type="number" value={formChest} onChange={e => setFormChest(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">مقاس الذراع (سم)</label>
                  <input type="number" value={formArms} onChange={e => setFormArms(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">مقاس الرجل (سم)</label>
                  <input type="number" value={formLegs} onChange={e => setFormLegs(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">تغير الوزن عن السابق (كجم)</label>
                  <input type="number" value={formWeightChange} onChange={e => setFormWeightChange(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">تغير الدهون عن السابق (%)</label>
                  <input type="number" value={formFatChange} onChange={e => setFormFatChange(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">تغير الكتلة العضلية عن السابق (كجم)</label>
                  <input type="number" value={formMuscleChange} onChange={e => setFormMuscleChange(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">الحالة العامة</label>
                  <select value={formStatus} onChange={e => setFormStatus(e.target.value as any)} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white">
                    <option value="ممتاز">ممتاز</option>
                    <option value="جيد">جيد</option>
                    <option value="يحتاج لتحسين">يحتاج لتحسين</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">نصيحة المدرب</label>
                <input type="text" value={formAdvice} onChange={e => setFormAdvice(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white" />
              </div>

              {/* حقل رفع الصورة */}
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">صورة التقدم (اختيارية)</label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      handleImageChange(file, setFormImage, setFormImagePreview);
                    }}
                    className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white"
                  />
                  {formImagePreview && (
                    <div className="mt-2">
                      <img
                        src={formImagePreview}
                        alt="معاينة الصورة"
                        className="w-32 h-32 object-cover rounded-md border"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormImage(null);
                          setFormImagePreview(null);
                        }}
                        className="mt-1 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        إزالة الصورة
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setAddModalOpen(false)} className="px-3 py-2 text-sm rounded-md bg-gray-200 dark:bg-gray-800 dark:text-white">إلغاء</button>
                <button
                  onClick={async () => {
                    if (!formTrainerId || !formUserId || !formDate) return;
                    setSaving(true);
                    try {
                      const payload = {
                        userId: formUserId,
                        trainerId: formTrainerId,
                        date: new Date(formDate),
                        weight: formWeight ? Number(formWeight) : undefined,
                        bodyFatPercentage: formBodyFat ? Number(formBodyFat) : undefined,
                        muscleMass: formMuscleMass ? Number(formMuscleMass) : undefined,
                        waist: formWaist ? Number(formWaist) : undefined,
                        chest: formChest ? Number(formChest) : undefined,
                        arms: formArms ? Number(formArms) : undefined,
                        legs: formLegs ? Number(formLegs) : undefined,
                        weightChange: formWeightChange ? Number(formWeightChange) : undefined,
                        fatChange: formFatChange ? Number(formFatChange) : undefined,
                        muscleChange: formMuscleChange ? Number(formMuscleChange) : undefined,
                        status: formStatus,
                        advice: formAdvice,
                        notes: formNotes || '',
                      } as Omit<ClientProgress, '_id' | 'createdAt' | 'updatedAt'>;
                      const created = await progressService.create(payload, formImage);
                      // تحديث القائمة لو نفس المدرب مفتوح في المودال الآخر
                      if (selectedTrainer && selectedTrainer._id === formTrainerId) {
                        setTrainerProgress(prev => [created, ...prev]);
                      }
                      setAddModalOpen(false);
                      // reset
                      setFormTrainerId('');
                      setFormUserId('');
                      setFormUsersOfTrainer([]);
                      setFormDate('');
                      setFormWeight('');
                      setFormBodyFat('');
                      setFormNotes('');
                      setFormMuscleMass('');
                      setFormWaist('');
                      setFormChest('');
                      setFormArms('');
                      setFormLegs('');
                      setFormWeightChange('');
                      setFormFatChange('');
                      setFormMuscleChange('');
                      setFormStatus('جيد');
                      setFormAdvice('');
                      setFormImage(null);
                      setFormImagePreview(null);
                    } finally {
                      setSaving(false);
                    }
                  }}
                  className="px-3 py-2 text-sm rounded-md bg-gray-600 hover:bg-gray-700 text-white disabled:opacity-60"
                  disabled={!formTrainerId || !formUserId || !formDate || saving}
                >حفظ</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editProgressId && editProgressData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setEditProgressId(null); setEditProgressData(null); }} />
          <div className="relative z-10 bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md overflow-y-auto max-h-[80vh]">
            <button
              onClick={() => { setEditProgressId(null); setEditProgressData(null); }}
              className="absolute top-3 left-3 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">تعديل سجل التقدم</div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">التاريخ</label>
                <input type="date" value={editProgressData.date} onChange={e => setEditProgressData(d => d ? { ...d, date: e.target.value } : d)} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">الوزن (كجم)</label>
                <input type="number" value={editProgressData.weight} onChange={e => setEditProgressData(d => d ? { ...d, weight: e.target.value } : d)} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">نسبة الدهون %</label>
                <input type="number" value={editProgressData.bodyFat} onChange={e => setEditProgressData(d => d ? { ...d, bodyFat: e.target.value } : d)} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">ملاحظات</label>
                <input type="text" value={editProgressData.notes} onChange={e => setEditProgressData(d => d ? { ...d, notes: e.target.value } : d)} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">الكتلة العضلية (كجم)</label>
                <input type="number" value={editMuscleMass} onChange={e => setEditMuscleMass(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">مقاس الوسط (سم)</label>
                <input type="number" value={editWaist} onChange={e => setEditWaist(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">مقاس الصدر (سم)</label>
                <input type="number" value={editChest} onChange={e => setEditChest(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">مقاس الذراع (سم)</label>
                <input type="number" value={editArms} onChange={e => setEditArms(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">مقاس الرجل (سم)</label>
                <input type="number" value={editLegs} onChange={e => setEditLegs(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">تغير الوزن عن السابق (كجم)</label>
                <input type="number" value={editWeightChange} onChange={e => setEditWeightChange(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">تغير الدهون عن السابق (%)</label>
                <input type="number" value={editFatChange} onChange={e => setEditFatChange(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">تغير الكتلة العضلية عن السابق (كجم)</label>
                <input type="number" value={editMuscleChange} onChange={e => setEditMuscleChange(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">الحالة العامة</label>
                <select value={editStatus} onChange={e => setEditStatus(e.target.value as any)} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white">
                  <option value="ممتاز">ممتاز</option>
                  <option value="جيد">جيد</option>
                  <option value="يحتاج لتحسين">يحتاج لتحسين</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">نصيحة المدرب</label>
              <input type="text" value={editAdvice} onChange={e => setEditAdvice(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white" />
            </div>
            
            {/* حقل رفع الصورة في التعديل */}
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">صورة التقدم (اختيارية)</label>
              <div className="space-y-2">
                {/* عرض الصورة الحالية إذا كانت موجودة */}
                {(() => {
                  const progress = trainerProgress.find(p => p._id === editProgressId);
                  const currentImageUrl = progress?.image?.url;
                  return currentImageUrl && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-500 mb-1">الصورة الحالية:</p>
                      <img
                        src={currentImageUrl}
                        alt="الصورة الحالية"
                        className="w-32 h-32 object-cover rounded-md border"
                      />
                    </div>
                  );
                })()}
                
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    handleImageChange(file, setEditImage, setEditImagePreview);
                  }}
                  className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white"
                />
                {editImagePreview && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">الصورة الجديدة:</p>
                    <img
                      src={editImagePreview}
                      alt="معاينة الصورة الجديدة"
                      className="w-32 h-32 object-cover rounded-md border"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setEditImage(null);
                        setEditImagePreview(null);
                      }}
                      className="mt-1 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      إزالة الصورة الجديدة
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button onClick={() => { setEditProgressId(null); setEditProgressData(null); }} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-800">إلغاء</button>
              <button
                onClick={async () => {
                  const progress = trainerProgress.find(p => p._id === editProgressId);
                  const oldImagePublicId = progress?.image?.publicId;
                  
                  await handleUpdate(editProgressId, {
                    date: editProgressData.date ? new Date(editProgressData.date) : undefined,
                    weight: editProgressData.weight ? Number(editProgressData.weight) : undefined,
                    bodyFatPercentage: editProgressData.bodyFat ? Number(editProgressData.bodyFat) : undefined,
                    notes: editProgressData.notes || '',
                    muscleMass: editMuscleMass ? Number(editMuscleMass) : undefined,
                    waist: editWaist ? Number(editWaist) : undefined,
                    chest: editChest ? Number(editChest) : undefined,
                    arms: editArms ? Number(editArms) : undefined,
                    legs: editLegs ? Number(editLegs) : undefined,
                    weightChange: editWeightChange ? Number(editWeightChange) : undefined,
                    fatChange: editFatChange ? Number(editFatChange) : undefined,
                    muscleChange: editMuscleChange ? Number(editMuscleChange) : undefined,
                    status: editStatus,
                    advice: editAdvice,
                  }, editImage || undefined, oldImagePublicId);
                  setEditProgressId(null);
                  setEditProgressData(null);
                  setEditImage(null);
                  setEditImagePreview(null);
                }}
                className="px-4 py-2 rounded bg-gray-600 text-white disabled:opacity-60"
                disabled={!editProgressData.date}
              >تأكيد</button>
            </div>
          </div>
        </div>
      )}
      {deleteProgressId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteProgressId(null)} />
          <div className="relative z-10 bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
            <div className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">تأكيد حذف السجل</div>
            <div className="mb-6 text-gray-700 dark:text-gray-300">هل أنت متأكد أنك تريد حذف هذا السجل؟ لا يمكن التراجع.</div>
            <div className="flex justify-center gap-3">
              <button onClick={() => setDeleteProgressId(null)} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-800">إلغاء</button>
              <button onClick={async () => { await handleDelete(deleteProgressId); setDeleteProgressId(null); }} className="px-4 py-2 rounded bg-red-600 text-white">تأكيد الحذف</button>
            </div>
          </div>
        </div>
      )}
      {addProgressPopupOpen && selectedTrainer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setAddProgressPopupOpen(false); setAddProgressData(null); }} />
          <div className="relative z-10 bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md overflow-y-auto max-h-[80vh]">
            <div className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">إضافة سجل تقدم جديد</div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">اختر العضو</label>
                <select
                  value={addProgressData?.userId || ''}
                  onChange={e => setAddProgressData(d => ({ ...(d || {userId:'',date:'',weight:'',bodyFat:'',notes:''}), userId: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white"
                >
                  <option value="">— اختر —</option>
                  {trainerClients.map(u => (
                    <option key={u._id} value={u._id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">التاريخ</label>
                <input type="date" value={addProgressData?.date || ''} onChange={e => setAddProgressData(d => ({ ...(d || {userId:'',date:'',weight:'',bodyFat:'',notes:''}), date: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">الوزن (كجم)</label>
                <input type="number" value={addProgressData?.weight || ''} onChange={e => setAddProgressData(d => ({ ...(d || {userId:'',date:'',weight:'',bodyFat:'',notes:''}), weight: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">نسبة الدهون %</label>
                <input type="number" value={addProgressData?.bodyFat || ''} onChange={e => setAddProgressData(d => ({ ...(d || {userId:'',date:'',weight:'',bodyFat:'',notes:''}), bodyFat: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">ملاحظات</label>
                <input type="text" value={addProgressData?.notes || ''} onChange={e => setAddProgressData(d => ({ ...(d || {userId:'',date:'',weight:'',bodyFat:'',notes:''}), notes: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button onClick={() => { setAddProgressPopupOpen(false); setAddProgressData(null); }} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-800">إلغاء</button>
              <button
                onClick={async () => {
                  if (!addProgressData?.userId || !addProgressData?.date) return;
                  setSaving(true);
                  try {
                    const payload = {
                      userId: addProgressData.userId,
                      trainerId: selectedTrainer._id,
                      date: new Date(addProgressData.date),
                      weight: addProgressData.weight ? Number(addProgressData.weight) : undefined,
                      bodyFatPercentage: addProgressData.bodyFat ? Number(addProgressData.bodyFat) : undefined,
                      notes: addProgressData.notes || '',
                    };
                    const created = await progressService.create(payload);
                    setTrainerProgress(prev => [created, ...prev]);
                    setAddProgressPopupOpen(false);
                    setAddProgressData(null);
                  } finally {
                    setSaving(false);
                  }
                }}
                className="px-4 py-2 rounded bg-gray-600 text-white disabled:opacity-60"
                disabled={!addProgressData?.userId || !addProgressData?.date || saving}
              >حفظ</button>
            </div>
          </div>
        </div>
      )}
      {addMemberProgressPopup && selectedTrainer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setAddMemberProgressPopup(null)} />
          <div className="relative z-10 bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md overflow-y-auto max-h-[80vh]">
            <div className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">إضافة سجل جديد للعضو</div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">العضو</label>
                <input type="text" value={(() => {
                  const u = trainerClients.find(u => u._id === addMemberProgressPopup.userId);
                  return u ? u.name : '';
                })()} disabled className="w-full px-3 py-2 border rounded-md bg-gray-100 dark:bg-gray-800 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">التاريخ</label>
                <input type="date" value={addMemberProgressData.date} onChange={e => setAddMemberProgressData(d => ({ ...d, date: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">الوزن (كجم)</label>
                <input type="number" value={addMemberProgressData.weight} onChange={e => setAddMemberProgressData(d => ({ ...d, weight: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">نسبة الدهون %</label>
                <input type="number" value={addMemberProgressData.bodyFat} onChange={e => setAddMemberProgressData(d => ({ ...d, bodyFat: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">ملاحظات</label>
                <input type="text" value={addMemberProgressData.notes} onChange={e => setAddMemberProgressData(d => ({ ...d, notes: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">الكتلة العضلية (كجم)</label>
                <input type="number" value={addMemberMuscleMass} onChange={e => setAddMemberMuscleMass(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">مقاس الوسط (سم)</label>
                <input type="number" value={addMemberWaist} onChange={e => setAddMemberWaist(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">مقاس الصدر (سم)</label>
                <input type="number" value={addMemberChest} onChange={e => setAddMemberChest(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">مقاس الذراع (سم)</label>
                <input type="number" value={addMemberArms} onChange={e => setAddMemberArms(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">مقاس الرجل (سم)</label>
                <input type="number" value={addMemberLegs} onChange={e => setAddMemberLegs(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">تغير الوزن عن السابق (كجم)</label>
                <input type="number" value={addMemberWeightChange} onChange={e => setAddMemberWeightChange(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">تغير الدهون عن السابق (%)</label>
                <input type="number" value={addMemberFatChange} onChange={e => setAddMemberFatChange(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">تغير الكتلة العضلية عن السابق (كجم)</label>
                <input type="number" value={addMemberMuscleChange} onChange={e => setAddMemberMuscleChange(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">الحالة العامة</label>
                <select value={addMemberStatus} onChange={e => setAddMemberStatus(e.target.value as any)} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white">
                  <option value="ممتاز">ممتاز</option>
                  <option value="جيد">جيد</option>
                  <option value="يحتاج لتحسين">يحتاج لتحسين</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">نصيحة المدرب</label>
              <input type="text" value={addMemberAdvice} onChange={e => setAddMemberAdvice(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white" />
            </div>
            
            {/* حقل رفع الصورة في إضافة سجل للعضو */}
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">صورة التقدم (اختيارية)</label>
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    handleImageChange(file, setAddMemberImage, setAddMemberImagePreview);
                  }}
                  className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white"
                />
                {addMemberImagePreview && (
                  <div className="mt-2">
                    <img
                      src={addMemberImagePreview}
                      alt="معاينة الصورة"
                      className="w-32 h-32 object-cover rounded-md border"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setAddMemberImage(null);
                        setAddMemberImagePreview(null);
                      }}
                      className="mt-1 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      إزالة الصورة
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button onClick={() => { setAddMemberProgressPopup(null); setAddMemberMuscleMass(''); setAddMemberWaist(''); setAddMemberChest(''); setAddMemberArms(''); setAddMemberLegs(''); setAddMemberWeightChange(''); setAddMemberFatChange(''); setAddMemberMuscleChange(''); setAddMemberStatus('جيد'); setAddMemberAdvice(''); setAddMemberImage(null); setAddMemberImagePreview(null); }} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-800">إلغاء</button>
              <button
                onClick={async () => {
                  if (!addMemberProgressPopup.userId || !addMemberProgressData.date) return;
                  setSaving(true);
                  try {
                    const payload = {
                      userId: addMemberProgressPopup.userId,
                      trainerId: selectedTrainer._id,
                      date: new Date(addMemberProgressData.date),
                      weight: addMemberProgressData.weight ? Number(addMemberProgressData.weight) : undefined,
                      bodyFatPercentage: addMemberProgressData.bodyFat ? Number(addMemberProgressData.bodyFat) : undefined,
                      muscleMass: addMemberMuscleMass ? Number(addMemberMuscleMass) : undefined,
                      waist: addMemberWaist ? Number(addMemberWaist) : undefined,
                      chest: addMemberChest ? Number(addMemberChest) : undefined,
                      arms: addMemberArms ? Number(addMemberArms) : undefined,
                      legs: addMemberLegs ? Number(addMemberLegs) : undefined,
                      weightChange: addMemberWeightChange ? Number(addMemberWeightChange) : undefined,
                      fatChange: addMemberFatChange ? Number(addMemberFatChange) : undefined,
                      muscleChange: addMemberMuscleChange ? Number(addMemberMuscleChange) : undefined,
                      status: addMemberStatus,
                      advice: addMemberAdvice,
                      notes: addMemberProgressData.notes || '',
                    };
                    const created = await progressService.create(payload, addMemberImage);
                    setTrainerProgress(prev => [created, ...prev]);
                    setAddMemberProgressPopup(null);
                    setAddMemberImage(null);
                    setAddMemberImagePreview(null);
                  } finally {
                    setSaving(false);
                  }
                }}
                className="px-4 py-2 rounded bg-gray-600 text-white disabled:opacity-60"
                disabled={!addMemberProgressPopup.userId || !addMemberProgressData.date || saving}
              >حفظ</button>
            </div>
          </div>
        </div>
      )}
      {/* بوب أب التفاصيل الكاملة */}
      {selectedProgressDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedProgressDetails(null)} />
          <div className="relative z-10 bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-lg overflow-y-auto max-h-[80vh]">
            <div className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">تفاصيل سجل التقدم</div>
            <div className="grid grid-cols-2 gap-4">
              <div><span className="font-bold">التاريخ:</span> {new Date(selectedProgressDetails.date).toLocaleDateString()}</div>
              <div><span className="font-bold">الوزن:</span> {selectedProgressDetails.weight ?? '-'}</div>
              <div><span className="font-bold">نسبة الدهون:</span> {selectedProgressDetails.bodyFatPercentage ?? '-'}</div>
              <div><span className="font-bold">الكتلة العضلية:</span> {selectedProgressDetails.muscleMass ?? '-'}</div>
              <div><span className="font-bold">مقاس الوسط:</span> {selectedProgressDetails.waist ?? '-'}</div>
              <div><span className="font-bold">مقاس الصدر:</span> {selectedProgressDetails.chest ?? '-'}</div>
              <div><span className="font-bold">مقاس الذراع:</span> {selectedProgressDetails.arms ?? '-'}</div>
              <div><span className="font-bold">مقاس الرجل:</span> {selectedProgressDetails.legs ?? '-'}</div>
              <div><span className="font-bold">تغير الوزن:</span> {selectedProgressDetails.weightChange ?? '-'}</div>
              <div><span className="font-bold">تغير الدهون:</span> {selectedProgressDetails.fatChange ?? '-'}</div>
              <div><span className="font-bold">تغير الكتلة العضلية:</span> {selectedProgressDetails.muscleChange ?? '-'}</div>
              <div><span className="font-bold">الحالة العامة:</span> {selectedProgressDetails.status ?? '-'}</div>
              <div className="col-span-2"><span className="font-bold">ملاحظات:</span> {selectedProgressDetails.notes ?? '-'}</div>
              <div className="col-span-2"><span className="font-bold">نصيحة المدرب:</span> {selectedProgressDetails.advice ?? '-'}</div>
              {/* عرض الصورة إذا كانت موجودة */}
              {selectedProgressDetails.image?.url && (
                <div className="col-span-2">
                  <span className="font-bold">صورة التقدم:</span>
                  <div className="mt-2">
                    <img
                      src={selectedProgressDetails.image.url}
                      alt="صورة التقدم"
                      className="w-64 h-64 object-cover rounded-md border"
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={() => setSelectedProgressDetails(null)} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-800">إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProgress;


