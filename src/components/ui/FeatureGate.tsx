// src/components/ui/FeatureGate.tsx
"use client";

import type { ReactNode } from "react";
import type { FeatureFlags } from "@/config/features";
import { useFeatures } from "@/contexts/FeaturesContext";

type Props = {
  feature: keyof FeatureFlags;
  children: ReactNode;
  fallback?: ReactNode;
};

export function FeatureGate({ feature, children, fallback = null }: Props) {
  const { isEnabled, isLoading } = useFeatures();


  if (isLoading) return <GateSkeleton />;
  if (!isEnabled(feature)) return <>{fallback}</>;
  return <>{children}</>;
}

function GateSkeleton() {
  return (
    <div className="animate-pulse space-y-3 p-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
    </div>
  );
}