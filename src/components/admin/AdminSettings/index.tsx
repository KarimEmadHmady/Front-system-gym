'use client';

import React, { useEffect, useState } from 'react';
import {
  GymSettingsService,
  type GymSettings,
} from '@/services/gymSettingsService';
import SubscriptionAlertSettings from '../SubscriptionAlert/SubscriptionAlertSettings';
import { getAuthToken } from '@/lib/api';
import { UserService } from '@/services/userService';
import VideoTutorial from '../../VideoTutorial';
import { BackupManager } from '../Backup/BackupManager';
import CustomAlert from '../../ui/CustomAlert';

import GymSettingsForm from './GymSettingsForm';
import PasswordChangeForm from './PasswordChangeForm';
import SocialLinksForm from './SocialLinksForm';
import PoliciesForm from './PoliciesForm';

const AdminSettings = () => {
  const [settings, setSettings] = useState<GymSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadedLogo, setUploadedLogo] = useState<File | undefined>(undefined);
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
      userId = payload.id;
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
      setUploadedLogo(undefined);

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
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...(prev || {}), [name]: value }));
  };

  const handleRemoveLogo = () => {
    setUploadedLogo(undefined);
    setSettings((prev) => ({ ...(prev || {}), logoUrl: '' }));
  };

  const handlePasswordChange = async (passwords: {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }) => {
    if (!userId) throw new Error("تعذر تحديد المستخدم الحالي.");

    // API for password change
    await userService.changePassword(userId, {
      currentPassword: passwords.currentPassword,
      newPassword: passwords.newPassword,
    });

    // Toast on successful password change
    window.dispatchEvent(
      new CustomEvent("toast", {
        detail: {
          type: "success",
          message: "✅ تم تغيير كلمة المرور بنجاح",
        },
      })
    );

    setAlert({
      isOpen: true,
      title: 'تم تغيير كلمة المرور',
      message: 'تم تغيير كلمة المرور بنجاح',
      type: 'success'
    });
  };

  return (
    <div className="space-y-8">
       <VideoTutorial 
        videoId="466v6J2UqEE"
        title="شرح الاعدادات النظام و كيفية اضافة بياينات الخاصة بالجيم" 
         position="bottom-right"
        buttonText="شرح"
       />
      
      <GymSettingsForm
        settings={settings}
        loading={loading}
        saving={saving}
        uploadedLogo={uploadedLogo}
        onSettingsChange={handleChange}
        onLogoChange={(file) => setUploadedLogo(file ?? undefined)}
        onLogoRemove={handleRemoveLogo}
        onSave={save}
      />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <SocialLinksForm
          settings={settings}
          onChange={handleChange}
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <PoliciesForm
          settings={settings}
          onChange={handleChange}
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <PasswordChangeForm
          onSave={handlePasswordChange}
          disabled={saving}
        />
      </div>

      {/* إعدادات تحذيرات الاشتراكات */}
      <div className="mt-8">
        <SubscriptionAlertSettings />
      </div>

      {/* مدير النسخ الاحتياطي */}
      <div className="mt-8">
        <BackupManager />
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
