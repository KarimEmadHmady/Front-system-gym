"use client";

import { Lock, AlertCircle, Info, Gift, Clock, Crown } from "lucide-react";
import type { FeatureFlags } from "@/config/features";

type BannerType = "info" | "warning" | "locked" | "upgrade" | "coming" | "premium";
type UserRole = "admin" | "manager" | "trainer" | "member";

type Props = {
  feature?: keyof FeatureFlags;
  title?: string;
  description?: string;
  type?: BannerType;
  role?: UserRole;
};

const CONFIG: Record<BannerType, {
  icon: typeof Lock;
  colors: string;
  defaultTitle: string;
  defaultDesc: string;
}> = {
  locked: {
    icon: Lock,
    colors: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300",
    defaultTitle: "🔒 هذه الميزة غير متاحة في باقتك",
    defaultDesc: "تواصل مع الإدارة لتفعيل هذه الميزة.",
  },
  warning: {
    icon: AlertCircle,
    colors: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300",
    defaultTitle: "⚠️ هذه الميزة غير متاحة حالياً",
    defaultDesc: "هذه الميزة قيد التطوير أو معطّلة مؤقتاً.",
  },
  info: {
    icon: Info,
    colors: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300",
    defaultTitle: "ℹ️ هذه الميزة غير مفعّلة",
    defaultDesc: "يمكن تفعيلها من إعدادات النظام.",
  },
  upgrade: {
    icon: Gift,
    colors: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300",
    defaultTitle: "🎁 ترقية باقتك لتفعيل هذه الميزة",
    defaultDesc: "هذه الميزة متاحة في الباقات المتقدمة. ترقِ الآن واستمتع بجميع الخدمات المميزة.",
  },
  coming: {
    icon: Clock,
    colors: "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300",
    defaultTitle: "🚀 قريباً",
    defaultDesc: "نحن نعمل على إطلاق هذه الميزة قريباً. تابعنا للجديد!",
  },
  premium: {
    icon: Crown,
    colors: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300",
    defaultTitle: "⭐ ميزة مميزة",
    defaultDesc: "هذه الميزة حصرية للباقات المميزة. تواصل معنا للترقية إلى الباقة الذهبية.",
  },
};

const ROLE_MESSAGES: Record<UserRole, { title: string; desc: string }> = {
  admin: {
    title: "🔒 هذه الميزة غير مفعّلة في باقتك الحالية",
    desc: "لتفعيل هذه الميزة يرجى ترقية الباقة. تواصل مع فريق الدعم للحصول على أفضل عرض.",
  },
  manager: {
    title: "🔒 هذه الميزة غير متاحة",
    desc: "هذه الميزة غير مفعّلة في هذا النظام. تواصل مع مدير الجيم لتفعيلها.",
  },
  trainer: {
    title: "⚠️ هذه الميزة غير متاحة حالياً",
    desc: "هذه الميزة غير مفعّلة في الوقت الحالي. تواصل مع الإدارة لمزيد من المعلومات.",
  },
  member: {
    title: "🔒 هذه الخدمة غير متاحة",
    desc: "هذه الخدمة غير متوفرة حالياً في صالتك. للاستفسار تواصل مع الاستقبال.",
  },
};

export function FeatureBanner({ title, description, type = "locked", role }: Props) {
  const { icon: Icon, colors } = CONFIG[type];

  // لو في role محدد، استخدم رسالته، غير كده استخدم الـ default
  const finalTitle = title ?? (role ? ROLE_MESSAGES[role].title : CONFIG[type].defaultTitle);
  const finalDesc = description ?? (role ? ROLE_MESSAGES[role].desc : CONFIG[type].defaultDesc);

  return (
    <div className={`rounded-lg border p-4 flex items-start gap-3 ${colors}`}>
      <Icon className="w-5 h-5 shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold text-sm">{finalTitle}</p>
        <p className="text-sm opacity-80 mt-0.5">{finalDesc}</p>
      </div>
    </div>
  );
}