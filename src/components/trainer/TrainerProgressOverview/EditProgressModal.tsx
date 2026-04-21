'use client';

import React, { useState } from 'react';
import { progressService } from '@/services';

interface EditProgressModalProps {
  showEditModal: boolean;
  editingProgress: any;
  onShowEditModal: (show: boolean) => void;
  onUpdateProgress: (data: any) => void;
}

const EditProgressModal: React.FC<EditProgressModalProps> = ({
  showEditModal,
  editingProgress,
  onShowEditModal,
  onUpdateProgress
}) => {
  const [date, setDate] = useState(editingProgress?.date ? new Date(editingProgress.date).toISOString().slice(0,10) : '');
  const [weight, setWeight] = useState(editingProgress?.weight?.toString() || '');
  const [height, setHeight] = useState(editingProgress?.height?.toString() || '');
  const [bodyFat, setBodyFat] = useState(editingProgress?.bodyFat?.toString() || '');
  const [waist, setWaist] = useState(editingProgress?.waist?.toString() || '');
  const [chest, setChest] = useState(editingProgress?.chest?.toString() || '');
  const [arms, setArms] = useState(editingProgress?.arms?.toString() || '');
  const [thighs, setThighs] = useState(editingProgress?.thighs?.toString() || '');
  const [calves, setCalves] = useState(editingProgress?.calves?.toString() || '');
  const [biceps, setBiceps] = useState(editingProgress?.biceps?.toString() || '');
  const [triceps, setTriceps] = useState(editingProgress?.triceps?.toString() || '');
  const [forearms, setForearms] = useState(editingProgress?.forearms?.toString() || '');
  const [shoulders, setShoulders] = useState(editingProgress?.shoulders?.toString() || '');
  const [back, setBack] = useState(editingProgress?.back?.toString() || '');
  const [abs, setAbs] = useState(editingProgress?.abs?.toString() || '');
  const [glutes, setGlutes] = useState(editingProgress?.glutes?.toString() || '');
  const [notes, setNotes] = useState(editingProgress?.notes || '');

  const handleSubmit = async () => {
    if (!editingProgress?._id) return;
    
    try {
      const progressData = {
        date: new Date(date),
        weight: parseFloat(weight) || undefined,
        height: parseFloat(height) || undefined,
        bodyFat: parseFloat(bodyFat) || undefined,
        waist: parseFloat(waist) || undefined,
        chest: parseFloat(chest) || undefined,
        arms: parseFloat(arms) || undefined,
        thighs: parseFloat(thighs) || undefined,
        calves: parseFloat(calves) || undefined,
        biceps: parseFloat(biceps) || undefined,
        triceps: parseFloat(triceps) || undefined,
        forearms: parseFloat(forearms) || undefined,
        shoulders: parseFloat(shoulders) || undefined,
        back: parseFloat(back) || undefined,
        abs: parseFloat(abs) || undefined,
        glutes: parseFloat(glutes) || undefined,
        notes
      };

      await progressService.update(editingProgress._id, progressData);
      onShowEditModal(false);
      onUpdateProgress(progressData);
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  if (!showEditModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="relative z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">تعديل سجل التقدم</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">التاريخ</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الوزن (كجم)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="مثال: 70"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الطول (سم)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="مثال: 175"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">نسبة الدهون (%)</label>
              <input
                type="number"
                value={bodyFat}
                onChange={(e) => setBodyFat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="مثال: 15"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">محيط الخصر (سم)</label>
              <input
                type="number"
                value={waist}
                onChange={(e) => setWaist(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="مثال: 80"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الصدر (سم)</label>
              <input
                type="number"
                value={chest}
                onChange={(e) => setChest(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="مثال: 100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الذراعين (سم)</label>
              <input
                type="number"
                value={arms}
                onChange={(e) => setArms(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="مثال: 30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">العضلات الخلفية (سم)</label>
              <input
                type="number"
                value={thighs}
                onChange={(e) => setThighs(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="مثال: 50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">العضلات الساقية (سم)</label>
              <input
                type="number"
                value={calves}
                onChange={(e) => setCalves(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="مثال: 35"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">البايبسب (سم)</label>
              <input
                type="number"
                value={biceps}
                onChange={(e) => setBiceps(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="مثال: 35"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ترايبسب (سم)</label>
              <input
                type="number"
                value={triceps}
                onChange={(e) => setTriceps(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="مثال: 30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الذراعين الأمامية (سم)</label>
              <input
                type="number"
                value={forearms}
                onChange={(e) => setForearms(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="مثال: 25"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الأكتاف (سم)</label>
              <input
                type="number"
                value={shoulders}
                onChange={(e) => setShoulders(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="مثال: 120"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الظهر (سم)</label>
              <input
                type="number"
                value={back}
                onChange={(e) => setBack(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="مثال: 40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">البطن (سم)</label>
              <input
                type="number"
                value={abs}
                onChange={(e) => setAbs(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="مثال: 80"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">العضلات المؤخرة (سم)</label>
              <input
                type="number"
                value={glutes}
                onChange={(e) => setGlutes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="مثال: 90"
              />
            </div>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ملاحظات</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="أي ملاحظات إضافية..."
            />
          </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={() => onShowEditModal(false)}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
          >
            حفظ التعديلات
          </button>
        </div>
      </div>
  );
};

export default EditProgressModal;
