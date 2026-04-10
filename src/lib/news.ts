export type Post = {
  title: string;
  slug: string;
  date: string;
  excerpt: string;
};

// Hardcoded from WP export — replace with Sanity query when CMS is populated
export const latestPosts: Post[] = [
  {
    title: 'Regeln zur Teilnahme am Oetz Kayak Cross',
    slug: 'regeln-zur-teilnahme',
    date: '28. August 2024',
    excerpt: 'Sicherheit, Material und Ablauf — alles, was Athletinnen und Athleten vor dem Rennen wissen müssen.',
  },
  {
    title: '„Noetztal" — von Bren Orton',
    slug: 'noetztal-bren-orton',
    date: '3. November 2023',
    excerpt: 'Bren Orton über das Hochwasser 2023, die Ötztaler Ache und warum dieser Fluss ihn nicht loslässt.',
  },
  {
    title: 'Absage OETZ TROPHY 2024',
    slug: 'absage-2024',
    date: '28. Januar 2024',
    excerpt: 'Nach dem Hochwasser 2023 musste die OETZ TROPHY 2024 leider abgesagt werden. Hier sind die Hintergründe.',
  },
];

// Full news archive for the /news page
export const allPosts: Post[] = [
  ...latestPosts,
  {
    title: 'OETZ TROPHY 2023 — Results',
    slug: 'results-2023',
    date: '25. September 2023',
    excerpt: 'Die Ergebnisse der OETZ TROPHY 2023 sind da. Alle Platzierungen und Zeiten im Überblick.',
  },
  {
    title: 'Oetz Kayak Cross 2023 — Recap',
    slug: 'oetz-kayak-cross-2023',
    date: '23. September 2023',
    excerpt: 'Rückblick auf den Boater Cross 2023 — spannende Rennen, enge Duelle und beste Stimmung auf der Ötztaler Ache.',
  },
  {
    title: 'Kajakfestival 2023 — Das Programm',
    slug: 'kajakfestival-2023-programm',
    date: '1. September 2023',
    excerpt: 'Das vollständige Programm für das Ötztaler Kajakfestival 2023 — vier Tage Wildwasser, Wettbewerb und Community.',
  },
  {
    title: 'Hochwasser Ötztaler Ache — August 2023',
    slug: 'hochwasser-2023',
    date: '16. August 2023',
    excerpt: 'Das Hochwasser im August 2023 hat die Rennstrecke der Ötztaler Ache stark verändert. Ein Bericht über die Schäden und Auswirkungen.',
  },
  {
    title: 'OETZ TROPHY 2022 — Final Results',
    slug: 'results-2022',
    date: '20. September 2022',
    excerpt: 'Die offiziellen Ergebnisse der OETZ TROPHY 2022 — das härteste Kajakrennen in den Alpen.',
  },
  {
    title: 'Media Contest — Gewinnerfotos 2022',
    slug: 'media-contest-2022',
    date: '15. Oktober 2022',
    excerpt: 'Die besten Fotos und Videos des Media Contest 2022. Beeindruckende Aufnahmen von der Ötztaler Ache.',
  },
];
