'use client';

import React from 'react';
import { X } from 'lucide-react';

interface UserAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  attendanceRecords: any[];
}

export function UserAttendanceModal({ isOpen, onClose, userName, attendanceRecords }: UserAttendanceModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-md max-h-[90vh] rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden animate-[fadeInScale_0.2s_ease-out]"
        style={{ animation: 'fadeInScale 0.18s ease-out' }}
      >
        {/* Header */}
        <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            سجلات حضور: {userName}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {attendanceRecords.length > 0 ? (
            <div className="space-y-2">
              {attendanceRecords.map((record, index) => (
                <div
                  key={record._id || index}
                  className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${
                          record.status === 'present' 
                            ? 'bg-emerald-500' 
                            : record.status === 'absent' 
                            ? 'bg-red-500' 
                            : 'bg-gray-500'
                        }`} />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {record.status === 'present' ? 'حاضر' : 
                           record.status === 'absent' ? 'غائب' : 'معذور'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(record.date).toLocaleDateString('ar-SA', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {new Date(record.date).toLocaleTimeString('ar-SA', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </div>
                      {record.notes && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
                          ملاحظات: {record.notes}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500 dark:text-gray-400 text-sm">
                لا توجد سجلات حضور لهذا المستخدم
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
            <span>إجمالي السجلات: {attendanceRecords.length}</span>
            <span>
              الحاضرين: {attendanceRecords.filter(r => r.status === 'present').length} | 
              الغائبين: {attendanceRecords.filter(r => r.status === 'absent').length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="mt-3 w-full py-2.5 rounded-xl font-semibold text-sm bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 transition-opacity"
          >
            إغلاق
          </button>
        </div>

        <style>{`
          @keyframes fadeInScale {
            from { opacity: 0; transform: scale(0.92); }
            to   { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </div>
    </div>
  );
}
