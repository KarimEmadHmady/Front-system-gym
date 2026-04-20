import type { MetadataRoute } from "next";
import {
  fallbackGymName,
  fallbackLogo192,
  fallbackLogo512,
} from "@/lib/gym-branding";

// Get PWA colors from environment variables or use defaults
const primaryColor = process.env.NEXT_PUBLIC_PWA_PRIMARY_COLOR || "#000000";
const backgroundColor = process.env.NEXT_PUBLIC_PWA_BACKGROUND_COLOR || "#FFFFFF";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  // Get gym settings dynamically
  const getGymSettings = async () => {
    try {
      const { GymSettingsService } = await import("@/services/gymSettingsService");
      const svc = new GymSettingsService();
      return await svc.get();
    } catch {
      return null;
    }
  };

  const settings = await getGymSettings();
  const apiLogo = settings?.logoUrl?.trim() || '';
  const gymName = settings?.gymName?.trim() || fallbackGymName;
  
  // Use API logo if available, otherwise use fallback
  const logo192 =  fallbackLogo192;
  const logo512 = fallbackLogo512;

  return {
    name: gymName,
    short_name: gymName,
    description: `${gymName} Application`,
    start_url: "/",
    display: "standalone",
    background_color: backgroundColor,
    theme_color: primaryColor,
    orientation: "portrait",
    scope: "/",
    id: `manifest-${Date.now()}`, // Force refresh
    lang: "ar",
    dir: "rtl",
    categories: ["fitness", "health", "sports"],
    icons: [
      {
        src: logo192,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: logo192,
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: logo512,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: logo512,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: "/banner1280.png",
        sizes: "1280x720",
        type: "image/jpeg",
        form_factor: "wide",
      },
    ],
  };
}
