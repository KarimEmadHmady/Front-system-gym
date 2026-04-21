'use client';

import React from 'react';
import { QrCode, Scan, Camera, Wifi, WifiOff } from 'lucide-react';

interface ScannerCardProps {
  isOnline: boolean;
  hidConnected: boolean;
  onConnectHID: () => void;
  onDisconnectHID: () => void;
  onShowQRScanner: () => void;
}

const ScannerCard: React.FC<ScannerCardProps> = ({
  isOnline,
  hidConnected,
  onConnectHID,
  onDisconnectHID,
  onShowQRScanner
}) => {
  return (
    <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
        <QrCode className="h-5 w-5 text-gray-500" />
        <h2 className="font-semibold text-gray-900 dark:text-white">ماسح الباركود</h2>
      </div>
      <div className="p-6 space-y-4">
        {/* Input */}
        <div>
          <label htmlFor="barcode-input" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            امسح أو أدخل الباركود
          </label>
          <input
            id="barcode-input"
            type="text"
            placeholder="امسح الباركود أو اكتبه يدوياً..."
            className="
              w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600
              bg-gray-50 dark:bg-gray-700/50
              text-lg font-mono text-gray-900 dark:text-white
              placeholder-gray-400 dark:placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 focus:border-transparent
              transition-all
            "
          />
        </div>

        {/* Hint */}
        <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
          <Scan className="h-3.5 w-3.5 shrink-0" />
          يعمل الماسح تلقائياً حتى لو لم يكن الحقل محدداً
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            className="
              flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm text-white
              bg-gray-800 dark:bg-gray-100 dark:text-gray-900
              hover:bg-gray-700 dark:hover:bg-white
              transition-all active:scale-[0.98]
            "
          >
            تسجيل الحضور
          </button>

          <button
            onClick={onShowQRScanner}
            className="
              flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm
              border border-gray-200 dark:border-gray-600
              text-gray-700 dark:text-gray-300
              bg-white dark:bg-gray-700
              hover:bg-gray-50 dark:hover:bg-gray-600
              transition-all active:scale-[0.98]
            "
          >
            <Camera className="h-4 w-4" />
            <span>مسح QR</span>
          </button>
        </div>

        {/* USB Scanner Connection */}
        <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
          {hidConnected ? (
            <button
              onClick={onDisconnectHID}
              className="w-full py-2 rounded-xl text-sm text-emerald-700 dark:text-emerald-400 
                            bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 
                            dark:border-emerald-800 font-medium"
            >
              <span className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span>تم توصيل جهاز الاسكانر - اضغط للفصل</span>
              </span>
            </button>
          ) : (
            <button
              onClick={onConnectHID}
              className="w-full py-2 rounded-xl text-sm text-gray-600 dark:text-gray-400 
                            bg-gray-50 dark:bg-gray-700/40 border border-gray-200 
                            dark:border-gray-700 hover:bg-gray-100 transition-colors font-medium"
            >
              <span className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span>توصيل جهاز الاسكانر USB مباشرة (بدون برامج)</span>
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScannerCard;
