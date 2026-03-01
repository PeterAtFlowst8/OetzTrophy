export type Post = {
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  href: string;
};

// Hardcoded from WP export — replace with Sanity query in v2
export const latestPosts: Post[] = [
  {
    title: 'Regeln zur Teilnahme am Oetz Kayak Cross',
    slug: 'regeln-zur-teilnahme',
    date: '28. August 2024',
    excerpt: 'Sicherheit, Material und Ablauf — alles, was Athletinnen und Athleten vor dem Rennen wissen müssen.',
    href: '/news/regeln-zur-teilnahme',
  },
  {
    title: '„Noetztal" — von Bren Orton',
    slug: 'noetztal-bren-orton',
    date: '3. November 2023',
    excerpt: 'Bren Orton über das Hochwasser 2023, die Ötztaler Ache und warum dieser Fluss ihn nicht loslässt.',
    href: '/news/noetztal-bren-orton',
  },
  {
    title: 'Absage OETZ TROPHY 2024',
    slug: 'absage-2024',
    date: '28. Januar 2024',
    excerpt: 'Nach dem Hochwasser 2023 musste die OETZ TROPHY 2024 leider abgesagt werden. Hier sind die Hintergründe.',
    href: '/news/absage-2024',
  },
];
