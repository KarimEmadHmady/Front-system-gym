'use client';

import React, { useState } from 'react';
import { progressService } from '@/services';

interface CreateProgressModalProps {
  showCreateModal: boolean;
  progressModalClient: any;
  onShowCreateModal: (show: boolean) => void;
  onCreateProgress: (data: any) => void;
}

const CreateProgressModal: React.FC<CreateProgressModalProps> = ({
  showCreateModal,
  progressModalClient,
  onShowCreateModal,
  onCreateProgress
}) => {
  const [date, setDate] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [waist, setWaist] = useState('');
  const [chest, setChest] = useState('');
  const [arms, setArms] = useState('');
  const [thighs, setThighs] = useState('');
  const [calves, setCalves] = useState('');
  const [biceps, setBiceps] = useState('');
  const [triceps, setTriceps] = useState('');
  const [forearms, setForearms] = useState('');
  const [shoulders, setShoulders] = useState('');
  const [back, setBack] = useState('');
  const [abs, setAbs] = useState('');
  const [glutes, setGlutes] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    if (!progressModalClient?._id) return;

    try {
      const progressData = {
        userId: progressModalClient._id,
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

      await progressService.create(progressData);
      onShowCreateModal(false);
      onCreateProgress(progressData);

      // Reset form
      setDate('');
      setWeight('');
      setHeight('');
      setBodyFat('');
      setWaist('');
      setChest('');
      setArms('');
      setThighs('');
      setCalves('');
      setBiceps('');
      setTriceps('');
      setForearms('');
      setShoulders('');
      setBack('');
      setAbs('');
      setGlutes('');
      setNotes('');
    } catch (error) {
      console.error('Error creating progress:', error);
    }
  };

  if (!showCreateModal) return null;

return (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    
    {/* Overlay */}
    <div
      className="absolute inset-0 bg-black/40"
      onClick={() => onShowCreateModal(false)}
    />

    {/* Modal */}
    <div
      className="relative z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        إنشاء سجل تقدم
      </h3>

      <div className="space-y-4">

        {/* الصف الأول */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-2">التاريخ</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input" />
          </div>
          <div>
            <label className="block text-sm mb-2">الوزن</label>
            <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="input" />
          </div>
        </div>

        {/* الصف الثاني */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-2">الطول</label>
            <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="input" />
          </div>
          <div>
            <label className="block text-sm mb-2">نسبة الدهون</label>
            <input type="number" value={bodyFat} onChange={(e) => setBodyFat(e.target.value)} className="input" />
          </div>
        </div>

        {/* باقي الحقول (اختصارًا خليك مكمل بنفس النمط) */}

        <div>
          <label className="block text-sm mb-2">ملاحظات</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input" />
        </div>

      </div>

      {/* الأزرار */}
      <div className="mt-6 flex justify-end space-x-3">
        <button
          onClick={() => onShowCreateModal(false)}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          إلغاء
        </button>

        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
        >
          حفظ السجل
        </button>
      </div>
    </div>
  </div>
);
};

export default CreateProgressModal;
