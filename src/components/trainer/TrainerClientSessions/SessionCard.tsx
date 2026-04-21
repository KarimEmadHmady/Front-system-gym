'use client';

import React from 'react';
import { Calendar, Clock, DollarSign } from 'lucide-react';

interface SessionCardProps {
  session: any;
  getUserName: (userId: string) => string;
  getUserPhone: (userId: string) => string;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  getTypeIcon: (type: string) => string;
  onEdit: (session: any) => void;
  onUpdateStatus: (sessionId: string, status: string) => void;
}

const SessionCard: React.FC<SessionCardProps> = ({
  session,
  getUserName,
  getUserPhone,
  getStatusColor,
  getStatusText,
  getTypeIcon,
  onEdit,
  onUpdateStatus
}) => {
  return (
    <div
      key={session._id}
      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-2 sm:space-x-4">
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-r from-gray-500 to-gray-600 flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm sm:text-lg">
              {getTypeIcon(session.sessionType)}
            </span>
          </div>
          <div className="flex-1">
            <h4 className="text-sm sm:text-lg font-medium text-gray-900 dark:text-white">
              {session.sessionType} - {getUserName(session.userId)}
            </h4>
            {getUserPhone(session.userId) && (
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                <span className="font-medium">الهاتف:</span> {getUserPhone(session.userId)}
              </p>
            )}
            <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-1 sm:gap-2 text-gray-600 dark:text-gray-400">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                <span className="text-xs sm:text-sm">{new Date(session.date).toLocaleDateString('ar-EG')}</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 text-gray-600 dark:text-gray-400">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" />
                <span className="text-xs sm:text-sm">{session.startTime} - {session.endTime}</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 text-gray-600 dark:text-gray-400">
                <span className="text-xs sm:text-sm">{session.duration} دقيقة</span>
              </div>
            </div>
            {session.description && (
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2">
                <span className="font-medium">الوصف:</span> {session.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end space-y-1 sm:space-y-2">
          <div className="text-right flex justify-center items-center gap-1 sm:gap-2">
            <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
            <p className="text-sm sm:text-lg font-bold text-green-600 dark:text-green-400">
              ج.م {session.price || 0}
            </p>
          </div>
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(session.status)}`}>
            {getStatusText(session.status)}
          </span>
          <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
            <button 
              onClick={() => onEdit(session)}
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 text-xs sm:text-sm"
            >
              تعديل
            </button>
            {session.status === 'مجدولة' && (
              <>
                <button
                  onClick={() => onUpdateStatus(session._id, 'مكتملة')}
                  className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 text-xs sm:text-sm"
                >
                  إكمال
                </button>
                <button
                  onClick={() => onUpdateStatus(session._id, 'ملغاة')}
                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 text-xs sm:text-sm"
                >
                  إلغاء
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionCard;
