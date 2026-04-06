"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { fetchFeatures, INITIAL_FEATURES, type FeatureFlags } from "@/config/features";

type FeaturesCtx = {
  features: FeatureFlags;
  isLoading: boolean;
  refetch: () => Promise<void>;
  isEnabled: (f: keyof FeatureFlags) => boolean;
};

const Ctx = createContext<FeaturesCtx | null>(null);

export function FeaturesProvider({ children }: { children: ReactNode }) {
  const [features, setFeatures] = useState<FeatureFlags>(INITIAL_FEATURES);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    setIsLoading(true);
    const data = await fetchFeatures();
    setFeatures(data);
    setIsLoading(false);
  };

  useEffect(() => { void load(); }, []);

  return (
    <Ctx.Provider value={{
      features,
      isLoading,
      refetch: load,
      isEnabled: (f) => features[f] === true,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useFeatures() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useFeatures must be inside FeaturesProvider");
  return ctx;
}

export function useFeature(f: keyof FeatureFlags) {
  const { features, isLoading } = useFeatures();
  if (isLoading) return false;
  return features[f] === true;
}