import { defineType, defineField } from 'sanity';
import { EditIcon } from '@sanity/icons';
import enMessages from '../../../messages/en.json';
import { EDITABLE_SITE_CONTENT_KEYS } from '../../lib/siteContentFields';

/**
 * Editable UI text + images for the whole marketing site.
 *
 * The text fields are generated from `messages/en.json` so the Studio always
 * mirrors the app's translation keys. Each key becomes a `{ de, en }` pair.
 * The frontend merges non-empty values here over the static JSON files, so
 * blank fields safely fall back to the built-in copy.
 */

const messages = enMessages as Record<string, Record<string, string>>;

type ContentGroup =
  | 'photos'
  | 'homepage'
  | 'racePages'
  | 'registration'
  | 'navigation'
  | 'legal';

const FIELD_GROUPS: { name: ContentGroup; title: string }[] = [
  { name: 'homepage', title: 'Homepage' },
  { name: 'photos', title: 'Images' },
  { name: 'registration', title: 'Registration' },
  { name: 'racePages', title: 'Other Pages' },
  { name: 'navigation', title: 'Navigation & Footer' },
  { name: 'legal', title: 'Legal Pages' },
];

const SECTION_GROUPS: Record<string, ContentGroup> = {
  images: 'photos',
  hero: 'homepage',
  countdown: 'homepage',
  marquee: 'homepage',
  calendar: 'homepage',
  dasRennen: 'homepage',
  festivalOverview: 'homepage',
  events: 'homepage',
  news: 'homepage',
  sponsors: 'homepage',
  kajakfestival: 'racePages',
  kontakt: 'racePages',
  gallery: 'racePages',
  results: 'racePages',
  registration: 'registration',
  terms: 'registration',
  nav: 'navigation',
  footer: 'navigation',
  impressum: 'legal',
  datenschutz: 'legal',
};

const SECTION_TITLES: Record<string, string> = {
  hero: 'Homepage Hero',
  countdown: 'Countdown',
  marquee: 'Ticker Banner',
  calendar: 'Calendar Buttons',
  dasRennen: 'Homepage Race Teaser',
  festivalOverview: 'Homepage Festival Overview',
  events: 'Homepage Programme Cards',
  news: 'Homepage News Preview',
  sponsors: 'Homepage Sponsors Strip',
  footer: 'Footer',
  nav: 'Navigation',
  impressum: 'Legal Notice Page',
  datenschutz: 'Privacy Policy Page',
  terms: 'Terms & Conditions Page',
  kajakfestival: 'Kayak Festival Schedule & Location',
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
  sponsors: 'Heading for the sponsors area on the homepage.',
  nav: 'Top navigation and mobile menu labels.',
  footer: 'Footer tagline and legal/contact links.',
  kajakfestival: 'Schedule and location labels on the Kayak Festival page. The main title and intro are edited in Race & Festival Pages.',
  kontakt: 'Labels on the contact page.',
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
    item1Title: 'Boater X card title',
    item1Subtitle: 'Boater X card subtitle',
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
    label: 'Section label',
  },
  nav: {
    switchTo: 'Language switch label',
    race: 'OETZ TROPHY link',
    boaterX: 'Boater X link',
    festival: 'Festival link',
    news: 'News link',
    registration: 'Registration link',
    contact: 'Contact link',
    menuLabel: 'Mobile menu label',
  },
  footer: {
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

function fieldDescription(sample: string) {
  const notes = [
    'Leave blank to use the built-in fallback copy for that language.',
    `Fallback English: "${truncate(sample)}"`,
  ];

  if (sample.includes('{')) {
    notes.unshift('Keep any placeholder in curly brackets, for example {opens}.');
  }

  return notes.join(' ');
}

/** One translatable key -> a visible `{ de, en }` pair. */
function localizedLeaf(namespace: string, key: string, sample: string) {
  const multiline = sample.length > 60 || sample.includes('\n');
  const langField = (name: 'de' | 'en', title: string) =>
    multiline
      ? defineField({ name, title, type: 'text', rows: 3 })
      : defineField({ name, title, type: 'string' });

  return defineField({
    name: key,
    title: fieldTitle(namespace, key),
    type: 'object',
    options: { columns: 2 },
    description: fieldDescription(sample),
    fields: [langField('de', 'German'), langField('en', 'English')],
  });
}

const textSections = Object.entries(messages).flatMap(([namespace, entries]) => {
  const editableKeys = EDITABLE_SITE_CONTENT_KEYS[namespace];
  if (!editableKeys) return [];

  const editableEntries = editableKeys.flatMap((key) =>
    entries[key] ? ([[key, entries[key]]] as const) : [],
  );
  if (editableEntries.length === 0) return [];

  return defineField({
    name: namespace,
    title: SECTION_TITLES[namespace] ?? fallbackTitle(namespace),
    type: 'object',
    group: SECTION_GROUPS[namespace] ?? 'homepage',
    description:
      SECTION_DESCRIPTIONS[namespace] ??
      'Editable website copy for this section. Blank fields use the built-in fallback copy.',
    options: { collapsible: true, collapsed: !OPEN_SECTIONS.has(namespace) },
    fields: editableEntries.map(([key, sample]) =>
      localizedLeaf(namespace, key, sample),
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
        title: 'Internal image note',
        type: 'string',
        description:
          'Optional note for editors. Public alt text is controlled in the matching text section where the site uses it.',
      }),
    ],
  });
}

const imagesSection = defineField({
  name: 'images',
  title: 'Main Site Images',
  type: 'object',
  group: 'photos',
  description:
    'Replace the main photos used across the site. Leave a field empty to keep the current built-in image.',
  options: { collapsible: true, collapsed: false },
  fields: [
    imageField(
      'hero',
      'Homepage hero photo',
      'Shown full-screen at the top of the homepage. Best as a wide action image.',
    ),
    imageField(
      'festivalOverview',
      'Homepage festival overview photo',
      'Shown beside the four-day festival overview section on the homepage.',
    ),
    imageField(
      'oetzTrophy',
      'OETZ TROPHY page header photo',
      'Shown at the top of the OETZ TROPHY race page.',
    ),
    imageField(
      'boaterX',
      'Boater X page header photo',
      'Shown at the top of the Boater X race page.',
    ),
    imageField(
      'kajakfestival',
      'Kayak Festival page header photo',
      'Shown at the top of the Kayak Festival page.',
    ),
    imageField(
      'kontakt',
      'Contact page header photo',
      'Shown at the top of the Contact page.',
    ),
  ],
});

export const siteContent = defineType({
  name: 'siteContent',
  title: 'Website Text & Images',
  type: 'document',
  icon: EditIcon,
  description:
    'Simple editable website copy and main image slots. Open a section, change German or English text, then publish.',
  groups: FIELD_GROUPS,
  fields: [imagesSection, ...textSections],
  preview: {
    prepare() {
      return {
        title: 'Website Text & Images',
        subtitle: 'Homepage, registration, legal copy, schedules and main photos',
      };
    },
  },
});
