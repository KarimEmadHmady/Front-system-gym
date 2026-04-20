/** قيم افتراضية من البيئة — تُستبدل ببيانات `/gym-settings` عند توفرها (مع توكن). */
export const fallbackGymName =
  process.env.NEXT_PUBLIC_GYM_NAME ?? "GYM";

export const fallbackLogoUrl =
  process.env.NEXT_PUBLIC_LOGO_URL ;

export const fallbackLogo192 =
  process.env.NEXT_PUBLIC_LOGO192_URL ??
  process.env.NEXT_PUBLIC_LOGO_URL ??
  "/logo192.png";

export const fallbackLogo512 =
  process.env.NEXT_PUBLIC_LOGO512_URL ??
  process.env.NEXT_PUBLIC_LOGO_URL ??
  "/logo512.png";
