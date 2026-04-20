import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import ReduxProvider from '@/redux/ReduxProvider';
import InstallPWAButton from '@/components/InstallPWAButton';
import { GymBrandingProvider, GymBrandingHeadSync } from '@/contexts/GymBrandingContext';
import { fallbackLogo192, fallbackLogo512 } from '@/lib/gym-branding';
import { FeaturesProvider } from "@/contexts/FeaturesContext";

async function getMessages(locale: string) {
  try {
    return (await import(`@/messages/${locale}.json`)).default;
  } catch (error) {
    console.error(`Failed to load messages for locale: ${locale}`, error);
    return {};
  }
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Ensure that the incoming `locale` is valid
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Load messages for the current locale
  const messages = await getMessages(locale);

  const favicon192 = fallbackLogo192;
  const favicon512 = fallbackLogo512;

  return (
    <div className="locale-layout">
      <ReduxProvider>
        <GymBrandingProvider>
          <GymBrandingHeadSync />
          <NextIntlClientProvider locale={locale} messages={messages}>

            <div className="relative z-10">

              <FeaturesProvider>
                {children}
              </FeaturesProvider>
            </div>

            <InstallPWAButton />
          </NextIntlClientProvider>
        </GymBrandingProvider>
      </ReduxProvider>
    </div>
  );
}