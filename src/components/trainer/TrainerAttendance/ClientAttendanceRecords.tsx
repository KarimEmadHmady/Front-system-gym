'use client';

import React from 'react';
import { Users, Calendar, Clock } from 'lucide-react';

interface ClientAttendanceRecordsProps {
  clients: any[];
  selectedClient: string;
  clientRecords: any[];
  currentClientRecords: any[];
  loading: boolean;
  error: string | null;
  getStatusInfo: (status: string) => any;
  onClientChange: (clientId: string) => void;
}

const ClientAttendanceRecords: React.FC<ClientAttendanceRecordsProps> = ({
  clients,
  selectedClient,
  clientRecords,
  currentClientRecords,
  loading,
  error,
  getStatusInfo,
  onClientChange
}) => {
  return (
    <div className="p-6">
      <div className="mb-4">
        <select
          className="w-full max-w-xs border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          value={selectedClient}
          onChange={(e) => { 
            onClientChange(e.target.value); 
          }}
        >
          <option value="">اختر العميل</option>
          {clients.map(c => (
            <option key={c._id} value={c._id}>{c.name} ({c.phone || '-'})</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500 mx-auto mb-3"></div>
          <p className="text-gray-500 dark:text-gray-400">جاري التحميل...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-red-500 text-xl">!</span>
          </div>
          <p className="text-red-500 dark:text-red-400">{error}</p>
        </div>
      ) : !selectedClient ? (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">اختر عميلاً لعرض سجلاته</p>
        </div>
      ) : clientRecords.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">لا توجد سجلات حضور لهذا العميل</p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentClientRecords.map(rec => {
            const d = new Date(rec.date);
            const cl = clients.find(c => c._id === rec.userId);
            const statusInfo = getStatusInfo(rec.status);
            const StatusIcon = statusInfo.icon;
            
            return (
              <div key={rec._id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <div className="flex items-center justify-between  flex-col sm:flex-row gap-2">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-gray-500 to-pink-600 flex items-center justify-center shadow-sm">
                      <span className="text-white font-bold text-sm">
                        {cl?.name?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{cl?.name || 'غير محدد'}</h4>
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
                  <div className="flex items-center gap-3">
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

export default ClientAttendanceRecords;
