import type { Metadata } from 'next';
import { getSiteSettings } from '@/lib/settings';

const meta = {
  de: {
    title: 'Anmeldung — Boater X & OETZ TROPHY 2026',
    description: 'Melde dich für den Boater X an — gleichzeitig Qualifikation für die OETZ TROPHY. Offene Anmeldung für alle Paddler mit Wildwassererfahrung ab WW III. 18.–19. September 2026 auf der Ötztaler Ache in Tirol.',
  },
  en: {
    title: 'Registration — Boater X & OETZ TROPHY 2026',
    description: 'Register for the Boater X — also the qualifier for the OETZ TROPHY. Open entry for all paddlers with whitewater experience from class III. 18–19 September 2026 on the Ötztaler Ache in Tyrol, Austria.',
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
  // Fetch settings to check if registration is open
  // This data is available to child pages via the Sanity API
  // The client component will check the date independently
  return <>{children}</>;
}
