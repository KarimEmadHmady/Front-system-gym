"use client";

import { Lock, AlertCircle, Info } from "lucide-react";
import type { FeatureFlags } from "@/config/features";
type BannerType = "info" | "warning" | "locked";

type Props = {
  feature?: keyof FeatureFlags;
  title?: string;
  description?: string;
  type?: BannerType;
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
};

export function FeatureBanner({ title, description, type = "locked" }: Props) {
  const { icon: Icon, colors, defaultTitle, defaultDesc } = CONFIG[type];

  return (
    <div className={`rounded-lg border p-4 flex items-start gap-3 ${colors}`}>
      <Icon className="w-5 h-5 shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold text-sm">{title ?? defaultTitle}</p>
        <p className="text-sm opacity-80 mt-0.5">{description ?? defaultDesc}</p>
      </div>
    </div>
  );
}