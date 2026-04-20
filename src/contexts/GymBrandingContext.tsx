"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  GymSettingsService,
  type GymSettings,
} from "@/services/gymSettingsService";
import {
  fallbackLogo192,
  fallbackLogo512,
} from "@/lib/gym-branding";

export type GymBrandingValue = {
  settings: GymSettings | null;
  gymName: string;
  logoUrl: string;
  logo192Url: string;
  logo512Url: string;
  refresh: () => Promise<void>;
};

const defaultBranding: GymBrandingValue = {
  settings: null,
  gymName: '',
  logoUrl: '',
  logo192Url: fallbackLogo192,
  logo512Url: fallbackLogo512,
  refresh: async () => {},
};

const GymBrandingContext = createContext<GymBrandingValue>(defaultBranding);

export function GymBrandingProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<GymSettings | null>(null);

  const load = useCallback(async () => {
    try {
      const svc = new GymSettingsService();
      const data = await svc.get();
      setSettings(data);
    } catch {
      setSettings(null);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const value = useMemo((): GymBrandingValue => {
    const apiName = settings?.gymName?.trim() || '';
    const apiLogo = settings?.logoUrl?.trim() || '';
    
    // Create resized versions of the API logo
    const logo192Url = apiLogo ? `${apiLogo}?w=192&h=192&fit=crop` : '';
    const logo512Url = apiLogo ? `${apiLogo}?w=512&h=512&fit=crop` : '';
    
    return {
      settings,
      gymName: apiName,
      logoUrl: apiLogo,
      logo192Url: logo192Url || fallbackLogo192,
      logo512Url: logo512Url || fallbackLogo512,
      refresh: load,
    };
  }, [settings, load]);

  return (
    <GymBrandingContext.Provider value={value}>
      {children}
    </GymBrandingContext.Provider>
  );
}

export function useGymBranding(): GymBrandingValue {
  return useContext(GymBrandingContext);
}

/** يحدّث العنوان والميتا والأيقونات بعد جلب إعدادات الجيم من الـ API. */
export function GymBrandingHeadSync() {
  const { gymName, logo192Url, logo512Url } = useGymBranding();

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.title = gymName;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", gymName);
    document
      .querySelector('meta[name="apple-mobile-web-app-title"]')
      ?.setAttribute("content", gymName);
    document
      .querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]')
      .forEach((el) => el.setAttribute("href", logo192Url));
    document
      .querySelectorAll('link[rel="apple-touch-icon"]')
      .forEach((el) => el.setAttribute("href", logo512Url));
  }, [gymName, logo192Url, logo512Url]);

  return null;
}
