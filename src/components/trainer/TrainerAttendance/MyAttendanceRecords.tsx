'use client';

import React from 'react';
import { Calendar, Clock } from 'lucide-react';

interface MyAttendanceRecordsProps {
  myRecords: any[];
  currentMyRecords: any[];
  getStatusInfo: (status: string) => any;
}

const MyAttendanceRecords: React.FC<MyAttendanceRecordsProps> = ({
  myRecords,
  currentMyRecords,
  getStatusInfo
}) => {
  return (
    <div className="p-6">
      {myRecords.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">لا توجد سجلات حضور</p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentMyRecords.map(rec => {
            const d = new Date(rec.date);
            const statusInfo = getStatusInfo(rec.status);
            const StatusIcon = statusInfo.icon;
            
            return (
              <div key={rec._id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {d.toLocaleDateString('ar-EG')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusInfo.bgColor} dark:bg-opacity-20`}>
                      <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                      <span className={`text-sm font-medium ${statusInfo.color}`}>
                        {statusInfo.text}
                      </span>
                    </div>
                    {rec.notes && (
                      <div className="max-w-xs">
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {rec.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyAttendanceRecords;
