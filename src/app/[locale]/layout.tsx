import type { Metadata } from 'next';
import { Agdasima, Inter } from 'next/font/google';
import { hasLocale } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import '@/app/globals.css';

const BASE_URL = 'https://oetz-trophy.vercel.app';

const agdasima = Agdasima({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-agdasima',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const meta = {
  de: {
    title: 'OETZ TROPHY — Extreme Kayak Championships',
    description: 'Das Ötztaler Kajakfestival: 4 Tage Wildwasser, Boater X und die OETZ TROPHY. 17.–20. September 2026 in Oetz, Tirol.',
  },
  en: {
    title: 'OETZ TROPHY — Extreme Kayak Championships',
    description: 'The Ötztal Kayak Festival: 4 days of whitewater, Boater X, and the OETZ TROPHY. 17–20 September 2026 in Oetz, Tyrol, Austria.',
  },
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const l = (locale === 'en' ? 'en' : 'de') as keyof typeof meta;
  const m = meta[l];

  return {
    title: {
      default: m.title,
      template: '%s | OETZ TROPHY',
    },
    description: m.description,
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: locale === 'de' ? BASE_URL : `${BASE_URL}/en`,
      languages: {
        de: BASE_URL,
        en: `${BASE_URL}/en`,
      },
    },
    openGraph: {
      title: m.title,
      description: m.description,
      siteName: 'OETZ TROPHY',
      type: 'website',
      locale: locale === 'de' ? 'de_AT' : 'en_GB',
      url: locale === 'de' ? BASE_URL : `${BASE_URL}/en`,
      images: [{ url: '/images/hero.jpg', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: m.title,
      description: m.description,
      images: ['/images/hero.jpg'],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className="overflow-x-hidden">
      <body className={`${agdasima.variable} ${inter.variable} overflow-x-hidden`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Nav />
          {children}
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
