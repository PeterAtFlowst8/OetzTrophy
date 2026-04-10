type Props = {
  data: Record<string, unknown>;
};

export default function JsonLd({ data }: Props) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'OETZ TROPHY',
  url: 'https://oetz-trophy.vercel.app',
  logo: 'https://oetz-trophy.vercel.app/images/logo-dark.webp',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+43-512-546710',
    email: 'info@oetz-trophy.com',
    contactType: 'customer service',
  },
  sameAs: [
    'https://www.instagram.com/oetz_trophy/',
    'https://www.youtube.com/c/OETZTROPHYExtremeKayakChampionships',
    'https://www.facebook.com/oetztrophy',
  ],
};

export const festivalEventSchema = {
  '@context': 'https://schema.org',
  '@type': 'SportsEvent',
  name: 'Ötztaler Kajakfestival 2026',
  description: 'Annual kayak festival featuring the OETZ TROPHY race, Boater X, and community events on the Ötztaler Ache.',
  startDate: '2026-09-17',
  endDate: '2026-09-20',
  eventStatus: 'https://schema.org/EventScheduled',
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  location: {
    '@type': 'Place',
    name: 'Oetz, Ötztal',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Oetz',
      addressRegion: 'Tirol',
      addressCountry: 'AT',
    },
  },
  organizer: {
    '@type': 'Organization',
    name: 'Source To Sea GmbH',
    url: 'https://s2s.at',
  },
  subEvent: [
    {
      '@type': 'SportsEvent',
      name: 'OETZ TROPHY',
      startDate: '2026-09-19',
      description: 'Invite-only extreme kayak race on the Ötztaler Ache, WW V.',
    },
    {
      '@type': 'SportsEvent',
      name: 'Boater X — Oetz Kayak Cross',
      startDate: '2026-09-18',
      description: 'Open entry kayak cross race. Four paddlers, head-to-head.',
    },
  ],
};
