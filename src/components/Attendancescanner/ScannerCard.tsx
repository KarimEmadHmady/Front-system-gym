'use client';

import React from 'react';
import { QrCode, Scan, Camera } from 'lucide-react';

interface ScannerCardProps {
  isOnline: boolean;
  barcode: string;                                          // ✅ مضاف
  inputRef: React.RefObject<HTMLInputElement | null>;       // ✅ مضاف
  isScanning: boolean;                                     // ✅ مضاف
  onBarcodeChange: (e: React.ChangeEvent<HTMLInputElement>) => void; // ✅ مضاف
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;    // ✅ مضاف
  onSubmit: () => void;                                    // ✅ مضاف
  onShowQRScanner: () => void;
}

const ScannerCard: React.FC<ScannerCardProps> = ({
  isOnline,
  barcode,
  inputRef,
  isScanning,
  onBarcodeChange,
  onKeyPress,
  onSubmit,
  onShowQRScanner,
}) => {
  return (
    <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
        <QrCode className="h-5 w-5 text-gray-500" />
        <h2 className="font-semibold text-gray-900 dark:text-white">ماسح الباركود</h2>
      </div>
      <div className="p-6 space-y-4">
        {/* Input — ✅ متوصل بالـ state والـ ref */}
        <div>
          <label htmlFor="barcode-input" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            امسح أو أدخل الباركود
          </label>
          <input
            id="barcode-input"
            ref={inputRef}                   // ✅ ربط الـ ref
            type="text"
            value={barcode}                  // ✅ controlled input
            onChange={onBarcodeChange}       // ✅ onChange
            onKeyDown={onKeyPress}          // ✅ Enter key
            disabled={false}            // ✅ تعطيل أثناء السكان
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder="امسح الباركود أو اكتبه يدوياً..."
            className="
              w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600
              bg-gray-50 dark:bg-gray-700/50
              text-lg font-mono text-gray-900 dark:text-white
              placeholder-gray-400 dark:placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 focus:border-transparent
              transition-all disabled:opacity-60
            "
          />
        </div>


        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onSubmit}               // ✅ ربط زر التسجيل
            disabled={isScanning || !barcode.trim()} // ✅ تعطيل لو فاضي
            className="
              flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm text-white
              bg-gray-800 dark:bg-gray-100 dark:text-gray-900
              hover:bg-gray-700 dark:hover:bg-white
              transition-all active:scale-[0.98]
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {isScanning ? 'جاري التسجيل...' : 'تسجيل الحضور'}
          </button>

          <button
            onClick={onShowQRScanner}
            disabled={false}
            className="
              flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm
              border border-gray-200 dark:border-gray-600
              text-gray-700 dark:text-gray-300
              bg-white dark:bg-gray-700
              hover:bg-gray-50 dark:hover:bg-gray-600
              transition-all active:scale-[0.98]
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            <Camera className="h-4 w-4" />
            <span>مسح QR</span>
          </button>
        </div>
        {/* Scanning Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-medium text-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span>📋 تعليمات المسح الصحيح</span>
          </div>

          <div className="space-y-2 text-xs">

            <div className="flex items-start gap-2">
              <span className="text-blue-500 dark:text-blue-400 mt-0.5">•</span>
              <div>
                <p className="text-gray-700 dark:text-gray-300 font-medium">
                  فعّل اللغة الإنجليزية (EN) قبل بدء المسح
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  استخدم Shift + Alt لتغيير اللغة
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="text-blue-500 dark:text-blue-400 mt-0.5">•</span>
              <div>
                <p className="text-gray-700 dark:text-gray-300 font-medium">
                  لا تغلق التبويب أثناء المسح
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  انتظر حتى تظهر النتيجة
                </p>
              </div>
            </div>

          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-blue-200 dark:border-blue-800">
            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-800/50 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">EN</span>
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              ⚠️ يجب تفعيل اللغة الإنجليزية لإتمام المسح بنجاح
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ScannerCard;