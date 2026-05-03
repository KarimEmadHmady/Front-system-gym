// Popup.tsx — استبدل الملف كله

'use client';

import React from 'react';
import DOMPurify from 'dompurify';
import { CheckCircle, XCircle, Clock, WifiOff } from 'lucide-react';

interface PopupState {
  type: 'success' | 'error' | 'warning' | 'offline';
  title: string;
  message: string;
  data?: {
    user: { id: string; name: string; barcode: string; email: string; membershipLevel: string };
    attendance: { id: string; date: string; status: string; time: string };
    recentAttendance: Array<{
      _id: string;
      userId: { name: string; email: string; phone: string };
      date: string;
      status: string;
      notes: string;
      createdAt: string;
      updatedAt: string;
    }>;
  };
}

interface PopupProps {
  popup: PopupState;
  onClose: () => void;
}

const Popup: React.FC<PopupProps> = ({ popup, onClose }) => {
  const cfg = {
    success: {
      border: 'border-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      icon: <CheckCircle className="h-10 w-10 text-emerald-500" />,
    },
    error: {
      border: 'border-red-400',
      bg: 'bg-red-50 dark:bg-red-900/20',
      icon: <XCircle className="h-10 w-10 text-red-500" />,
    },
    warning: {
      border: 'border-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      icon: <Clock className="h-10 w-10 text-amber-500" />,
    },
    offline: {
      border: 'border-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      icon: <WifiOff className="h-10 w-10 text-blue-500" />,
    },
  }[popup.type];

  // ✅ FIX: sanitize الـ HTML قبل ما يتعرض — بيمنع XSS
  const safeMessage =
    typeof window !== 'undefined'
      ? DOMPurify.sanitize(popup.message)
      : popup.message;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`
          relative w-full max-w-sm rounded-2xl shadow-2xl border-2 overflow-hidden
          bg-white dark:bg-gray-900 ${cfg.border}
        `}
        style={{ animation: 'fadeInScale 0.18s ease-out' }}
      >
        <div className={`${cfg.bg} px-6 pt-8 pb-6 text-center`}>
          <div className="flex justify-center mb-4">{cfg.icon}</div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
            {popup.title}
          </h3>

          {/* ✅ FIX: sanitized HTML بدل raw dangerouslySetInnerHTML */}
          <p
            className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line"
            dangerouslySetInnerHTML={{ __html: safeMessage }}
          />

          {popup.data && (
            <div className="mt-4 bg-white/60 dark:bg-gray-800/60 rounded-xl p-3 text-right space-y-1">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-semibold">العضو: </span>
                {popup.data.user.name}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-semibold">الباركود: </span>
                {popup.data.user.barcode}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-semibold">الوقت: </span>
                {new Date(popup.data.attendance.time).toLocaleTimeString('ar-SA', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </p>

              {popup.data.recentAttendance?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-right font-medium">
                    آخر {popup.data.recentAttendance.length} حضور:
                  </p>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {popup.data.recentAttendance.slice(0, 20).map((record) => (
                      <div
                        key={record._id}
                        className="text-xs bg-white/50 dark:bg-gray-700/30 rounded p-1.5 flex justify-between items-center"
                      >
                        <span
                          className={`font-medium ${
                            record.status === 'present'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {record.status === 'present' ? 'حاضر' : 'غائب'}
                        </span>
                        <div className="text-right">
                          <div className="text-gray-600 dark:text-gray-400">
                            {new Date(record.date).toLocaleDateString('ar-SA', {
                              weekday: 'short',
                              day: '2-digit',
                              month: '2-digit',
                            })}
                          </div>
                          <div className="text-gray-500 dark:text-gray-400">
                            {new Date(record.date).toLocaleTimeString('ar-SA', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-6 pb-5 bg-white dark:bg-gray-900">
          <button
            onClick={onClose}
            className="mt-4 w-full py-2.5 rounded-xl font-semibold text-sm bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 transition-opacity"
          >
            موافق
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default Popup;