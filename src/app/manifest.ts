import type { MetadataRoute } from "next";
import {
  fallbackGymName,
  fallbackLogo192,
  fallbackLogo512,
} from "@/lib/gym-branding";

const logo192 = fallbackLogo192;
const logo512 = fallbackLogo512;
const gymName = fallbackGymName;

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: gymName,
    short_name: gymName,
    description: `${gymName} Application`,
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
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
