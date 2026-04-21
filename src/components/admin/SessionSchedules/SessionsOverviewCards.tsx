'use client';

import React from 'react';
import type { SessionSchedule } from '@/types';
import { getStatusColor, getTypeIcon } from './helpers';

type Props = {
  sessions: SessionSchedule[];
  getUserName: (id: string) => string;
  onEdit: (s: SessionSchedule) => void;
  onDelete: (id: string) => void;
};

const SessionsOverviewCards = ({ sessions, getUserName, onEdit, onDelete }: Props) => {
  return (
    <div className="p-6 space-y-4">
      {sessions.map(session => (
        <div key={session._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="text-2xl">{getTypeIcon(session.sessionType)}</div>
              <div className="flex-1">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                  {session.sessionType} - {getUserName(session.userId)}
                </h4>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400"><span className="font-medium">المدرب:</span> {getUserName(session.trainerId)}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400"><span className="font-medium">الوقت:</span> {session.startTime} - {session.endTime}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400"><span className="font-medium">التاريخ:</span> {new Date(session.date).toLocaleDateString('ar-EG')}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400"><span className="font-medium">المدة:</span> {session.duration} دقيقة</p>
                  {session.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400"><span className="font-medium">الوصف:</span> {session.description}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <div className="text-center">
                <p className="text-lg font-bold text-green-600 dark:text-green-400">ج.م {session.price || 0}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">إيراد</p>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(session.status)}`}>
                {session.status}
              </span>
              <div className="flex space-x-2">
                <button onClick={() => onEdit(session)} className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 text-sm">تعديل</button>
                <button onClick={() => onDelete(session._id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 text-sm">حذف</button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SessionsOverviewCards;