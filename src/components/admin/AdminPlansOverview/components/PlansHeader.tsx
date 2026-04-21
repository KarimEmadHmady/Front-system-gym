import React from 'react';
import { useTranslations } from 'next-intl';
import type { UserBasic } from '../types';

interface Props {
  activeTab: string;
  currentRole?: string;
  searchType: 'member' | 'trainer';
  searchQuery: string;
  selectedUserId: string;
  selectedTrainerId: string;
  members: UserBasic[];
  trainers: UserBasic[];
  onSearchTypeChange: (v: 'member' | 'trainer') => void;
  onSearchQueryChange: (v: string) => void;
  onSelectedUserChange: (v: string) => void;
  onSelectedTrainerChange: (v: string) => void;
  onCreateWorkout: () => void;
  onCreateDiet: () => void;
  onExport: () => void;
}

const PlansHeader: React.FC<Props> = ({
  activeTab, currentRole,
  searchType, searchQuery, selectedUserId, selectedTrainerId,
  members, trainers,
  onSearchTypeChange, onSearchQueryChange,
  onSelectedUserChange, onSelectedTrainerChange,
  onCreateWorkout, onCreateDiet, onExport,
}) => {
  const t = useTranslations();

  const filteredMembers = members.filter((m) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      (m.name || '').toLowerCase().includes(q) ||
      (m.phone || '').toLowerCase().includes(q) ||
      (m.email || '').toLowerCase().includes(q)
    );
  });

  const filteredTrainers = trainers.filter((tr) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      (tr.name || '').toLowerCase().includes(q) ||
      (tr.phone || '').toLowerCase().includes(q) ||
      (tr.email || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-0">
          {currentRole === 'trainer' ? 'إدارة الخطط (مدرب)' : t('AdminPlansOverview.title')}
        </h3>

        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
          {/* بحث وفلتر */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <select
              className="border rounded px-2 py-1 text-sm bg-white dark:bg-gray-900"
              value={searchType}
              onChange={(e) => {
                onSearchTypeChange(e.target.value as any);
                onSearchQueryChange('');
                onSelectedUserChange('');
                onSelectedTrainerChange('');
              }}
            >
              <option value="member">عضو</option>
              <option value="trainer">مدرب</option>
            </select>

            <input
              className="border rounded px-2 py-2 text-sm bg-white dark:bg-gray-900"
              placeholder={searchType === 'member' ? 'ابحث عن عضو بالاسم أو الهاتف أو الإيميل' : 'ابحث عن مدرب بالاسم أو الهاتف أو الإيميل'}
              value={searchQuery}
              onChange={(e) => {
                onSearchQueryChange(e.target.value);
                onSelectedUserChange('');
                onSelectedTrainerChange('');
              }}
            />

            {searchType === 'member' ? (
              <select
                className="border rounded px-2 py-1 text-sm bg-white dark:bg-gray-900 min-w-[160px]"
                value={selectedUserId}
                onChange={(e) => onSelectedUserChange(e.target.value)}
              >
                <option value="">كل الأعضاء</option>
                {filteredMembers.map((m) => (
                  <option key={m._id} value={m._id}>{(m.phone || 'بدون هاتف')} - {m.name}</option>
                ))}
              </select>
            ) : (
              <select
                className="border rounded px-2 py-1 text-sm bg-white dark:bg-gray-900 min-w-[160px]"
                value={selectedTrainerId}
                onChange={(e) => onSelectedTrainerChange(e.target.value)}
              >
                <option value="">كل المدربين</option>
                {filteredTrainers.map((tr) => (
                  <option key={tr._id} value={tr._id}>{(tr.phone || 'بدون هاتف')} - {tr.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* أزرار */}
          <div className="flex space-x-2">
            {activeTab === 'workout' ? (
              <button
                className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700 transition-colors"
                onClick={onCreateWorkout}
              >
                {t('AdminPlansOverview.addNewPlan')}
              </button>
            ) : (
              <button
                className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition-colors"
                onClick={onCreateDiet}
              >
                إنشاء خطة غذائية
              </button>
            )}
            <button
              onClick={onExport}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
            >
              {t('AdminPlansOverview.exportData')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlansHeader;