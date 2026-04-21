'use client';

import React from 'react';
import { Calendar, Clock } from 'lucide-react';

interface AttendanceCardProps {
  record: any;
  client?: any;
  getStatusInfo: (status: string) => any;
  showClientInfo?: boolean;
}

const AttendanceCard: React.FC<AttendanceCardProps> = ({
  record,
  client,
  getStatusInfo,
  showClientInfo = false
}) => {
  const d = new Date(record.date);
  const statusInfo = getStatusInfo(record.status);
  const StatusIcon = statusInfo.icon;
  
  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
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
          {record.notes && (
            <div className="max-w-xs">
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {record.notes}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {showClientInfo && client && (
        <div className="flex items-center gap-4 mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-gray-500 to-pink-600 flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">
              {client.name?.charAt(0) || '?'}
            </span>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{client.name || 'غير محدد'}</h4>
            <div className="flex items-center gap-4 mt-1">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-gray-600" />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {d.toLocaleDateString('ar-EG')}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-600" />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceCard;
