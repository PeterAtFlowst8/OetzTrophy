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

const agdasima = Agdasima({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-agdasima',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'OETZ TROPHY — Extreme Kayak Championships',
  description: 'Das härteste Kajak-Rennen der Alpen. Ötztaler Ache, WW V. Nur auf Einladung.',
  openGraph: {
    title: 'OETZ TROPHY — Extreme Kayak Championships',
    description: 'Das härteste Kajak-Rennen der Alpen. Nur auf Einladung.',
    siteName: 'OETZ TROPHY',
    type: 'website',
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

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
