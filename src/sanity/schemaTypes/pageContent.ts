import { defineType, defineField } from 'sanity';
import {
  HomeIcon,
  StarIcon,
  BoltIcon,
  CalendarIcon,
  ClockIcon,
  ClipboardIcon,
  DocumentTextIcon,
  ImagesIcon,
  ChartUpwardIcon,
  EnvelopeIcon,
  BookIcon,
  MenuIcon,
  ColorWheelIcon,
} from '@sanity/icons';
import type { ComponentType } from 'react';
import enMessages from '../../../messages/en.json';
import deMessages from '../../../messages/de.json';
import { EDITABLE_SITE_CONTENT_KEYS } from '../../lib/siteContentFields';
import { SEO_DEFAULTS, seoFieldName, type SeoPageKey } from '../../lib/seoDefaults';
import { PAGE_DOCUMENTS } from '../../lib/pageDocuments';
import { makeFallbackPlaceholderInput } from '../components/FallbackPlaceholderInput';

/**
 * Editable UI text + images for the whole marketing site — one document per
 * page (see `lib/pageDocuments.ts` for the partition). Field names are
 * IDENTICAL to the former `siteContent` singleton; the read layer merges the
 * page documents over that legacy document, so values copied by the one-time
 * migration script keep flowing and nothing here needed renaming.
 *
 * The text fields are generated from `messages/en.json` so the Studio always
 * mirrors the app's translation keys. Each key becomes a `{ de, en }` pair.
 * The frontend merges non-empty values here over the static JSON files, so
 * blank fields safely fall back to the built-in copy. Each language box shows
 * its current built-in copy as a greyed placeholder (see localizedLeaf).
 */

const messages = enMessages as Record<string, Record<string, string>>;
const messagesDe = deMessages as Record<string, Record<string, string>>;

const SECTION_TITLES: Record<string, string> = {
  hero: 'Homepage Hero',
  countdown: 'Countdown',
  marquee: 'Ticker Banner',
  calendar: 'Calendar Buttons',
  dasRennen: 'Homepage Race Teaser',
  festivalOverview: 'Homepage Festival Overview',
  events: 'Homepage Programme Cards',
  news: 'Homepage News Preview',
  sponsors: 'Footer Sponsors',
  footer: 'Footer',
  nav: 'Navigation',
  impressum: 'Legal Notice Page',
  datenschutz: 'Privacy Policy Page',
  terms: 'Terms & Conditions Page',
  kajakfestival: 'Kayak Festival Schedule & Location',
  programm: 'Program Page',
  kontakt: 'Contact Page',
  gallery: 'Gallery Page',
  results: 'Results Page',
  registration: 'Registration Page',
};

const SECTION_DESCRIPTIONS: Record<string, string> = {
  hero: 'First screen of the homepage: date badge, headline, location, registration button and hero image alt text.',
  countdown: 'Small countdown labels shown over the homepage hero.',
  marquee: 'Scrolling ticker items below the homepage hero.',
  calendar: 'Labels for the save-to-calendar buttons on the homepage.',
  dasRennen: 'Homepage teaser for the OETZ TROPHY race.',
  festivalOverview: 'Homepage section describing the four festival days.',
  events: 'Programme cards on the homepage.',
  news: 'Headings and button labels for the homepage news preview.',
  sponsors: 'Heading for the sponsor logos in the footer.',
  nav: 'Top navigation and mobile menu labels.',
  footer: 'Footer tagline and legal/contact links.',
  kajakfestival: 'Only the schedule table and location block on the Kayak Festival page. The page title, intro and main body text live in "Race & Festival Pages (main text)" → Kayak Festival (a separate item in the left menu).',
  kontakt: 'Labels on the contact page.',
  programm: 'Intro text and headings on the visitor programme page (the map itself is added separately).',
  gallery: 'Coming-soon text for the gallery page.',
  results: 'Coming-soon text for the results page.',
  registration: 'Copy, field labels and confirmation text on the registration page.',
  terms: 'Participant terms shown from the registration form.',
  impressum: 'Legal notice page text.',
  datenschutz: 'Privacy policy page text.',
};

const FIELD_TITLES: Record<string, Record<string, string>> = {
  hero: {
    badge: 'Date badge',
    line1: 'Headline line 1',
    line2: 'Headline line 2',
    location: 'Location line',
    static: 'Countdown finished text',
    registrationCtaOpen: 'Registration button when open',
    registrationCtaClosed: 'Registration button before opening',
    imageAlt: 'Hero image alt text',
  },
  countdown: {
    festival: 'Countdown label before festival',
    days: 'Days label',
    hours: 'Hours label',
    minutes: 'Minutes label',
    seconds: 'Seconds label',
  },
  dasRennen: {
    label: 'Section label',
    headline1: 'Headline line 1',
    headline2: 'Headline line 2',
    stat0Value: 'Difficulty value',
    stat0Label: 'Difficulty label',
    stat2Value: 'Location value',
    stat2Label: 'Location label',
    stat3Value: 'Since value',
    stat3Label: 'Since label',
    body: 'Body text',
  },
  festivalOverview: {
    label: 'Section label',
    headline1: 'Headline line 1',
    headline2: 'Headline line 2',
    body: 'Body text',
    day0Label: 'Thursday short label',
    day0: 'Thursday description',
    day1Label: 'Friday short label',
    day1: 'Friday description',
    day2Label: 'Saturday short label',
    day2: 'Saturday description',
    day3Label: 'Sunday short label',
    day3: 'Sunday description',
    imageAlt: 'Festival image alt text',
  },
  events: {
    label: 'Section label',
    headline: 'Section headline',
    item0Title: 'Festival card title',
    item0Subtitle: 'Festival card subtitle',
    item1Title: 'Kayak Cross card title',
    item1Subtitle: 'Kayak Cross card subtitle',
    item2Title: 'OETZ TROPHY card title',
    item2Subtitle: 'OETZ TROPHY card subtitle',
  },
  calendar: {
    label: 'Calendar card label',
    eyebrow: 'Small heading',
    download: 'Download button',
    google: 'Google Calendar button',
    hint: 'Date and location hint',
  },
  news: {
    label: 'Section label',
    headline: 'Section headline',
    readMore: 'Article link label',
    viewAll: 'All articles button',
  },
  sponsors: {
    label: 'Footer sponsor heading',
  },
  programm: {
    label: 'Page label',
    title: 'Page title',
    intro: 'Intro text',
    scheduleHeading: 'Schedule section heading',
    mapHeading: 'Map section heading',
    mapComingSoon: 'Map coming-soon text',
  },
  nav: {
    switchTo: 'Language switch label',
    program: 'Program link',
    race: 'OETZ TROPHY link',
    boaterX: 'Kayak Cross link',
    festival: 'Festival link',
    news: 'News link',
    registration: 'Registration link',
    contact: 'Contact link',
    menuLabel: 'Mobile menu label',
  },
  footer: {
    followUs: 'Social media heading',
    tagline: 'Footer tagline',
    impressum: 'Legal notice link',
    kontakt: 'Contact link',
    datenschutz: 'Privacy policy link',
    terms: 'Terms link',
    copyright: 'Copyright line',
  },
  kajakfestival: {
    label: 'Page label',
    title: 'Page title',
    intro: 'Intro text',
    scheduleHeading: 'Schedule heading',
    day1Day: 'Thursday label',
    day1Date: 'Thursday date',
    day1Desc: 'Thursday description',
    day2Day: 'Friday label',
    day2Date: 'Friday date',
    day2Desc: 'Friday description',
    day3Day: 'Saturday label',
    day3Date: 'Saturday date',
    day3Desc: 'Saturday description',
    day4Day: 'Sunday label',
    day4Date: 'Sunday date',
    day4Desc: 'Sunday description',
    locationHeading: 'Location heading',
    locationText: 'Location text',
  },
  kontakt: {
    label: 'Page label',
    title: 'Page title',
    country: 'Country label',
    phone: 'Phone label',
    orgHeading: 'Organiser heading',
    contactHeading: 'Contact heading',
    socialHeading: 'Social media heading',
  },
  gallery: {
    label: 'Page label',
    title: 'Page title',
    comingSoon: 'Coming soon heading',
    description: 'Description text',
  },
  results: {
    label: 'Page label',
    title: 'Page title',
    comingSoon: 'Coming soon heading',
    description: 'Description text',
  },
  registration: {
    label: 'Page label',
    title: 'Page title',
    intro: 'Intro text',
    formTitle: 'Form title',
    formIntro: 'Form intro',
    raceLabel: 'Race label',
    feeLabel: 'Fee label',
    firstNameLabel: 'First name label',
    firstNamePlaceholder: 'First name placeholder',
    lastNameLabel: 'Last name label',
    lastNamePlaceholder: 'Last name placeholder',
    emailLabel: 'Email label',
    emailPlaceholder: 'Email placeholder',
    nationalityLabel: 'Nationality label',
    nationalityPlaceholder: 'Nationality placeholder',
    tshirtLabel: 'T-shirt size label',
    tshirtPlaceholder: 'T-shirt size placeholder',
    requiredNote: 'Required-fields note',
    termsPrefix: 'Terms checkbox prefix',
    termsLink: 'Terms checkbox link',
    termsSuffix: 'Terms checkbox suffix',
    awpPrefix: 'AWP rules checkbox prefix',
    awpLink: 'AWP rules checkbox link',
    awpSuffix: 'AWP rules checkbox suffix',
    ageConfirmation: 'Age confirmation checkbox',
    previewNotice: 'Preview notice',
    closedTitle: 'Closed registration title',
    closedText: 'Closed registration text',
    submit: 'Submit button',
    submitting: 'Submitting button',
    feeNote: 'Fee note',
    paymentNote: 'Payment note',
    successTitle: 'Success page title',
    successRaceText: 'Success page text',
    backHome: 'Back home button',
  },
  terms: {
    label: 'Page label',
    title: 'Page title',
    intro: 'Intro text',
    eligibilityHeading: 'Eligibility heading',
    eligibilityText: 'Eligibility text',
    rulesHeading: 'Rules heading',
    rulesText: 'Rules text',
    paymentHeading: 'Payment heading',
    paymentText: 'Payment text',
    dataHeading: 'Data and media heading',
    dataText: 'Data and media text',
    reviewNote: 'Review note',
  },
};

const OPEN_SECTIONS = new Set([
  'hero',
  'festivalOverview',
  'events',
  'registration',
]);

/**
 * Sections for site features that were removed but whose Studio data still
 * exists (deleting the field would orphan it and trigger "unknown field"
 * warnings). Hidden from editors; safe to fully remove once the data is gone.
 */
const HIDDEN_SECTIONS = new Set([
  'dasRennen', // homepage race teaser, removed from the site June 2026
]);

function truncate(value: string, length = 150) {
  return value.length > length ? `${value.slice(0, length - 1)}...` : value;
}

function titleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function fallbackTitle(key: string) {
  const readable = key
    .replace(/^s(\d+)/, 'Section $1 ')
    .replace(/^rule(\d+)/, 'Rule $1')
    .replace(/^item(\d+)/, (_, index) => `Item ${Number(index) + 1} `)
    .replace(/^stat(\d+)/, (_, index) => `Stat ${Number(index) + 1} `)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();

  return titleCase(readable)
    .replace(/\bCta\b/g, 'CTA')
    .replace(/\bAwp\b/g, 'AWP')
    .replace(/\bOetz\b/g, 'OETZ');
}

function fieldTitle(namespace: string, key: string) {
  return FIELD_TITLES[namespace]?.[key] ?? fallbackTitle(key);
}

function fieldDescription(sample: string, multiline = false) {
  const notes = [
    'Leave blank to use the built-in fallback copy for that language.',
    `Fallback English: "${truncate(sample)}"`,
  ];

  if (sample.includes('{')) {
    notes.unshift('Keep any placeholder in curly brackets, for example {opens}.');
  }

  if (multiline) {
    notes.push('You can add links: [link text](https://example.com).');
  }

  return notes.join(' ');
}

/** One translatable key -> a visible `{ de, en }` pair. */
function localizedLeaf(
  namespace: string,
  key: string,
  enSample: string,
  deSample: string,
) {
  const multiline = enSample.length > 60 || enSample.includes('\n');
  // Each box shows its current built-in copy as a greyed placeholder, so an
  // empty field reads as "currently shows this" rather than looking unset.
  const langField = (name: 'de' | 'en', title: string, placeholder: string) => {
    const input = makeFallbackPlaceholderInput(placeholder);
    return multiline
      ? defineField({ name, title, type: 'text', rows: 3, components: { input } })
      : defineField({ name, title, type: 'string', components: { input } });
  };

  return defineField({
    name: key,
    title: fieldTitle(namespace, key),
    type: 'object',
    options: { columns: 2 },
    description: fieldDescription(enSample, multiline),
    fields: [
      langField('de', 'German', deSample),
      langField('en', 'English', enSample),
    ],
  });
}

const textSections = Object.entries(messages).flatMap(([namespace, entries]) => {
  const editableKeys = EDITABLE_SITE_CONTENT_KEYS[namespace];
  if (!editableKeys) return [];

  const editableEntries = editableKeys.flatMap((key) =>
    entries[key]
      ? ([[key, entries[key], messagesDe[namespace]?.[key] ?? entries[key]]] as const)
      : [],
  );
  if (editableEntries.length === 0) return [];

  return defineField({
    name: namespace,
    title: SECTION_TITLES[namespace] ?? fallbackTitle(namespace),
    type: 'object',
    hidden: HIDDEN_SECTIONS.has(namespace) || undefined,
    description:
      SECTION_DESCRIPTIONS[namespace] ??
      'Editable website copy for this section. Blank fields use the built-in fallback copy.',
    options: { collapsible: true, collapsed: !OPEN_SECTIONS.has(namespace) },
    fields: editableEntries.map(([key, enSample, deSample]) =>
      localizedLeaf(namespace, key, enSample, deSample),
    ),
  });
});

function imageField(name: string, title: string, description: string) {
  return defineField({
    name,
    title,
    type: 'image',
    description,
    options: { hotspot: true },
    fields: [
      defineField({
        name: 'alt',
        title: 'Image description (alt text)',
        type: 'string',
        description:
          'Describe what is in the photo, for accessibility and SEO. Leave blank to use the built-in default. (Used for the hero and festival photos; page-header photos use the page title automatically.)',
      }),
    ],
  });
}

/**
 * Per-page image slots. Data is stored under the same top-level names as in
 * the former singleton (e.g. `imageKontakt`); the frontend still falls back
 * to the legacy `images.*` slots on the old document, so photos the client
 * uploaded before the per-page reorganisation keep working untouched.
 */
const pageImageFields = [
  imageField(
    'imageHero',
    'Hero photo',
    'Shown full-screen at the top of the homepage. Best as a wide action image. Leave empty to keep the current photo.',
  ),
  imageField(
    'imageFestivalOverview',
    'Festival overview photo',
    'Shown beside the four-day festival overview section on the homepage. Leave empty to keep the current photo.',
  ),
  imageField(
    'imageProgrammeFestival',
    'Programme card photo: Kayak Festival',
    'Portrait photo on the "Kayak Festival" card in the homepage programme grid. Leave empty to keep the current photo.',
  ),
  imageField(
    'imageProgrammeBoaterX',
    'Programme card photo: Kayak Cross',
    'Portrait photo on the "Kayak Cross" card in the homepage programme grid. Leave empty to keep the current photo.',
  ),
  imageField(
    'imageProgrammeOetzTrophy',
    'Programme card photo: OETZ TROPHY',
    'Portrait photo on the "OETZ TROPHY" card in the homepage programme grid. Leave empty to keep the current photo.',
  ),
  imageField(
    'imageOetzTrophy',
    'OETZ TROPHY page header photo',
    'Shown at the top of the OETZ TROPHY race page. Leave empty to keep the current photo.',
  ),
  imageField(
    'imageBoaterX',
    'Kayak Cross page header photo',
    'Shown at the top of the Kayak Cross race page. Leave empty to keep the current photo.',
  ),
  imageField(
    'imageKajakfestival',
    'Kayak Festival page header photo',
    'Shown at the top of the Kayak Festival page. Leave empty to keep the current photo.',
  ),
  imageField(
    'imageProgram',
    'Program page header photo',
    'Shown at the top of the Program page. Leave blank for the plain dark header.',
  ),
  imageField(
    'imageKontakt',
    'Contact page header photo',
    'Shown at the top of the Contact page. Leave empty to keep the current photo.',
  ),
  imageField(
    'imageRegistration',
    'Registration page header photo',
    'Shown at the top of the registration page. Leave empty to keep the current photo.',
  ),
  imageField(
    'imageNews',
    'News page header photo',
    'Shown at the top of the News page. Leave blank for the plain dark header.',
  ),
  imageField(
    'imageGallery',
    'Gallery page header photo',
    'Shown at the top of the Gallery page. Leave blank for the plain dark header.',
  ),
  imageField(
    'imageResults',
    'Results page header photo',
    'Shown at the top of the Results page. Leave blank for the plain dark header.',
  ),
  imageField(
    'imageTerms',
    'Terms & Conditions page header photo',
    'Shown at the top of the Terms & Conditions page. Leave blank for the plain dark header.',
  ),
  imageField(
    'imageImpressum',
    'Legal Notice page header photo',
    'Shown at the top of the Legal Notice page. Leave blank for the plain dark header.',
  ),
  imageField(
    'imageDatenschutz',
    'Privacy Policy page header photo',
    'Shown at the top of the Privacy Policy page. Leave blank for the plain dark header.',
  ),
  imageField(
    'imageLogo',
    'Logo',
    'Your logo. Appears in the top navigation and the footer. It sits over the hero photo and the dark footer as well as the white menu bar, so use a version that stays legible on both light and dark backgrounds. Leave blank to keep the built-in logo.',
  ),
];

/**
 * Per-page "how this page appears in Google" fields. Blank fields fall back
 * to the built-in copy (shown as the greyed placeholder), exactly like the
 * text fields above.
 */
function seoField(key: SeoPageKey, pageTitle: string) {
  const langPair = (
    name: 'title' | 'description',
    fieldTitle: string,
    fieldDescription: string,
  ) =>
    defineField({
      name,
      title: fieldTitle,
      type: 'object',
      options: { columns: 2 },
      description: fieldDescription,
      fields: (['de', 'en'] as const).map((lang) => {
        const input = makeFallbackPlaceholderInput(SEO_DEFAULTS[key][lang][name]);
        return name === 'description'
          ? defineField({
              name: lang,
              title: lang === 'de' ? 'German' : 'English',
              type: 'text',
              rows: 3,
              components: { input },
            })
          : defineField({
              name: lang,
              title: lang === 'de' ? 'German' : 'English',
              type: 'string',
              components: { input },
            });
      }),
    });

  return defineField({
    name: seoFieldName(key),
    title: `${pageTitle}: Google search result (SEO)`,
    type: 'object',
    options: { collapsible: true, collapsed: true },
    description:
      'The title and short description shown for this page on Google and when the link is shared. Leave blank to use the built-in text.',
    fields: [
      langPair('title', 'Search result title', 'Shown as the blue headline on Google. Aim for under 60 characters.'),
      langPair('description', 'Search result description', 'The grey snippet text under the headline. Aim for under 160 characters.'),
    ],
  });
}

/**
 * Hero media choice: the homepage hero can be the photo (default) or an
 * uploaded background video. The hero photo always remains the social-share
 * image and the still shown while the video loads, so it stays required.
 */
const heroMediaFields = [
  defineField({
    name: 'heroMediaType',
    title: 'Hero: photo or video',
    type: 'string',
    options: {
      list: [
        { title: 'Photo', value: 'image' },
        { title: 'Video', value: 'video' },
      ],
      layout: 'radio',
      direction: 'horizontal',
    },
    initialValue: 'image',
    description:
      'What fills the full-screen area at the top of the homepage. The hero photo is always used for link previews when the site is shared, and as the still image while the video loads.',
  }),
  defineField({
    name: 'heroVideo',
    title: 'Hero video',
    type: 'file',
    options: { accept: 'video/mp4,video/webm' },
    hidden: ({ document }) => document?.heroMediaType !== 'video',
    description:
      'Short background video without sound (MP4, ideally 5-15 MB — large files load slowly). Shown instead of the hero photo; the photo appears until the video starts.',
  }),
  defineField({
    name: 'heroVideoAutoplay',
    title: 'Autoplay the hero video',
    type: 'boolean',
    initialValue: true,
    hidden: ({ document }) => document?.heroMediaType !== 'video',
    description:
      'On: the video starts automatically and loops silently. Off: visitors see the hero photo with player controls and start the video themselves.',
  }),
];

/** Pages a custom menu item can point to (value = route). */
const MENU_PAGE_OPTIONS = [
  { title: 'Homepage', value: '/' },
  { title: 'OETZ TROPHY', value: '/oetz-trophy' },
  { title: 'Kayak Cross', value: '/boater-x' },
  { title: 'Kayak Festival', value: '/kajakfestival' },
  { title: 'Program', value: '/programm' },
  { title: 'News', value: '/news' },
  { title: 'Registration', value: '/registration' },
  { title: 'Contact', value: '/kontakt' },
  { title: 'Gallery', value: '/gallery' },
  { title: 'Results', value: '/results' },
  { title: 'Terms & Conditions', value: '/terms-and-conditions' },
  { title: 'Legal Notice', value: '/impressum' },
  { title: 'Privacy Policy', value: '/datenschutz' },
  { title: 'External link…', value: 'external' },
];

/**
 * Client-managed menu: add, remove and drag-to-reorder the navigation links.
 * Leave the list EMPTY to keep the built-in menu (whose labels are editable
 * in the Navigation section below). The Registration button and language
 * switch are always shown and are not part of this list.
 */
const menuItemsField = defineField({
  name: 'menuItems',
  title: 'Menu items',
  type: 'array',
  description:
    'The links in the top navigation and mobile menu, in order (drag to reorder). Leave the list empty to keep the standard menu. The Registration button and the language switch are always shown and are not part of this list.',
  of: [
    {
      type: 'object',
      name: 'menuItem',
      title: 'Menu item',
      fields: [
        defineField({
          name: 'label',
          title: 'Label',
          type: 'object',
          options: { columns: 2 },
          fields: [
            defineField({ name: 'de', title: 'German', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'en', title: 'English', type: 'string' }),
          ],
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'page',
          title: 'Links to',
          type: 'string',
          options: { list: MENU_PAGE_OPTIONS },
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'externalUrl',
          title: 'External URL',
          type: 'url',
          hidden: ({ parent }) => parent?.page !== 'external',
          validation: (Rule) =>
            Rule.uri({ scheme: ['http', 'https'] }).custom((value, context) => {
              const parent = context.parent as { page?: string } | undefined;
              if (parent?.page === 'external' && !value) return 'Enter the external web address.';
              return true;
            }),
        }),
      ],
      preview: {
        select: { de: 'label.de', en: 'label.en', page: 'page', externalUrl: 'externalUrl' },
        prepare({ de, en, page, externalUrl }) {
          return {
            title: de || en || 'Menu item',
            subtitle: page === 'external' ? externalUrl || 'External link' : page,
          };
        },
      },
    },
  ],
});

/**
 * Day-by-day visitor schedule on the Program page. Structured (not flat
 * strings) so the client can add days and any number of entries per day and
 * drag to reorder. An EMPTY list hides the whole section on the website, so
 * nothing made-up goes live before the real times exist.
 */
const programDaysField = defineField({
  name: 'programDays',
  title: 'Daily schedule',
  type: 'array',
  description:
    'The day-by-day programme shown on the Program page. Add one block per festival day and any number of entries per day — drag to reorder. Leave the list empty to hide the whole section on the website.',
  of: [
    {
      type: 'object',
      name: 'programDay',
      title: 'Festival day',
      fields: [
        defineField({
          name: 'date',
          title: 'Date',
          type: 'date',
          description:
            'The day heading is generated from this date in both languages, e.g. "Freitag, 18. September 2026" / "Friday, 18 September 2026".',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'label',
          title: 'Day label (optional)',
          type: 'object',
          options: { columns: 2 },
          description:
            'Replaces the automatic weekday heading, e.g. "Renntag 1" / "Race day 1". Leave blank to show the weekday.',
          fields: [
            defineField({ name: 'de', title: 'German', type: 'string' }),
            defineField({ name: 'en', title: 'English', type: 'string' }),
          ],
        }),
        defineField({
          name: 'entries',
          title: 'Programme entries',
          type: 'array',
          of: [
            {
              type: 'object',
              name: 'programEntry',
              title: 'Programme entry',
              fields: [
                defineField({
                  name: 'time',
                  title: 'Time',
                  type: 'string',
                  description: 'Free text, e.g. "08:00 – 12:00", "ab 19:00" or "ganztägig".',
                  validation: (Rule) => Rule.required(),
                }),
                defineField({
                  name: 'title',
                  title: 'Title',
                  type: 'object',
                  options: { columns: 2 },
                  fields: [
                    defineField({
                      name: 'de',
                      title: 'German',
                      type: 'string',
                      validation: (Rule) => Rule.required(),
                    }),
                    defineField({ name: 'en', title: 'English', type: 'string' }),
                  ],
                  validation: (Rule) => Rule.required(),
                }),
                defineField({
                  name: 'description',
                  title: 'Description (optional)',
                  type: 'object',
                  description: 'Short extra line under the title.',
                  fields: [
                    defineField({ name: 'de', title: 'German', type: 'text', rows: 2 }),
                    defineField({ name: 'en', title: 'English', type: 'text', rows: 2 }),
                  ],
                }),
              ],
              preview: {
                select: { time: 'time', de: 'title.de', en: 'title.en' },
                prepare({ time, de, en }) {
                  return { title: [time, de || en].filter(Boolean).join(' · ') || 'Programme entry' };
                },
              },
            },
          ],
        }),
      ],
      preview: {
        select: { date: 'date', de: 'label.de', en: 'label.en', entries: 'entries' },
        prepare({ date, de, en, entries }) {
          const heading =
            de ||
            en ||
            (typeof date === 'string' && date
              ? new Date(`${date}T12:00:00`).toLocaleDateString('de-AT', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })
              : 'Festival day');
          const count = Array.isArray(entries) ? entries.length : 0;
          return { title: heading, subtitle: `${count} ${count === 1 ? 'entry' : 'entries'}` };
        },
      },
    },
  ],
});

const designFields = [
  defineField({
    name: 'accentColor',
    title: 'Accent colour',
    type: 'color',
    options: { disableAlpha: true },
    description:
      'The highlight colour for buttons, badges, the ticker and accents across the whole site (currently amber). Pick a colour or type a hex code; the darker hover and text shades are derived automatically. Leave blank to keep the default.',
  }),
];

const seoFields = [
  seoField('homepage', 'Homepage'),
  seoField('oetzTrophy', 'OETZ TROPHY page'),
  seoField('boaterX', 'Kayak Cross page'),
  seoField('kajakfestival', 'Kayak Festival page'),
  seoField('program', 'Program page'),
  seoField('kontakt', 'Contact page'),
  seoField('registration', 'Registration page'),
  seoField('news', 'News page'),
  seoField('gallery', 'Gallery page'),
  seoField('results', 'Results page'),
  seoField('terms', 'Terms & Conditions page'),
  seoField('impressum', 'Legal Notice page'),
  seoField('datenschutz', 'Privacy Policy page'),
];

/**
 * Field order = order inside each page document. Images are placed where
 * they appear on the page (hero photo next to the hero text, page-header
 * photo at the top of its page, SEO last). Fields not listed here are
 * appended at the end so new sections never silently disappear.
 */
const FIELD_ORDER = [
  // Homepage — follows the page top to bottom. The hero's visual controls
  // (photo / video choice) come first so they're immediately visible at the
  // top, ahead of the long expanded hero text section.
  'imageHero',
  'heroMediaType',
  'heroVideo',
  'heroVideoAutoplay',
  'hero',
  'countdown',
  'marquee',
  'calendar',
  'festivalOverview',
  'imageFestivalOverview',
  'events',
  'imageProgrammeFestival',
  'imageProgrammeBoaterX',
  'imageProgrammeOetzTrophy',
  'news',
  'seoHomepage',
  // Race pages
  'imageOetzTrophy',
  'seoOetzTrophy',
  'imageBoaterX',
  'seoBoaterX',
  'imageKajakfestival',
  'kajakfestival',
  'seoKajakfestival',
  // Program page
  'imageProgram',
  'programm',
  'programDays',
  'seoProgram',
  // Registration
  'imageRegistration',
  'registration',
  'seoRegistration',
  // News / Gallery / Results
  'imageNews',
  'seoNews',
  'imageGallery',
  'gallery',
  'seoGallery',
  'imageResults',
  'results',
  'seoResults',
  // Contact
  'imageKontakt',
  'kontakt',
  'seoKontakt',
  // Legal pages
  'terms',
  'imageTerms',
  'seoTerms',
  'impressum',
  'imageImpressum',
  'seoImpressum',
  'datenschutz',
  'imageDatenschutz',
  'seoDatenschutz',
  // Site-wide chrome
  'menuItems',
  'nav',
  'imageLogo',
  'footer',
  'sponsors',
  // Design
  'accentColor',
];

export const PAGE_ICONS: Record<string, ComponentType> = {
  pageHome: HomeIcon,
  pageOetzTrophy: StarIcon,
  pageKayakCross: BoltIcon,
  pageKajakfestival: CalendarIcon,
  pageProgram: ClockIcon,
  pageRegistration: ClipboardIcon,
  pageNews: DocumentTextIcon,
  pageGallery: ImagesIcon,
  pageResults: ChartUpwardIcon,
  pageContact: EnvelopeIcon,
  pageLegal: BookIcon,
  siteNavigation: MenuIcon,
  siteDesign: ColorWheelIcon,
};

const PAGE_SUBTITLES: Record<string, string> = {
  pageHome: 'Hero, homepage sections, photos & SEO',
  pageOetzTrophy: 'Header photo & SEO (main text: Race & Festival Pages)',
  pageKayakCross: 'Header photo & SEO (main text: Race & Festival Pages)',
  pageKajakfestival: 'Schedule, location, header photo & SEO',
  pageProgram: 'Intro, daily schedule, header photo & SEO',
  pageRegistration: 'Form labels, confirmation text, header photo & SEO',
  pageNews: 'Header photo & SEO (articles: Blog Posts)',
  pageGallery: 'Coming-soon text, header photo & SEO',
  pageResults: 'Coming-soon text, header photo & SEO',
  pageContact: 'Contact details, header photo & SEO',
  pageLegal: 'Terms, legal notice & privacy policy',
  siteNavigation: 'Menu items, navigation labels, logo & footer',
  siteDesign: 'Accent colour',
};

const allFields = [
  ...textSections,
  ...pageImageFields,
  ...heroMediaFields,
  menuItemsField,
  programDaysField,
  ...designFields,
  ...seoFields,
];
const fieldByName = new Map(allFields.map((field) => [field.name, field]));
const orderIndex = (name: string) => {
  const index = FIELD_ORDER.indexOf(name);
  return index === -1 ? FIELD_ORDER.length : index;
};

// Fail fast (build & tests) if the partition and the generated fields drift:
// every partition key must have a field, every field must be owned by a page.
const ownedKeys = new Set(PAGE_DOCUMENTS.flatMap((def) => def.keys));
for (const key of ownedKeys) {
  if (!fieldByName.has(key)) {
    throw new Error(`pageDocuments.ts lists "${key}" but no schema field generates it`);
  }
}
for (const field of allFields) {
  if (!ownedKeys.has(field.name)) {
    throw new Error(`Schema field "${field.name}" is not assigned to any page document`);
  }
}

export const pageContentTypes = PAGE_DOCUMENTS.map((def) =>
  defineType({
    name: def.type,
    title: def.title,
    type: 'document',
    icon: PAGE_ICONS[def.type],
    fields: [...def.keys]
      .sort((a, b) => orderIndex(a) - orderIndex(b))
      .map((key) => fieldByName.get(key)!),
    preview: {
      prepare() {
        return { title: def.title, subtitle: PAGE_SUBTITLES[def.type] };
      },
    },
  }),
);
