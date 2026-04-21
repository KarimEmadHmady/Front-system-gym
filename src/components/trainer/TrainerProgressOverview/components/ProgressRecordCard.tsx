'use client';

import React from 'react';
import type { ProgressRecord } from '../types/progress.types';

interface ProgressRecordCardProps {
  record: ProgressRecord;
  onEdit: (record: ProgressRecord) => void;
  onDelete: (id: string) => void;
}

const Stat: React.FC<{ label: string; value?: string | number | null; unit?: string; change?: number; changeUnit?: string }> = ({
  label,
  value,
  unit = '',
  change,
  changeUnit = '',
}) => (
  <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-3 text-center">
    <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5 font-medium">{label}</div>
    <div className="font-bold text-sm text-white">
      {value != null ? `${value} ${unit}`.trim() : <span className="text-slate-600">—</span>}
    </div>
    {change != null && (
      <div className={`text-[11px] mt-0.5 font-medium ${change > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
        {change > 0 ? '+' : ''}{change} {changeUnit}
      </div>
    )}
  </div>
);

const statusColors: Record<string, string> = {
  'ممتاز': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  'جيد': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  'يحتاج لتحسين': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
};

const ProgressRecordCard: React.FC<ProgressRecordCardProps> = ({ record, onEdit, onDelete }) => {
  const dateObj = record.date ? new Date(record.date) : null;
  const statusCls = record.status ? (statusColors[record.status] || 'bg-slate-700 text-slate-400 border-slate-600') : 'bg-slate-700 text-slate-400 border-slate-600';

  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 hover:border-slate-600 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 border border-slate-600 rounded-xl flex items-center justify-center shadow-inner">
            <span className="text-white font-bold text-sm tabular-nums">
              {dateObj ? dateObj.getDate() : '?'}
            </span>
          </div>
          <div>
            <p className="font-semibold text-white text-sm">
              {dateObj ? dateObj.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) : 'بدون تاريخ'}
            </p>
            {record.status && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusCls} mt-0.5`}>
                {record.status}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(record)}
            className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white text-xs font-medium border border-slate-600 transition-all"
          >
            تعديل
          </button>
          <button
            onClick={() => onDelete(record._id)}
            className="px-3 py-1.5 rounded-lg bg-red-600/10 hover:bg-red-600 border border-red-500/30 hover:border-red-500 text-red-400 hover:text-white text-xs font-medium transition-all"
          >
            حذف
          </button>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        <Stat label="الوزن" value={record.weight} unit="كجم" change={record.weightChange} changeUnit="كجم" />
        <Stat label="نسبة الدهون" value={record.bodyFatPercentage} unit="%" change={record.fatChange} changeUnit="%" />
        <Stat label="الكتلة العضلية" value={record.muscleMass} unit="كجم" change={record.muscleChange} changeUnit="كجم" />
        <Stat label="مقاس الوسط" value={record.waist} unit="سم" />
      </div>

      {/* Body Measurements */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <Stat label="الصدر" value={record.chest} unit="سم" />
        <Stat label="الذراع" value={record.arms} unit="سم" />
        <Stat label="الرجل" value={record.legs} unit="سم" />
      </div>

      {/* Notes & Advice */}
      {(record.advice || record.notes) && (
        <div className="space-y-2 mb-3">
          {record.advice && (
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3">
              <p className="text-[10px] uppercase tracking-wider text-emerald-500/70 font-medium mb-1">نصيحة المدرب</p>
              <p className="text-sm text-slate-300">{record.advice}</p>
            </div>
          )}
          {record.notes && (
            <div className="bg-slate-900/40 border border-slate-700/50 rounded-xl p-3">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium mb-1">ملاحظات</p>
              <p className="text-sm text-slate-400">{record.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Progress Image */}
      {record.image?.url && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium mb-2">صورة التقدم</p>
          <img
            src={record.image.url}
            alt="صورة التقدم"
            className="w-full max-w-[200px] rounded-xl border border-slate-700 object-cover"
          />
        </div>
      )}
    </div>
  );
};

export default ProgressRecordCard;