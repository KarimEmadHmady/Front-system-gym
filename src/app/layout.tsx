import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Cairo, Roboto } from "next/font/google"; 
import "./globals.css";
import { gymName } from "@/lib/gym-name";
import { fallbackLogo192, fallbackLogo512 } from "@/lib/gym-branding";
import { getLocale } from "next-intl/server";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["200","300","400","500","600","700","800","900"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300","400","500","700"],
});

const favicon192 = fallbackLogo192;
const favicon512 = fallbackLogo512;

const scrollbarThumb =
  process.env.NEXT_PUBLIC_SCROLLBAR_THUMB_COLOR ?? "rgb(255, 211, 16)";
const scrollbarTrack =
  process.env.NEXT_PUBLIC_SCROLLBAR_TRACK_COLOR ??
  "rgba(108, 0, 162, 0.1)";

export const metadata: Metadata = {
  title: gymName,
  description: "إدارة صالة الألعاب الرياضية",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let locale = "ar";
  try {
    locale = await getLocale();
  } catch (err) {
    // fallback if getLocale fails outside next-intl context
  }
  
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      data-scroll-behavior="smooth"
      style={
        {
          "--scrollbar-thumb-color": scrollbarThumb,
          "--scrollbar-track-color": scrollbarTrack,
        } as CSSProperties
      }
    >
      <head>
        <meta name="google" content="notranslate" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href={favicon192} />
        <link rel="shortcut icon" href={favicon512} />
        
        {/* PWA meta tags from previous locale layout */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={gymName} />
        <link rel="apple-touch-icon" href={favicon512} />
      </head>
      {/* ✅ Cairo + Roboto */}
      <body className={`${cairo.variable} ${roboto.variable} antialiased`}>
        {children}
        {/* Initialize online listener in a client component */}
      </body>
    </html>
  );
}
