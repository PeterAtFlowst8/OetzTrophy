import type { Metadata } from 'next';

const meta = {
  de: {
    title: 'Anmeldung — OETZ TROPHY Rennwochenende 2026',
    description: 'Melde dich für das OETZ TROPHY Rennwochenende 2026 an. Qualifikation, Boater X und OETZ TROPHY auf der Ötztaler Ache in Tirol.',
  },
  en: {
    title: 'Registration — OETZ TROPHY Race Weekend 2026',
    description: 'Register for the OETZ TROPHY race weekend 2026. Qualification, Boater X and OETZ TROPHY on the Ötztaler Ache in Tyrol, Austria.',
  },
};

type Props = { params: Promise<{ locale: string }>; children: React.ReactNode };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = meta[(locale === 'en' ? 'en' : 'de') as keyof typeof meta];
  return { title: m.title, description: m.description };
}

export const revalidate = 60;

export default async function RegistrationLayout({ children }: Props) {
  return <>{children}</>;
}
