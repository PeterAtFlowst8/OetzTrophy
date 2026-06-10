import { defineType, defineField } from 'sanity';
import { EditIcon } from '@sanity/icons';
import enMessages from '../../../messages/en.json';
import deMessages from '../../../messages/de.json';
import { EDITABLE_SITE_CONTENT_KEYS } from '../../lib/siteContentFields';
import { SEO_DEFAULTS, seoFieldName, type SeoPageKey } from '../../lib/seoDefaults';
import { makeFallbackPlaceholderInput } from '../components/FallbackPlaceholderInput';

/**
 * Editable UI text + images for the whole marketing site.
 *
 * The text fields are generated from `messages/en.json` so the Studio always
 * mirrors the app's translation keys. Each key becomes a `{ de, en }` pair.
 * The frontend merges non-empty values here over the static JSON files, so
 * blank fields safely fall back to the built-in copy. Each language box shows
 * its current built-in copy as a greyed placeholder (see localizedLeaf).
 */

const messages = enMessages as Record<string, Record<string, string>>;
const messagesDe = deMessages as Record<string, Record<string, string>>;

// One Studio tab per page, so editors find content by the page it appears on.
type ContentGroup =
  | 'homepage'
  | 'oetzTrophyPage'
  | 'boaterXPage'
  | 'festivalPage'
  | 'contactPage'
  | 'registrationPage'
  | 'newsPage'
  | 'galleryPage'
  | 'resultsPage'
  | 'legal'
  | 'global';

const FIELD_GROUPS: { name: ContentGroup; title: string }[] = [
  { name: 'homepage', title: 'Homepage' },
  { name: 'oetzTrophyPage', title: 'OETZ TROPHY Page' },
  { name: 'boaterXPage', title: 'Boater X Page' },
  { name: 'festivalPage', title: 'Kayak Festival Page' },
  { name: 'registrationPage', title: 'Registration Page' },
  { name: 'newsPage', title: 'News Page' },
  { name: 'galleryPage', title: 'Gallery Page' },
  { name: 'resultsPage', title: 'Results Page' },
  { name: 'contactPage', title: 'Contact Page' },
  { name: 'legal', title: 'Legal Pages' },
  { name: 'global', title: 'Navigation, Footer & Sponsors' },
];

const SECTION_GROUPS: Record<string, ContentGroup> = {
  // Homepage — one page, several sections
  hero: 'homepage',
  countdown: 'homepage',
  marquee: 'homepage',
  calendar: 'homepage',
  dasRennen: 'homepage',
  festivalOverview: 'homepage',
  events: 'homepage',
  news: 'homepage',
  // Individual pages
  kajakfestival: 'festivalPage',
  kontakt: 'contactPage',
  gallery: 'galleryPage',
  results: 'resultsPage',
  registration: 'registrationPage',
  // Legal pages (each has its own route)
  terms: 'legal',
  impressum: 'legal',
  datenschutz: 'legal',
  // Site-wide chrome
  nav: 'global',
  footer: 'global',
  sponsors: 'global',
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
  sponsors: 'Footer Sponsors',
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
  sponsors: 'Heading for the sponsor logos in the footer.',
  nav: 'Top navigation and mobile menu labels.',
  footer: 'Footer tagline and legal/contact links.',
  kajakfestival: 'Only the schedule table and location block on the Kayak Festival page. The page title, intro and main body text live in "Race & Festival Page Text" → Kayak Festival (a separate item in the left menu).',
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
    label: 'Footer sponsor heading',
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
    description: fieldDescription(enSample),
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
    group: SECTION_GROUPS[namespace] ?? 'homepage',
    description:
      SECTION_DESCRIPTIONS[namespace] ??
      'Editable website copy for this section. Blank fields use the built-in fallback copy.',
    options: { collapsible: true, collapsed: !OPEN_SECTIONS.has(namespace) },
    fields: editableEntries.map(([key, enSample, deSample]) =>
      localizedLeaf(namespace, key, enSample, deSample),
    ),
  });
});

function imageField(name: string, title: string, description: string, group?: ContentGroup) {
  return defineField({
    name,
    title,
    type: 'image',
    group,
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
 * Legacy image slots. Images now live as per-page fields in each page's tab
 * (see pageImageFields below); the frontend still reads these as a fallback so
 * previously uploaded photos keep working. Hidden so editors only see the new
 * per-page fields — do not delete: the client's uploads are stored here.
 */
const imagesSection = defineField({
  name: 'images',
  title: 'Main Site Images (legacy)',
  type: 'object',
  hidden: true,
  description:
    'Replace the main photos used across the site. Leave a field empty to keep the current built-in image.',
  options: { collapsible: true, collapsed: false },
  fields: [
    imageField(
      'logo',
      'Logo',
      'Your logo. Appears in the top navigation and the footer. It sits over the hero photo and the dark footer as well as the white menu bar, so use a version that stays legible on both light and dark backgrounds. Leave blank to keep the built-in logo.',
    ),
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
    imageField(
      'registration',
      'Registration page header photo',
      'Shown at the top of the registration page.',
    ),
    imageField(
      'news',
      'News page header photo',
      'Shown at the top of the News page. Leave blank for the plain dark header.',
    ),
    imageField(
      'gallery',
      'Gallery page header photo',
      'Shown at the top of the Gallery page. Leave blank for the plain dark header.',
    ),
    imageField(
      'results',
      'Results page header photo',
      'Shown at the top of the Results page. Leave blank for the plain dark header.',
    ),
    imageField(
      'terms',
      'Terms & Conditions page header photo',
      'Shown at the top of the Terms & Conditions page. Leave blank for the plain dark header.',
    ),
    imageField(
      'datenschutz',
      'Privacy Policy page header photo',
      'Shown at the top of the Privacy Policy page. Leave blank for the plain dark header.',
    ),
    imageField(
      'impressum',
      'Legal Notice page header photo',
      'Shown at the top of the Legal Notice page. Leave blank for the plain dark header.',
    ),
    imageField(
      'programmeFestival',
      'Homepage programme card: Festival',
      'Portrait photo on the "Kayak Festival" card in the homepage programme grid.',
    ),
    imageField(
      'programmeBoaterX',
      'Homepage programme card: Boater X',
      'Portrait photo on the "Boater X" card in the homepage programme grid.',
    ),
    imageField(
      'programmeOetzTrophy',
      'Homepage programme card: OETZ TROPHY',
      'Portrait photo on the "OETZ TROPHY" card in the homepage programme grid.',
    ),
  ],
});

/**
 * Per-page image slots, each placed in its page's tab next to the text it
 * appears with. Data is stored at the top level (e.g. `imageKontakt`); the
 * frontend falls back to the matching legacy `images.*` slot, so photos the
 * client uploaded before this reorganisation keep working untouched.
 */
const pageImageFields = [
  imageField(
    'imageHero',
    'Hero photo',
    'Shown full-screen at the top of the homepage. Best as a wide action image. Leave empty to keep the current photo.',
    'homepage',
  ),
  imageField(
    'imageFestivalOverview',
    'Festival overview photo',
    'Shown beside the four-day festival overview section on the homepage. Leave empty to keep the current photo.',
    'homepage',
  ),
  imageField(
    'imageProgrammeFestival',
    'Programme card photo: Kayak Festival',
    'Portrait photo on the "Kayak Festival" card in the homepage programme grid. Leave empty to keep the current photo.',
    'homepage',
  ),
  imageField(
    'imageProgrammeBoaterX',
    'Programme card photo: Boater X',
    'Portrait photo on the "Boater X" card in the homepage programme grid. Leave empty to keep the current photo.',
    'homepage',
  ),
  imageField(
    'imageProgrammeOetzTrophy',
    'Programme card photo: OETZ TROPHY',
    'Portrait photo on the "OETZ TROPHY" card in the homepage programme grid. Leave empty to keep the current photo.',
    'homepage',
  ),
  imageField(
    'imageOetzTrophy',
    'OETZ TROPHY page header photo',
    'Shown at the top of the OETZ TROPHY race page. Leave empty to keep the current photo.',
    'oetzTrophyPage',
  ),
  imageField(
    'imageBoaterX',
    'Boater X page header photo',
    'Shown at the top of the Boater X race page. Leave empty to keep the current photo.',
    'boaterXPage',
  ),
  imageField(
    'imageKajakfestival',
    'Kayak Festival page header photo',
    'Shown at the top of the Kayak Festival page. Leave empty to keep the current photo.',
    'festivalPage',
  ),
  imageField(
    'imageKontakt',
    'Contact page header photo',
    'Shown at the top of the Contact page. Leave empty to keep the current photo.',
    'contactPage',
  ),
  imageField(
    'imageRegistration',
    'Registration page header photo',
    'Shown at the top of the registration page. Leave empty to keep the current photo.',
    'registrationPage',
  ),
  imageField(
    'imageNews',
    'News page header photo',
    'Shown at the top of the News page. Leave blank for the plain dark header.',
    'newsPage',
  ),
  imageField(
    'imageGallery',
    'Gallery page header photo',
    'Shown at the top of the Gallery page. Leave blank for the plain dark header.',
    'galleryPage',
  ),
  imageField(
    'imageResults',
    'Results page header photo',
    'Shown at the top of the Results page. Leave blank for the plain dark header.',
    'resultsPage',
  ),
  imageField(
    'imageTerms',
    'Terms & Conditions page header photo',
    'Shown at the top of the Terms & Conditions page. Leave blank for the plain dark header.',
    'legal',
  ),
  imageField(
    'imageImpressum',
    'Legal Notice page header photo',
    'Shown at the top of the Legal Notice page. Leave blank for the plain dark header.',
    'legal',
  ),
  imageField(
    'imageDatenschutz',
    'Privacy Policy page header photo',
    'Shown at the top of the Privacy Policy page. Leave blank for the plain dark header.',
    'legal',
  ),
  imageField(
    'imageLogo',
    'Logo',
    'Your logo. Appears in the top navigation and the footer. It sits over the hero photo and the dark footer as well as the white menu bar, so use a version that stays legible on both light and dark backgrounds. Leave blank to keep the built-in logo.',
    'global',
  ),
];

/**
 * Per-page "how this page appears in Google" fields. One per page, placed in
 * that page's tab. Blank fields fall back to the built-in copy (shown as the
 * greyed placeholder), exactly like the text fields above.
 */
function seoField(key: SeoPageKey, group: ContentGroup, pageTitle: string) {
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
    group,
    options: { collapsible: true, collapsed: true },
    description:
      'The title and short description shown for this page on Google and when the link is shared. Leave blank to use the built-in text.',
    fields: [
      langPair('title', 'Search result title', 'Shown as the blue headline on Google. Aim for under 60 characters.'),
      langPair('description', 'Search result description', 'The grey snippet text under the headline. Aim for under 160 characters.'),
    ],
  });
}

const seoFields = [
  seoField('homepage', 'homepage', 'Homepage'),
  seoField('oetzTrophy', 'oetzTrophyPage', 'OETZ TROPHY page'),
  seoField('boaterX', 'boaterXPage', 'Boater X page'),
  seoField('kajakfestival', 'festivalPage', 'Kayak Festival page'),
  seoField('kontakt', 'contactPage', 'Contact page'),
  seoField('registration', 'registrationPage', 'Registration page'),
  seoField('news', 'newsPage', 'News page'),
  seoField('gallery', 'galleryPage', 'Gallery page'),
  seoField('results', 'resultsPage', 'Results page'),
  seoField('terms', 'legal', 'Terms & Conditions page'),
  seoField('impressum', 'legal', 'Legal Notice page'),
  seoField('datenschutz', 'legal', 'Privacy Policy page'),
];

/**
 * Field order = order inside each tab. Images are placed where they appear on
 * the page (hero photo next to the hero text, page-header photo at the top of
 * its page tab, SEO last). Fields not listed here are appended at the end so
 * new sections never silently disappear.
 */
const FIELD_ORDER = [
  // Homepage — follows the page top to bottom
  'hero',
  'imageHero',
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
  'nav',
  'imageLogo',
  'footer',
  'sponsors',
];

const allFields = [...textSections, ...pageImageFields, ...seoFields];
const fieldByName = new Map(allFields.map((field) => [field.name, field]));
const orderedFields = [
  ...FIELD_ORDER.flatMap((name) => fieldByName.get(name) ?? []),
  ...allFields.filter((field) => !FIELD_ORDER.includes(field.name)),
];

export const siteContent = defineType({
  name: 'siteContent',
  title: 'Website Text & Images',
  type: 'document',
  icon: EditIcon,
  description:
    'Simple editable website copy and main image slots. Open a section, change German or English text, then publish.',
  groups: FIELD_GROUPS,
  fields: [...orderedFields, imagesSection],
  preview: {
    prepare() {
      return {
        title: 'Website Text & Images',
        subtitle: 'Homepage, registration, legal copy, schedules and main photos',
      };
    },
  },
});
