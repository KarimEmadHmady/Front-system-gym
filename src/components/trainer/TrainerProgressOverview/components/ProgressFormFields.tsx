'use client';

import React from 'react';
import type { ProgressFormData } from '../types/progress.types';

interface ProgressFormFieldsProps {
  data: ProgressFormData;
  onChange: (updated: ProgressFormData) => void;
  imagePreview: string | null;
  currentImageUrl?: string;
  onImageChange: (file: File | null) => void;
  onRemoveImage: () => void;
}

const inputCls =
  'w-full px-3 py-2 text-sm border border-slate-600 rounded-lg bg-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors';

const labelCls = 'block text-xs font-medium text-slate-400 mb-1';

const ProgressFormFields: React.FC<ProgressFormFieldsProps> = ({
  data,
  onChange,
  imagePreview,
  currentImageUrl,
  onImageChange,
  onRemoveImage,
}) => {
  const set = (key: keyof ProgressFormData, value: string) =>
    onChange({ ...data, [key]: value });

  return (
    <div className="space-y-4">
      {/* Date */}
      <div>
        <label className={labelCls}>التاريخ *</label>
        <input
          type="date"
          value={data.date}
          onClick={(e) => e.currentTarget.showPicker?.()}
          onChange={(e) => set('date', e.target.value)}
          className={inputCls}
        />
      </div>

      {/* Weight & Fat */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>الوزن (كجم)</label>
          <input type="number" value={data.weight} onChange={(e) => set('weight', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>نسبة الدهون %</label>
          <input type="number" value={data.bodyFatPercentage} onChange={(e) => set('bodyFatPercentage', e.target.value)} className={inputCls} />
        </div>
      </div>

      {/* Body Composition */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>الكتلة العضلية (كجم)</label>
          <input type="number" value={data.muscleMass || ''} onChange={(e) => set('muscleMass', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>مقاس الوسط (سم)</label>
          <input type="number" value={data.waist || ''} onChange={(e) => set('waist', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>مقاس الصدر (سم)</label>
          <input type="number" value={data.chest || ''} onChange={(e) => set('chest', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>مقاس الذراع (سم)</label>
          <input type="number" value={data.arms || ''} onChange={(e) => set('arms', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>مقاس الرجل (سم)</label>
          <input type="number" value={data.legs || ''} onChange={(e) => set('legs', e.target.value)} className={inputCls} />
        </div>
      </div>

      {/* Changes */}
      <div className="border-t border-slate-700 pt-3">
        <p className="text-xs text-slate-500 mb-3 uppercase tracking-wide font-medium">التغيرات عن السابق</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>تغير الوزن (كجم)</label>
            <input type="number" value={data.weightChange || ''} onChange={(e) => set('weightChange', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>تغير الدهون (%)</label>
            <input type="number" value={data.fatChange || ''} onChange={(e) => set('fatChange', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>تغير الكتلة العضلية (كجم)</label>
            <input type="number" value={data.muscleChange || ''} onChange={(e) => set('muscleChange', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>الحالة العامة</label>
            <select
              value={data.status || 'جيد'}
              onChange={(e) => set('status', e.target.value)}
              className={inputCls}
            >
              <option value="ممتاز">ممتاز</option>
              <option value="جيد">جيد</option>
              <option value="يحتاج لتحسين">يحتاج لتحسين</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notes & Advice */}
      <div>
        <label className={labelCls}>نصيحة المدرب</label>
        <input type="text" value={data.advice || ''} onChange={(e) => set('advice', e.target.value)} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>ملاحظات</label>
        <input type="text" value={data.notes} onChange={(e) => set('notes', e.target.value)} className={inputCls} />
      </div>

      {/* Image Upload */}
      <div className="border-t border-slate-700 pt-3">
        <label className={labelCls}>صورة التقدم (اختيارية)</label>

        {currentImageUrl && !imagePreview && (
          <div className="mb-2">
            <p className="text-xs text-slate-500 mb-1">الصورة الحالية:</p>
            <img src={currentImageUrl} alt="الصورة الحالية" className="w-28 h-28 object-cover rounded-lg border border-slate-600" />
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={(e) => onImageChange(e.target.files?.[0] || null)}
          className="w-full text-sm text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-emerald-600/20 file:text-emerald-400 hover:file:bg-emerald-600/30 cursor-pointer"
        />

        {imagePreview && (
          <div className="mt-2 flex items-start gap-3">
            <img src={imagePreview} alt="معاينة" className="w-28 h-28 object-cover rounded-lg border border-slate-600" />
            <button
              type="button"
              onClick={onRemoveImage}
              className="mt-1 px-2 py-1 text-xs bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
            >
              إزالة
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressFormFields;