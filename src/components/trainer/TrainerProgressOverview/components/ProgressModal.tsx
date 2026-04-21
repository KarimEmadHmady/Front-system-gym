'use client';

import React, { useState } from 'react';
import { Download, Plus, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import type { User } from '@/types/models';
import type { ProgressRecord, ProgressFormData } from '../types/progress.types';
import ProgressRecordCard from './ProgressRecordCard';
import AddProgressModal from './AddProgressModal';
import EditProgressModal from './EditProgressModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import { ProgressService } from '@/services/progressService';

const progressService = new ProgressService();

interface ProgressModalProps {
  client: User;
  records: ProgressRecord[];
  loading: boolean;
  currentTrainerId: string;
  onClose: () => void;
  onRecordsChange: (records: ProgressRecord[]) => void;
  setLoading: (v: boolean) => void;
}

const validStatus = ["ممتاز", "جيد", "يحتاج لتحسين"] as const;
type StatusType = typeof validStatus[number];

const normalizeStatus = (status: any): StatusType => {
  return validStatus.includes(status) ? status : "جيد";
};

const ProgressModal: React.FC<ProgressModalProps> = ({
  client,
  records,
  loading,
  currentTrainerId,
  onClose,
  onRecordsChange,
  setLoading,
}) => {
  const [addOpen, setAddOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<ProgressRecord | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const reload = async () => {
    const list = await progressService.getUserProgress(client._id);
    onRecordsChange(list);
  };

  const handleAdd = async (data: ProgressFormData, image: File | null) => {
    setLoading(true);
    try {
      await progressService.create({
        userId: client._id,
        trainerId: currentTrainerId,
        date: new Date(data.date),
        weight: data.weight ? Number(data.weight) : undefined,
        bodyFatPercentage: data.bodyFatPercentage ? Number(data.bodyFatPercentage) : undefined,
        muscleMass: data.muscleMass ? Number(data.muscleMass) : undefined,
        waist: data.waist ? Number(data.waist) : undefined,
        chest: data.chest ? Number(data.chest) : undefined,
        arms: data.arms ? Number(data.arms) : undefined,
        legs: data.legs ? Number(data.legs) : undefined,
        weightChange: data.weightChange ? Number(data.weightChange) : undefined,
        fatChange: data.fatChange ? Number(data.fatChange) : undefined,
        muscleChange: data.muscleChange ? Number(data.muscleChange) : undefined,
        status: normalizeStatus(data.status),
        advice: data.advice || '',
        notes: data.notes || '',
      }, image);
      await reload();
      setAddOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (
    id: string,
    data: ProgressFormData,
    image: File | null | undefined,
    oldImagePublicId?: string
  ) => {
    setLoading(true);
    try {
      await progressService.update(id, {
        date: data.date ? new Date(data.date) : undefined,
        weight: data.weight ? Number(data.weight) : undefined,
        bodyFatPercentage: data.bodyFatPercentage ? Number(data.bodyFatPercentage) : undefined,
        muscleMass: data.muscleMass ? Number(data.muscleMass) : undefined,
        waist: data.waist ? Number(data.waist) : undefined,
        chest: data.chest ? Number(data.chest) : undefined,
        arms: data.arms ? Number(data.arms) : undefined,
        legs: data.legs ? Number(data.legs) : undefined,
        weightChange: data.weightChange ? Number(data.weightChange) : undefined,
        fatChange: data.fatChange ? Number(data.fatChange) : undefined,
        muscleChange: data.muscleChange ? Number(data.muscleChange) : undefined,
        status: normalizeStatus(data.status),
        advice: data.advice || '',
        notes: data.notes || '',
      }, image, oldImagePublicId);
      await reload();
      setEditRecord(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    try {
      await progressService.delete(deleteId);
      await reload();
      setDeleteId(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const data = records.map((p) => ({
      'التاريخ': p.date ? new Date(p.date).toLocaleDateString() : '-',
      'الوزن': p.weight ?? '-',
      'نسبة الدهون': p.bodyFatPercentage ?? '-',
      'الكتلة العضلية': p.muscleMass ?? '-',
      'مقاس الوسط': p.waist ?? '-',
      'مقاس الصدر': p.chest ?? '-',
      'مقاس الذراع': p.arms ?? '-',
      'مقاس الرجل': p.legs ?? '-',
      'تغير الوزن': p.weightChange ?? '-',
      'تغير الدهون': p.fatChange ?? '-',
      'تغير الكتلة العضلية': p.muscleChange ?? '-',
      'الحالة العامة': p.status ?? '-',
      'نصيحة المدرب': p.advice ?? '-',
      'ملاحظات': p.notes || '-',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Progress');
    XLSX.writeFile(wb, `progress_${client.name || 'client'}.xlsx`);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative z-10 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
            <div>
              <h2 className="text-base font-semibold text-white">سجلات التقدم</h2>
              <p className="text-xs text-slate-400 mt-0.5">{client.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 transition-colors sm:px-3 sm:py-2 px-2 py-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">تصدير</span>
              </button>
              <button
                onClick={() => setAddOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors sm:px-3 sm:py-2 px-2 py-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">إضافة سجل</span>
              </button>
              <button onClick={onClose} className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-slate-400">جاري التحميل...</p>
              </div>
            ) : records.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <p className="text-slate-500 text-sm">لا يوجد سجلات تقدم</p>
                <button
                  onClick={() => setAddOpen(true)}
                  className="mt-2 px-4 py-2 text-xs bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 rounded-lg hover:bg-emerald-600 hover:text-white transition-colors"
                >
                  أضف أول سجل
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {records.map((record) => (
                  <ProgressRecordCard
                    key={record._id}
                    record={record}
                    onEdit={setEditRecord}
                    onDelete={setDeleteId}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {addOpen && (
        <AddProgressModal
          loading={loading}
          onClose={() => setAddOpen(false)}
          onSave={handleAdd}
        />
      )}

      {editRecord && (
        <EditProgressModal
          record={editRecord}
          loading={loading}
          onClose={() => setEditRecord(null)}
          onSave={handleEdit}
        />
      )}

      {deleteId && (
        <DeleteConfirmModal
          loading={loading}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
};

export default ProgressModal;