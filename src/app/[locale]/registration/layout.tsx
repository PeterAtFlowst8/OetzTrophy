import type { Metadata } from 'next';

const meta = {
  de: {
    title: 'Boater X Anmeldung — Oetz Kayak Cross 2026',
    description: 'Melde dich für den Oetz Kayak Cross (Boater X) an. Offene Anmeldung für alle Paddler mit Wildwassererfahrung ab WW III. 18. September 2026 auf der Ötztaler Ache in Tirol.',
  },
  en: {
    title: 'Boater X Registration — Oetz Kayak Cross 2026',
    description: 'Register for the Oetz Kayak Cross (Boater X). Open entry for all paddlers with whitewater experience from class III. 18 September 2026 on the Ötztaler Ache in Tyrol, Austria.',
  },
};

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const m = meta[(locale === 'en' ? 'en' : 'de') as keyof typeof meta];
  return { title: m.title, description: m.description };
}

export default function RegistrationLayout({ children }: { children: React.ReactNode }) {
  return children;
}
