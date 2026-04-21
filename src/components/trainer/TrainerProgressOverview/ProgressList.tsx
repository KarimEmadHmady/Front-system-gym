'use client';

import React from 'react';

interface ProgressListProps {
  progressModalList: any[];
  progressModalClient: any;
  onProgressModalClientChange: (client: any) => void;
  onProgressDeleteIdChange: (id: string) => void;
  onDeleteProgress: (id: string) => void;
}

const ProgressList: React.FC<ProgressListProps> = ({
  progressModalList,
  progressModalClient,
  onProgressModalClientChange,
  onProgressDeleteIdChange,
  onDeleteProgress
}) => {
  return (
    <div className="space-y-4">
      {progressModalList.map((progress: any) => (
        <div key={progress._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                {progress.date ? new Date(progress.date).toLocaleDateString() : 'تاريخ غير معروف'}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                العضو: {progressModalClient?.name}
              </p>
            </div>
            <div className="flex space-x-2">
              <button className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg text-sm font-medium transition-colors" onClick={() => onProgressModalClientChange(progress)}>
                عرض التفاصيل
              </button>
              <button className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg text-sm font-medium transition-colors" onClick={() => {
                onProgressDeleteIdChange(progress._id);
              }}>
                حذف
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">الوزن:</span>
              <span className="font-medium text-gray-900 dark:text-white">{progress.weight || 'غير محدد'} كجم</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">الطول:</span>
              <span className="font-medium text-gray-900 dark:text-white">{progress.height || 'غير محدد'} سم</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">مؤشر كتلة العضل:</span>
              <span className="font-medium text-gray-900 dark:text-white">{progress.bodyFat || 'غير محدد'}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">محيط الخصر:</span>
              <span className="font-medium text-gray-900 dark:text-white">{progress.waist || 'غير محدد'} سم</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">العضلات:</span>
              <span className="font-medium text-gray-900 dark:text-white">{progress.chest || 'غير محدد'} سم</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">الذراعين:</span>
              <span className="font-medium text-gray-900 dark:text-white">{progress.arms || 'غير محدد'} سم</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">الأرداف:</span>
              <span className="font-medium text-gray-900 dark:text-white">{progress.thighs || 'غير محدد'} سم</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProgressList;
