import { defineType, defineField } from 'sanity';
import { EditIcon } from '@sanity/icons';
import enMessages from '../../../messages/en.json';

/**
 * Editable UI text + images for the whole marketing site.
 *
 * The text fields are generated from `messages/en.json` so the Studio always
 * mirrors the app's translation keys (no manual list to keep in sync). Each
 * key becomes a `{ de, en }` pair. The frontend (src/i18n/request.ts) merges
 * any non-empty values here on top of the static JSON message files, so the
 * JSON acts as a safety-net fallback and the site never breaks if a field is
 * left blank or Sanity is unreachable.
 */

const messages = enMessages as Record<string, Record<string, string>>;

// Friendly section titles for the Studio (falls back to the raw namespace).
const SECTION_TITLES: Record<string, string> = {
  hero: 'Homepage — Hero',
  countdown: 'Countdown',
  marquee: 'Marquee Ticker',
  dasRennen: 'Homepage — Race Teaser',
  festivalOverview: 'Homepage — Festival Overview',
  events: 'Homepage — Events',
  news: 'Homepage — News',
  sponsors: 'Homepage — Sponsors',
  footer: 'Footer',
  nav: 'Navigation',
  impressum: 'Legal Notice Page',
  datenschutz: 'Privacy Policy Page',
  oetzTrophy: 'OETZ TROPHY Page',
  boaterX: 'Boater X Page',
  kajakfestival: 'Kayak Festival Page',
  kontakt: 'Contact Page',
  gallery: 'Gallery Page',
  results: 'Results Page',
  registration: 'Registration Page',
};

/** One translatable key → a collapsible `{ de, en }` pair. */
function localizedLeaf(key: string, sample: string) {
  const multiline = sample.length > 60 || sample.includes('\n');
  const langField = (name: 'de' | 'en', title: string) =>
    multiline
      ? defineField({ name, title, type: 'text', rows: 3 })
      : defineField({ name, title, type: 'string' });
  return defineField({
    name: key,
    title: key,
    type: 'object',
    options: { columns: 2 },
    // Show the original English copy so editors know what each key controls.
    description: sample.length > 140 ? `${sample.slice(0, 137)}…` : sample,
    fields: [langField('de', '🇩🇪 Deutsch'), langField('en', '🇬🇧 English')],
  });
}

const textSections = Object.entries(messages).map(([namespace, entries]) =>
  defineField({
    name: namespace,
    title: SECTION_TITLES[namespace] ?? namespace,
    type: 'object',
    options: { collapsible: true, collapsed: true },
    fields: Object.entries(entries).map(([key, sample]) =>
      localizedLeaf(key, sample),
    ),
  }),
);

function imageField(name: string, title: string) {
  return defineField({
    name,
    title,
    type: 'image',
    options: { hotspot: true },
    fields: [{ name: 'alt', type: 'string', title: 'Alt Text' }],
  });
}

const imagesSection = defineField({
  name: 'images',
  title: 'Images',
  type: 'object',
  description:
    'Replace the main photos used across the site. Leave empty to keep the current built-in image.',
  options: { collapsible: true, collapsed: true },
  fields: [
    imageField('hero', 'Homepage — Hero'),
    imageField('festivalOverview', 'Homepage — Festival Section'),
    imageField('oetzTrophy', 'OETZ TROPHY — Page Header'),
    imageField('boaterX', 'Boater X — Page Header'),
    imageField('kajakfestival', 'Kayak Festival — Page Header'),
    imageField('kontakt', 'Contact — Page Header'),
  ],
});

export const siteContent = defineType({
  name: 'siteContent',
  title: 'Website Text & Images',
  type: 'document',
  icon: EditIcon,
  fields: [imagesSection, ...textSections],
  preview: {
    prepare() {
      return { title: 'Website Text & Images' };
    },
  },
});
