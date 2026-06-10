import type { Metadata } from 'next';
import { Agdasima, Inter } from 'next/font/google';
import { hasLocale } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import GrainOverlay from '@/components/GrainOverlay';
import { getSiteImage, getPageSeo } from '@/lib/siteContent';
import { SITE_URL as BASE_URL } from '@/lib/site';
import '@/app/globals.css';

const agdasima = Agdasima({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-agdasima',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  // Homepage / site-default meta, editable in Studio (blank = built-in copy).
  const m = await getPageSeo('homepage', locale);

  // Social-share image follows the client-managed hero photo.
  const ogImage = await getSiteImage('hero', '/images/hero.jpg', { width: 1200, height: 630 });

  return {
    title: {
      default: m.title,
      template: '%s | OETZ TROPHY',
    },
    description: m.description,
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: {
        de: `${BASE_URL}/de`,
        en: `${BASE_URL}/en`,
      },
    },
    openGraph: {
      title: m.title,
      description: m.description,
      siteName: 'OETZ TROPHY',
      type: 'website',
      locale: locale === 'de' ? 'de_AT' : 'en_GB',
      url: `${BASE_URL}/${locale}`,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: m.title,
      description: m.description,
      images: [ogImage],
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

  // Single client-managed logo. Each nav state keeps its current file as the
  // fallback, so the look is unchanged until a logo is uploaded; once it is,
  // the same image is used everywhere.
  const [logoSolid, logoTransparent] = await Promise.all([
    getSiteImage('logo', '/images/logo-dark.webp'),
    getSiteImage('logo', '/images/logo-white.webp'),
  ]);

  return (
    <html lang={locale} data-scroll-behavior="smooth" className="overflow-x-hidden">
      <body className={`${agdasima.variable} ${inter.variable} overflow-x-hidden`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Nav logoSolid={logoSolid} logoTransparent={logoTransparent} />
          {children}
          <Footer />
          <GrainOverlay />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
