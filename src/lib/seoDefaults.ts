/**
 * Built-in SEO meta (title + description) per page and language.
 *
 * Single source of truth: page `generateMetadata` functions fall back to these
 * via `getPageSeo()` when the matching Studio field is blank, and the Studio
 * shows them as greyed placeholders in the SEO fields. Moved here from the
 * former per-page `const meta` objects.
 */

export type SeoPageKey =
  | 'homepage'
  | 'oetzTrophy'
  | 'boaterX'
  | 'kajakfestival'
  | 'kontakt'
  | 'registration'
  | 'news'
  | 'gallery'
  | 'results'
  | 'terms'
  | 'impressum'
  | 'datenschutz';

type LocalizedSeo = { title: string; description: string };

export const SEO_DEFAULTS: Record<SeoPageKey, { de: LocalizedSeo; en: LocalizedSeo }> = {
  homepage: {
    de: {
      title: 'OETZ TROPHY - Extreme Kayak Championships · Ötztaler Ache',
      description:
        'Das Ötztaler Kajakfestival 2026: 4 Tage Wildwasser, der offene Boater X und die OETZ TROPHY auf der Ötztaler Ache. 17.-20. September 2026 in Oetz, Tirol, Österreich.',
    },
    en: {
      title: 'OETZ TROPHY - Extreme Kayak Championships · Ötztaler Ache',
      description:
        'The Ötztal Kayak Festival 2026: 4 days of whitewater racing, the open Boater X and the OETZ TROPHY on the Ötztaler Ache. 17-20 September 2026 in Oetz, Tyrol, Austria.',
    },
  },
  oetzTrophy: {
    de: {
      title: 'OETZ TROPHY - Das härteste Kajakrennen der Welt 2026',
      description:
        'Die OETZ TROPHY auf der Ötztaler Ache: Wildwasser V, Start nur nach Qualifikation. Die Rennstrecke fordert Erfahrung, Technik und Mut. 19. September 2026 in Oetz, Tirol.',
    },
    en: {
      title: 'OETZ TROPHY - The Hardest Kayak Race in the World 2026',
      description:
        'The OETZ TROPHY on the Ötztaler Ache: class V whitewater, qualification required. The course demands experience, technique and courage. 19 September 2026 in Oetz, Tyrol.',
    },
  },
  boaterX: {
    de: {
      title: 'Boater X - Kajak Cross auf der Slalomstrecke in Oetz',
      description:
        'Der Boater X (Oetz Kayak Cross) am Freitagnachmittag auf der Slalomstrecke in Oetz. Teilnahme für Paddler, die sich nicht für die OETZ TROPHY qualifiziert haben. Begrenzt auf 32 Männer und 16 Frauen. 18. September 2026.',
    },
    en: {
      title: 'Boater X - Kayak Cross on the Slalom Course in Oetz',
      description:
        'Boater X (Oetz Kayak Cross) on Friday afternoon at the slalom course in Oetz. For paddlers who did not qualify for the OETZ TROPHY. Capped at 32 men and 16 women. 18 September 2026.',
    },
  },
  kajakfestival: {
    de: {
      title: 'Kajakfestival - 4 Tage Wildwasser im Ötztal 2026',
      description:
        'Das Ötztaler Kajakfestival: 4 Tage Wildwasser, Rennen, Testboote, Filmvorführungen und Musik. Die Paddel-Community trifft sich in Oetz, Tirol.',
    },
    en: {
      title: 'Kayak Festival - 4 Days of Whitewater in Ötztal 2026',
      description:
        'The Ötztal Kayak Festival: 4 days of whitewater, racing, demo boats, film screenings and music. The paddling community gathers in Oetz, Tyrol, Austria.',
    },
  },
  kontakt: {
    de: {
      title: 'Kontakt - OETZ TROPHY Veranstalter Source To Sea',
      description:
        'Kontakt zur OETZ TROPHY: Source To Sea GmbH, Natterer See 1, 6161 Natters, Tirol. Telefon, E-Mail und Social Media. Wir freuen uns auf deine Nachricht.',
    },
    en: {
      title: 'Contact - OETZ TROPHY Organiser Source To Sea',
      description:
        'Contact OETZ TROPHY: Source To Sea GmbH, Natterer See 1, 6161 Natters, Tyrol, Austria. Phone, email, and social media. We look forward to hearing from you.',
    },
  },
  registration: {
    de: {
      title: 'Anmeldung - OETZ TROPHY Rennwochenende 2026',
      description:
        'Melde dich für das OETZ TROPHY Rennwochenende 2026 an. Qualifikation, Boater X und OETZ TROPHY auf der Ötztaler Ache in Tirol.',
    },
    en: {
      title: 'Registration - OETZ TROPHY Race Weekend 2026',
      description:
        'Register for the OETZ TROPHY race weekend 2026. Qualification, Boater X and OETZ TROPHY on the Ötztaler Ache in Tyrol, Austria.',
    },
  },
  news: {
    de: {
      title: 'News & Berichte - OETZ TROPHY Kajakfestival Ötztal',
      description:
        'Aktuelle Neuigkeiten, Rennberichte und Ergebnisse rund um die OETZ TROPHY, den Boater X und das Kajakfestival auf der Ötztaler Ache in Tirol, Österreich.',
    },
    en: {
      title: 'News & Reports - OETZ TROPHY Kayak Festival Ötztal',
      description:
        'Latest news, race reports and results from the OETZ TROPHY, the Boater X and the Kayak Festival on the Ötztaler Ache in Tyrol, Austria. Updated regularly.',
    },
  },
  gallery: {
    de: {
      title: 'Galerie - OETZ TROPHY Fotos & Videos',
      description:
        'Fotos und Videos von der OETZ TROPHY, dem Boater X und dem Ötztaler Kajakfestival. Eindrücke von der Ötztaler Ache in Tirol.',
    },
    en: {
      title: 'Gallery - OETZ TROPHY Photos & Videos',
      description:
        'Photos and videos from the OETZ TROPHY, Boater X and the Ötztal Kayak Festival. Impressions from the Ötztaler Ache in Tyrol, Austria.',
    },
  },
  results: {
    de: {
      title: 'Ergebnisse - OETZ TROPHY & Boater X',
      description:
        'Ergebnisse der OETZ TROPHY und des Boater X. Zeitfahren und Head-to-Head-Rennen auf der Ötztaler Ache in Oetz, Tirol.',
    },
    en: {
      title: 'Results - OETZ TROPHY & Boater X',
      description:
        'Results from the OETZ TROPHY and Boater X. Time trial and head-to-head racing on the Ötztaler Ache in Oetz, Tyrol, Austria.',
    },
  },
  terms: {
    de: {
      title: 'Teilnahmebedingungen',
      description:
        'Teilnahmebedingungen für die Anmeldung zum OETZ TROPHY Rennwochenende 2026.',
    },
    en: {
      title: 'Terms & Conditions',
      description:
        'Participant terms for registration to the OETZ TROPHY race weekend 2026.',
    },
  },
  impressum: {
    de: {
      title: 'Impressum - OETZ TROPHY Source To Sea GmbH Tirol',
      description:
        'Impressum und rechtliche Angaben zur OETZ TROPHY: Source To Sea GmbH, Natterer See 1, 6161 Natters, Tirol, Österreich. Haftungshinweis für externe Links.',
    },
    en: {
      title: 'Legal Notice - OETZ TROPHY Source To Sea GmbH Tyrol',
      description:
        'Legal notice and imprint for OETZ TROPHY: Source To Sea GmbH, Natterer See 1, 6161 Natters, Tyrol, Austria. Liability information for external links.',
    },
  },
  datenschutz: {
    de: {
      title: 'Datenschutz - OETZ TROPHY Datenschutzerklärung DSGVO',
      description:
        'Datenschutzerklärung der OETZ TROPHY: Informationen zur Erhebung, Verarbeitung und Nutzung personenbezogener Daten gemäß DSGVO. Source To Sea GmbH, Natters.',
    },
    en: {
      title: 'Privacy Policy - OETZ TROPHY Data Protection GDPR',
      description:
        'Privacy policy for OETZ TROPHY: Information on the collection, processing and use of personal data in accordance with GDPR. Source To Sea GmbH, Natters, Austria.',
    },
  },
};

/** Pure merge: non-empty Studio override wins per field, else built-in. */
export function mergeSeo(
  override: { title?: { de?: string; en?: string }; description?: { de?: string; en?: string } } | null | undefined,
  key: SeoPageKey,
  locale: string,
): LocalizedSeo {
  const lang = locale === 'en' ? 'en' : 'de';
  const fallback = SEO_DEFAULTS[key][lang];
  const pick = (value: string | undefined, fb: string) =>
    typeof value === 'string' && value.trim() !== '' ? value.trim() : fb;

  return {
    title: pick(override?.title?.[lang], fallback.title),
    description: pick(override?.description?.[lang], fallback.description),
  };
}

/** Studio field name for a page's SEO object, e.g. 'kontakt' -> 'seoKontakt'. */
export function seoFieldName(key: SeoPageKey): string {
  return `seo${key.charAt(0).toUpperCase()}${key.slice(1)}`;
}
