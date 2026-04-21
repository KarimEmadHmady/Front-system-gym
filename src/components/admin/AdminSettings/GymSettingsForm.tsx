import React from 'react';
import type { GymSettings } from '@/services/gymSettingsService';
import FileInput from './FileInput';

interface GymSettingsFormProps {
  settings: GymSettings | null;
  loading: boolean;
  saving: boolean;
  uploadedLogo: File | undefined;
  onSettingsChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onLogoChange: (file: File | undefined) => void;
  onLogoRemove: () => void;
  onSave: () => void;
}

const GymSettingsForm: React.FC<GymSettingsFormProps> = ({
  settings,
  loading,
  saving,
  uploadedLogo,
  onSettingsChange,
  onLogoChange,
  onLogoRemove,
  onSave
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        ⚙️ إعدادات الجيم
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        يمكنك رفع شعار الجيم مباشرة من جهازك. سيتم حفظ الصورة على Cloudinary
        تلقائياً.
      </p>
      {loading ? (
        <div className="text-gray-500 dark:text-gray-400">
          جاري التحميل...
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                🏢 اسم الجيم
              </label>
              <input
                name="gymName"
                value={settings?.gymName || ""}
                onChange={onSettingsChange}
                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <FileInput
                label="🖼️ شعار الجيم"
                currentFile={uploadedLogo}
                currentUrl={settings?.logoUrl}
                onChange={(file) => onLogoChange(file ?? undefined)}
                onRemove={onLogoRemove}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                📍 العنوان
              </label>
              <input
                name="address"
                value={settings?.address || ""}
                onChange={onSettingsChange}
                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                📞 الهاتف
              </label>
              <input
                name="phone"
                value={settings?.phone || ""}
                onChange={onSettingsChange}
                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                ✉️ البريد
              </label>
              <input
                name="email"
                value={settings?.email || ""}
                onChange={onSettingsChange}
                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                🕒 مواعيد العمل
              </label>
              <input
                name="workingHours"
                value={settings?.workingHours || ""}
                onChange={onSettingsChange}
                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="text-left">
            <button
              onClick={onSave}
              disabled={saving}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm"
            >
              {saving ? "💾 جارٍ الحفظ..." : "💾 حفظ الإعدادات"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymSettingsForm;
