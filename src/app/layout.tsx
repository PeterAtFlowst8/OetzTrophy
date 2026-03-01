import type { Metadata } from 'next';
import { Agdasima, Inter } from 'next/font/google';
import './globals.css';

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
  description: 'Das härteste Kajak-Rennen der Alpen. Ötztaler Ache, WW III–IV. Nur auf Einladung.',
  openGraph: {
    title: 'OETZ TROPHY — Extreme Kayak Championships',
    description: 'Das härteste Kajak-Rennen der Alpen. Nur auf Einladung.',
    siteName: 'OETZ TROPHY',
    locale: 'de_AT',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className={`${agdasima.variable} ${inter.variable}`}>
        {children}
      </body>
    </html>
  );
}
