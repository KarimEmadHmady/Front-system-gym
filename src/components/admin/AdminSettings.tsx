"use client";

import React, { useEffect, useState } from "react";
import {
  GymSettingsService,
  type GymSettings,
} from "@/services/gymSettingsService";
import SubscriptionAlertSettings from "./SubscriptionAlertSettings";
import { getAuthToken } from "@/lib/api";
import { UserService } from "@/services/userService";
import VideoTutorial from "../VideoTutorial";
// import { useGymBranding } from "@/contexts/GymBrandingContext";
import { BackupManager } from "./BackupManager";
import CustomAlert from "../ui/CustomAlert";

// FileInput component for image uploads
const FileInput = ({
  onChange,
  onRemove,
  accept = "image/*",
  className = "",
  label = "",
  currentFile,
  currentUrl,
}: {
  onChange: (file: File | null) => void;
  onRemove?: () => void;
  accept?: string;
  className?: string;
  label?: string;
  currentFile?: File;
  currentUrl?: string;
}) => (
  <div className={`space-y-2 ${className}`}>
    {label && (
      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
    )}
    <div className="space-y-2">
      <input
        type="file"
        accept={accept}
        onChange={(e) => onChange(e.target.files?.[0] || null)}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 dark:file:bg-gray-700 dark:file:text-gray-300"
      />
      {(currentFile || currentUrl) && (
        <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
              {currentFile ? `تم اختيار: ${currentFile.name}` : ""}
            </span>
            {currentUrl && (
              <img
                src={currentUrl}
                alt="Preview"
                className="w-8 h-8 object-cover rounded border border-gray-300"
              />
            )}
          </div>
          <button
            type="button"
            onClick={onRemove || (() => onChange(null))}
            className="text-red-500 hover:text-red-700 text-sm font-medium"
          >
            إزالة
          </button>
        </div>
      )}
    </div>
  </div>
);

const AdminSettings = () => {
  // const { refresh: refreshBranding } = useGymBranding();
  const [settings, setSettings] = useState<GymSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadedLogo, setUploadedLogo] = useState<File | undefined>(undefined);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState(""); // To verify old password
  const [alert, setAlert] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'success'
  });
  const svc = new GymSettingsService();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const s = await svc.get();
        setSettings(s);
      } catch (e: any) {
        setError(e?.message || "تعذر جلب إعدادات الجيم");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const userService = new UserService();
  let userId: string | null = null;

  try {
    const token = getAuthToken();
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      userId = payload.id; // ✅ جلب ID من JWT
    }
  } catch {}

  const handleToggle = (path: string) => {
    setSettings((prev) => {
      const next: any = { ...(prev || {}) };
      const parts = path.split(".");
      let obj = next;
      for (let i = 0; i < parts.length - 1; i++) {
        obj[parts[i]] = obj[parts[i]] || {};
        obj = obj[parts[i]];
      }
      const key = parts[parts.length - 1];
      obj[key] = !obj[key];
      return next;
    });
  };

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    setError(null);
    try {
      const formData = new FormData();

      // Add all settings data as individual fields
      Object.keys(settings).forEach((key) => {
        if (key !== "logoUrl") {
          // Don't include logoUrl in JSON since we'll handle it separately
          formData.append(
            key,
            JSON.stringify(settings[key as keyof GymSettings])
          );
        }
      });

      // Add uploaded logo if exists
      if (uploadedLogo) {
        formData.append("logoUrl", uploadedLogo);
      }

      const token = getAuthToken();

// ✅ Handle password change only
if (currentPassword || newPassword || confirmNewPassword) {
  if (!currentPassword)
    throw new Error("الرجاء إدخال كلمة المرور الحالية.");

  if (!newPassword) throw new Error("الرجاء إدخال كلمة المرور الجديدة.");

  if (newPassword.length < 5)
    throw new Error("يجب أن تكون كلمة المرور الجديدة 5 أحرف على الأقل.");

  if (newPassword !== confirmNewPassword)
    throw new Error("كلمة المرور الجديدة وتأكيدها غير متطابقين.");

  if (!userId) throw new Error("تعذر تحديد المستخدم الحالي.");

  // ✅ API لطلب تغيير كلمة المرور
  await userService.changePassword(userId, {
    currentPassword,
    newPassword,
  });

  // ✅ Toast عند نجاح تغيير كلمة المرور
  window.dispatchEvent(
    new CustomEvent("toast", {
      detail: {
        type: "success",
        message: "✅ تم تغيير كلمة المرور بنجاح",
      },
    })
  );

  // ✅ Reset only password fields
  setCurrentPassword("");
  setNewPassword("");
  setConfirmNewPassword("");

  setSaving(false);

  return; // ✅ مهم جداً — وقف الفنكشن بعد تغيير الباسورد
}


      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
        }/gym-settings`,
        {
          method: "PUT",
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "فشل حفظ الإعدادات");
      }

      const result = await response.json();
      const updated = result.settings || result;

      setSettings(updated);
      setUploadedLogo(undefined); // Clear uploaded file after successful save

      // void refreshBranding();

      setAlert({
        isOpen: true,
        title: 'تم الحفظ بنجاح',
        message: 'تم حفظ الإعدادات',
        type: 'success'
      });
    } catch (e: any) {
      setError(e?.message || "تعذر حفظ الإعدادات");
    } finally {
      setSaving(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...(prev || {}), [name]: value }));
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
  };
  

  const handleRemoveLogo = () => {
    setUploadedLogo(undefined);
    setSettings((prev) => ({ ...(prev || {}), logoUrl: '' }));
  };

  return (
    <div className="space-y-8">
       <VideoTutorial 
        videoId="466v6J2UqEE"
        title="شرح الاعدادات النظام و كيفية اضافة بياينات الخاصة بالجيم" 
         position="bottom-right"
        buttonText="شرح"
       />
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
        ) : error ? (
          <div className="text-red-600">{error}</div>
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
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <FileInput
                  label="🖼️ شعار الجيم"
                  currentFile={uploadedLogo}
                  currentUrl={settings?.logoUrl}
                  onChange={(file) => setUploadedLogo(file ?? undefined)}
                  onRemove={handleRemoveLogo}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                  📍 العنوان
                </label>
                <input
                  name="address"
                  value={settings?.address || ""}
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
              {/* Current Password Field */}
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                  كلمة المرور الحالية
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-400"
                  placeholder="ادخل كلمة المرور الحالية"
                />
              </div>
              {/* New Password Field */}
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                  كلمة المرور الجديدة
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-400"
                  placeholder="ادخل كلمة المرور الجديدة"
                />
              </div>
              {/* Confirm New Password Field */}
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                  تأكيد كلمة المرور الجديدة
                </label>
                <input
                  type="password"
                  name="confirmNewPassword"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-400"
                  placeholder="تأكيد كلمة المرور الجديدة"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                  🕒 مواعيد العمل
                </label>
                <input
                  name="workingHours"
                  value={settings?.workingHours || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                🌐 روابط السوشيال
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {["facebook", "instagram", "twitter", "tiktok", "youtube"].map(
                  (k) => (
                    <div key={k}>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                        {k === "facebook" && "📘"}
                        {k === "instagram" && "📷"}
                        {k === "twitter" && "🐦"}
                        {k === "tiktok" && "🎵"}
                        {k === "youtube" && "📺"}
                        {k}
                      </label>
                      <input
                        name={`socialLinks.${k}`}
                        value={(settings as any)?.socialLinks?.[k] || ""}
                        onChange={(e) => {
                          const { name, value } = e.target;
                          const [, key] = name.split(".");
                          setSettings((prev) => ({
                            ...(prev || {}),
                            socialLinks: {
                              ...((prev as any)?.socialLinks || {}),
                              [key]: value,
                            },
                          }));
                        }}
                        className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      />
                    </div>
                  )
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                📋 السياسات
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {["terms", "privacy", "refund"].map((k) => (
                  <div key={k}>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                      {k === "terms" && "📄"}
                      {k === "privacy" && "🔒"}
                      {k === "refund" && "💰"}
                      {k}
                    </label>
                    <textarea
                      name={`policies.${k}`}
                      value={(settings as any)?.policies?.[k] || ""}
                      onChange={(e) => {
                        const { name, value } = e.target;
                        const [, key] = name.split(".");
                        setSettings((prev) => ({
                          ...(prev || {}),
                          policies: {
                            ...((prev as any)?.policies || {}),
                            [key]: value,
                          },
                        }));
                      }}
                      className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      rows={3}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="text-left">
              <button
                onClick={save}
                disabled={saving}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm"
              >
                {saving ? "💾 جارٍ الحفظ..." : "💾 حفظ الإعدادات"}
              </button>
            </div>
          </div>
        )}

        {/* إعدادات تحذيرات الاشتراكات */}
        <div className="mt-8">
          <SubscriptionAlertSettings />
        </div>

        {/* مدير النسخ الاحتياطي */}
        <div className="mt-8">
          <BackupManager />
        </div>
      </div>

      {/* Custom Alert */}
      <CustomAlert
        isOpen={alert.isOpen}
        onClose={() => setAlert(prev => ({ ...prev, isOpen: false }))}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        duration={5000}
      />
    </div>
  );
};

export default AdminSettings;
