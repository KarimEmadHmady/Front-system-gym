import type { MetadataRoute } from "next";
import {
  fallbackGymName,
  fallbackLogo192,
  fallbackLogo512,
} from "@/lib/gym-branding";

const logo192 = fallbackLogo192;
const logo512 = fallbackLogo512;
const gymName = fallbackGymName;

// Get PWA colors from environment variables or use defaults
const primaryColor = process.env.NEXT_PUBLIC_PWA_PRIMARY_COLOR || "#000000";
const backgroundColor = process.env.NEXT_PUBLIC_PWA_BACKGROUND_COLOR || "#FFFFFF";

export default function manifest(): MetadataRoute.Manifest {
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
