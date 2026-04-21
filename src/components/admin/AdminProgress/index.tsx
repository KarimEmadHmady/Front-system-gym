'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { ClientProgress, User } from '@/types/models';
import { userService } from '@/services';
import { ProgressService } from '@/services/progressService';
import * as XLSX from 'xlsx';
import VideoTutorial from '@/components/VideoTutorial';

import type { TrainerRow } from './types';
import type { ProgressFields } from './ProgressFormFields';
import TrainersTable from './TrainersTable';
import TrainerDetailsModal from './TrainerDetailsModal';
import AddProgressModal from './AddProgressModal';
import AddMemberProgressModal from './AddMemberProgressModal';
import EditProgressModal from './EditProgressModal';
import { DeleteProgressModal, ProgressDetailsModal } from './ProgressModals';

const progressService = new ProgressService();

const EMPTY_EXTRA_FIELDS: ProgressFields = {
  muscleMass: '', waist: '', chest: '', arms: '', legs: '',
  weightChange: '', fatChange: '', muscleChange: '',
  status: 'جيد', advice: '',
};

const AdminProgress = () => {
  const [loading, setLoading] = useState(false);
  const [trainers, setTrainers] = useState<TrainerRow[]>([]);
  const [query, setQuery] = useState('');
  const [selectedTrainer, setSelectedTrainer] = useState<User | null>(null);
  const [trainerClients, setTrainerClients] = useState<User[]>([]);
  const [trainerProgress, setTrainerProgress] = useState<ClientProgress[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Add Progress Modal (top-level button)
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [formTrainerId, setFormTrainerId] = useState('');
  const [formUserId, setFormUserId] = useState('');
  const [formUsersOfTrainer, setFormUsersOfTrainer] = useState<User[]>([]);
  const [allMembersForForm, setAllMembersForForm] = useState<User[]>([]);
  const [formMembersLoading, setFormMembersLoading] = useState(false);
  const [formDate, setFormDate] = useState('');
  const [formWeight, setFormWeight] = useState('');
  const [formBodyFat, setFormBodyFat] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formExtraFields, setFormExtraFields] = useState<ProgressFields>({ ...EMPTY_EXTRA_FIELDS });
  const [formImage, setFormImage] = useState<File | null>(null);
  const [formImagePreview, setFormImagePreview] = useState<string | null>(null);

  // Add Member Progress Modal (from trainer details)
  const [addMemberProgressPopup, setAddMemberProgressPopup] = useState<{ userId: string } | null>(null);
  const [addMemberBaseData, setAddMemberBaseData] = useState({ date: '', weight: '', bodyFat: '', notes: '' });
  const [addMemberExtraFields, setAddMemberExtraFields] = useState<ProgressFields>({ ...EMPTY_EXTRA_FIELDS });
  const [addMemberImage, setAddMemberImage] = useState<File | null>(null);
  const [addMemberImagePreview, setAddMemberImagePreview] = useState<string | null>(null);

  // Edit Modal
  const [editProgressId, setEditProgressId] = useState<string | null>(null);
  const [editData, setEditData] = useState<{ date: string; weight: string; bodyFat: string; notes: string } | null>(null);
  const [editExtraFields, setEditExtraFields] = useState<ProgressFields>({ ...EMPTY_EXTRA_FIELDS });
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);

  // Delete & Details
  const [deleteProgressId, setDeleteProgressId] = useState<string | null>(null);
  const [selectedProgressDetails, setSelectedProgressDetails] = useState<ClientProgress | null>(null);

  // ── helpers ──────────────────────────────────────────────────────────────
  const handleImageChange = (
    file: File | null,
    setImage: (f: File | null) => void,
    setPreview: (p: string | null) => void,
  ) => {
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = e => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  // ── data loading ─────────────────────────────────────────────────────────
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
          const latestProgressDate = progress?.length > 0 ? new Date(progress[0].date as any).toISOString() : undefined;
          rows.push({ trainer: t, clientsCount: clients.length, progressCount: progress.length, latestProgressDate });
        }
        setTrainers(rows);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  useEffect(() => {
    if (!addModalOpen || trainers.length > 0) return;
    (async () => {
      try {
        const trainersRes = await userService.getUsersByRole('trainer', { limit: 100 } as any);
        const tdata = (trainersRes as any).data || (trainersRes as any);
        const trainersOnly: User[] = (tdata?.items || tdata || []) as any[];
        setTrainers(prev => prev.length ? prev : trainersOnly.map(t => ({ trainer: t, clientsCount: 0, progressCount: 0 })));
      } catch {}
    })();
  }, [addModalOpen, trainers.length]);

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

  useEffect(() => {
    if (!formTrainerId || formUsersOfTrainer.length > 0) return;
    const normalizeId = (val: any): string => {
      if (!val) return '';
      if (typeof val === 'string') return val;
      if (typeof val === 'object') return val._id || (val as any).id || '';
      return String(val);
    };
    const filtered = allMembersForForm.filter(u => normalizeId((u as any).trainerId) === formTrainerId);
    if (filtered.length > 0) setFormUsersOfTrainer(filtered);
  }, [formTrainerId, allMembersForForm, formUsersOfTrainer.length]);

  // fill edit extra fields when edit opens
  useEffect(() => {
    if (!editProgressId) return;
    const p = trainerProgress.find(x => x._id === editProgressId);
    if (p) {
      setEditExtraFields({
        muscleMass: p.muscleMass?.toString() ?? '',
        waist: p.waist?.toString() ?? '',
        chest: p.chest?.toString() ?? '',
        arms: p.arms?.toString() ?? '',
        legs: p.legs?.toString() ?? '',
        weightChange: p.weightChange?.toString() ?? '',
        fatChange: p.fatChange?.toString() ?? '',
        muscleChange: p.muscleChange?.toString() ?? '',
        status: p.status ?? 'جيد',
        advice: p.advice ?? '',
      });
    }
  }, [editProgressId, trainerProgress]);

  // ── filtered trainers ────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return trainers;
    return trainers.filter(r =>
      r.trainer.name?.toLowerCase().includes(q) ||
      r.trainer.email?.toLowerCase().includes(q) ||
      r.trainer.phone?.toLowerCase().includes(q),
    );
  }, [query, trainers]);

  // ── CRUD ─────────────────────────────────────────────────────────────────
  const openTrainer = async (t: User) => {
    setSelectedTrainer(t);
    setModalOpen(true);
    setFormUserId('');
    setSaving(true);
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

  const handleCreate = async (
    payload: Omit<ClientProgress, '_id' | 'createdAt' | 'updatedAt'>,
    imageFile?: File,
  ) => {
    setSaving(true);
    try {
      const created = await progressService.create(payload, imageFile);
      setTrainerProgress(prev => [created, ...prev]);
      return created;
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: string, data: Partial<ClientProgress>, imageFile?: File, oldPublicId?: string) => {
    setSaving(true);
    try {
      const updated = await progressService.update(id, data, imageFile, oldPublicId);
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

  // ── Export helpers ────────────────────────────────────────────────────────
  const handleExportClientProgress = (clientId: string) => {
    const client = trainerClients.find(c => c._id === clientId);
    const data = trainerProgress.filter(p => p.userId === clientId).map(progress => ({
      'اسم العميل': client?.name || '---',
      'هاتف العميل': client?.phone || '-',
      'إيميل العميل': client?.email || '-',
      'التاريخ': new Date(progress.date).toLocaleDateString('en-GB'),
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
      'ملاحظات': progress.notes || '-',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `تقدم_${client?.name || 'عميل'}`);
    XLSX.writeFile(wb, `تقدم_${client?.name || 'عميل'}_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.xlsx`);
  };

  const handleExportTrainerProgress = (trainerId: string) => {
    const trainer = trainers.find(t => t.trainer._id === trainerId);
    const data = trainerProgress.map(progress => {
      const client = trainerClients.find(c => c._id === progress.userId);
      return {
        'اسم المدرب': trainer?.trainer.name || '---',
        'هاتف المدرب': trainer?.trainer.phone || '-',
        'إيميل المدرب': trainer?.trainer.email || '-',
        'اسم العميل': client?.name || '---',
        'هاتف العميل': client?.phone || '-',
        'إيميل العميل': client?.email || '-',
        'التاريخ': new Date(progress.date).toLocaleDateString('en-GB'),
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
        'ملاحظات': progress.notes || '-',
      };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `تقدم_${trainer?.trainer.name || 'مدرب'}`);
    XLSX.writeFile(wb, `تقدم_${trainer?.trainer.name || 'مدرب'}_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.xlsx`);
  };

  // ── reset helpers ─────────────────────────────────────────────────────────
  const resetAddForm = () => {
    setFormTrainerId(''); setFormUserId(''); setFormUsersOfTrainer([]);
    setFormDate(''); setFormWeight(''); setFormBodyFat(''); setFormNotes('');
    setFormExtraFields({ ...EMPTY_EXTRA_FIELDS });
    setFormImage(null); setFormImagePreview(null);
  };

  const resetAddMemberForm = () => {
    setAddMemberBaseData({ date: '', weight: '', bodyFat: '', notes: '' });
    setAddMemberExtraFields({ ...EMPTY_EXTRA_FIELDS });
    setAddMemberImage(null); setAddMemberImagePreview(null);
  };

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <>
      <VideoTutorial
        videoId="kVBMpJAjK7U"
        title="كل عميل يقدر يشوف تطوره لحظة بلحظة"
        position="bottom-right"
        buttonText="شرح"
      />

      <TrainersTable
        loading={loading}
        filtered={filtered}
        query={query}
        setQuery={setQuery}
        onOpenTrainer={openTrainer}
        onExportTrainer={handleExportTrainerProgress}
        onAddProgress={() => setAddModalOpen(true)}
      />

      {/* Trainer Details Modal */}
      {modalOpen && selectedTrainer && (
        <TrainerDetailsModal
          selectedTrainer={selectedTrainer}
          trainerClients={trainerClients}
          trainerProgress={trainerProgress}
          saving={saving}
          formUserId={formUserId}
          setFormUserId={setFormUserId}
          onClose={() => setModalOpen(false)}
          onLoadClientProgress={async (clientId) => {
            setSaving(true);
            try {
              const list = await progressService.getUserProgress(clientId);
              setTrainerProgress(list);
            } finally {
              setSaving(false);
            }
          }}
          onExportClient={handleExportClientProgress}
          onAddMemberProgress={(userId) => {
            setAddMemberProgressPopup({ userId });
            resetAddMemberForm();
          }}
          onViewDetails={setSelectedProgressDetails}
          onEditProgress={(p) => {
            setEditProgressId(p._id);
            setEditData({
              date: new Date(p.date).toISOString().slice(0, 10),
              weight: p.weight?.toString() ?? '',
              bodyFat: p.bodyFatPercentage?.toString() ?? '',
              notes: p.notes ?? '',
            });
          }}
          onDeleteProgress={setDeleteProgressId}
        />
      )}

      {/* Add Progress Modal */}
      {addModalOpen && (
        <AddProgressModal
          trainers={trainers}
          formTrainerId={formTrainerId}
          setFormTrainerId={setFormTrainerId}
          formUserId={formUserId}
          setFormUserId={setFormUserId}
          formUsersOfTrainer={formUsersOfTrainer}
          formMembersLoading={formMembersLoading}
          onTrainerChange={async (id) => {
            setFormTrainerId(id);
            setFormUserId('');
            if (!id) { setFormUsersOfTrainer([]); return; }
            const users = await userService.getClientsOfTrainer(id).catch(() => []);
            setFormUsersOfTrainer(users);
          }}
          formDate={formDate}
          setFormDate={setFormDate}
          formWeight={formWeight}
          setFormWeight={setFormWeight}
          formBodyFat={formBodyFat}
          setFormBodyFat={setFormBodyFat}
          formNotes={formNotes}
          setFormNotes={setFormNotes}
          extraFields={formExtraFields}
          onExtraFieldsChange={(f) => setFormExtraFields(prev => ({ ...prev, ...f }))}
          imagePreview={formImagePreview}
          onImageChange={(file) => handleImageChange(file, setFormImage, setFormImagePreview)}
          onImageRemove={() => { setFormImage(null); setFormImagePreview(null); }}
          saving={saving}
          onClose={() => { setAddModalOpen(false); resetAddForm(); }}
          onSave={async () => {
            if (!formTrainerId || !formUserId || !formDate) return;
            const payload = {
              userId: formUserId,
              trainerId: formTrainerId,
              date: new Date(formDate),
              weight: formWeight ? Number(formWeight) : undefined,
              bodyFatPercentage: formBodyFat ? Number(formBodyFat) : undefined,
              muscleMass: formExtraFields.muscleMass ? Number(formExtraFields.muscleMass) : undefined,
              waist: formExtraFields.waist ? Number(formExtraFields.waist) : undefined,
              chest: formExtraFields.chest ? Number(formExtraFields.chest) : undefined,
              arms: formExtraFields.arms ? Number(formExtraFields.arms) : undefined,
              legs: formExtraFields.legs ? Number(formExtraFields.legs) : undefined,
              weightChange: formExtraFields.weightChange ? Number(formExtraFields.weightChange) : undefined,
              fatChange: formExtraFields.fatChange ? Number(formExtraFields.fatChange) : undefined,
              muscleChange: formExtraFields.muscleChange ? Number(formExtraFields.muscleChange) : undefined,
              status: formExtraFields.status,
              advice: formExtraFields.advice,
              notes: formNotes || '',
            } as Omit<ClientProgress, '_id' | 'createdAt' | 'updatedAt'>;
            const created = await handleCreate(payload, formImage ?? undefined);
            if (selectedTrainer?._id === formTrainerId && created) {
              setTrainerProgress(prev => [created, ...prev]);
            }
            setAddModalOpen(false);
            resetAddForm();
          }}
        />
      )}

      {/* Add Member Progress Modal */}
      {addMemberProgressPopup && selectedTrainer && (
        <AddMemberProgressModal
          userId={addMemberProgressPopup.userId}
          trainerClients={trainerClients}
          baseData={addMemberBaseData}
          onBaseDataChange={(d) => setAddMemberBaseData(prev => ({ ...prev, ...d }))}
          extraFields={addMemberExtraFields}
          onExtraFieldsChange={(f) => setAddMemberExtraFields(prev => ({ ...prev, ...f }))}
          imagePreview={addMemberImagePreview}
          onImageChange={(file) => handleImageChange(file, setAddMemberImage, setAddMemberImagePreview)}
          onImageRemove={() => { setAddMemberImage(null); setAddMemberImagePreview(null); }}
          saving={saving}
          onClose={() => { setAddMemberProgressPopup(null); resetAddMemberForm(); }}
          onSave={async () => {
            if (!addMemberProgressPopup.userId || !addMemberBaseData.date) return;
            const payload = {
              userId: addMemberProgressPopup.userId,
              trainerId: selectedTrainer._id,
              date: new Date(addMemberBaseData.date),
              weight: addMemberBaseData.weight ? Number(addMemberBaseData.weight) : undefined,
              bodyFatPercentage: addMemberBaseData.bodyFat ? Number(addMemberBaseData.bodyFat) : undefined,
              muscleMass: addMemberExtraFields.muscleMass ? Number(addMemberExtraFields.muscleMass) : undefined,
              waist: addMemberExtraFields.waist ? Number(addMemberExtraFields.waist) : undefined,
              chest: addMemberExtraFields.chest ? Number(addMemberExtraFields.chest) : undefined,
              arms: addMemberExtraFields.arms ? Number(addMemberExtraFields.arms) : undefined,
              legs: addMemberExtraFields.legs ? Number(addMemberExtraFields.legs) : undefined,
              weightChange: addMemberExtraFields.weightChange ? Number(addMemberExtraFields.weightChange) : undefined,
              fatChange: addMemberExtraFields.fatChange ? Number(addMemberExtraFields.fatChange) : undefined,
              muscleChange: addMemberExtraFields.muscleChange ? Number(addMemberExtraFields.muscleChange) : undefined,
              status: addMemberExtraFields.status,
              advice: addMemberExtraFields.advice,
              notes: addMemberBaseData.notes || '',
            };
            await handleCreate(payload as any, addMemberImage ?? undefined);
            setAddMemberProgressPopup(null);
            resetAddMemberForm();
          }}
        />
      )}

      {/* Edit Progress Modal */}
      {editProgressId && editData && (
        <EditProgressModal
          editData={editData}
          onEditDataChange={(d) => setEditData(prev => prev ? { ...prev, ...d } : prev)}
          extraFields={editExtraFields}
          onExtraFieldsChange={(f) => setEditExtraFields(prev => ({ ...prev, ...f }))}
          currentImageUrl={trainerProgress.find(p => p._id === editProgressId)?.image?.url}
          imagePreview={editImagePreview}
          onImageChange={(file) => handleImageChange(file, setEditImage, setEditImagePreview)}
          onImageRemove={() => { setEditImage(null); setEditImagePreview(null); }}
          onClose={() => { setEditProgressId(null); setEditData(null); setEditImage(null); setEditImagePreview(null); }}
          onSave={async () => {
            if (!editData.date) return;
            const oldPublicId = trainerProgress.find(p => p._id === editProgressId)?.image?.publicId;
            await handleUpdate(editProgressId!, {
              date: new Date(editData.date),
              weight: editData.weight ? Number(editData.weight) : undefined,
              bodyFatPercentage: editData.bodyFat ? Number(editData.bodyFat) : undefined,
              notes: editData.notes || '',
              muscleMass: editExtraFields.muscleMass ? Number(editExtraFields.muscleMass) : undefined,
              waist: editExtraFields.waist ? Number(editExtraFields.waist) : undefined,
              chest: editExtraFields.chest ? Number(editExtraFields.chest) : undefined,
              arms: editExtraFields.arms ? Number(editExtraFields.arms) : undefined,
              legs: editExtraFields.legs ? Number(editExtraFields.legs) : undefined,
              weightChange: editExtraFields.weightChange ? Number(editExtraFields.weightChange) : undefined,
              fatChange: editExtraFields.fatChange ? Number(editExtraFields.fatChange) : undefined,
              muscleChange: editExtraFields.muscleChange ? Number(editExtraFields.muscleChange) : undefined,
              status: editExtraFields.status,
              advice: editExtraFields.advice,
            }, editImage ?? undefined, oldPublicId);
            setEditProgressId(null); setEditData(null);
            setEditImage(null); setEditImagePreview(null);
          }}
        />
      )}

      {/* Delete Confirmation */}
      {deleteProgressId && (
        <DeleteProgressModal
          onClose={() => setDeleteProgressId(null)}
          onConfirm={async () => {
            await handleDelete(deleteProgressId);
            setDeleteProgressId(null);
          }}
        />
      )}

      {/* Progress Details */}
      {selectedProgressDetails && (
        <ProgressDetailsModal
          progress={selectedProgressDetails}
          onClose={() => setSelectedProgressDetails(null)}
        />
      )}
    </>
  );
};

export default AdminProgress;