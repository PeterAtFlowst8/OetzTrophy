/**
 * Partition of the former `siteContent` singleton into one document per page.
 *
 * Every top-level field of the old singleton is owned by exactly one page
 * document, under the SAME field name. That invariant is what the rest of the
 * system relies on:
 *  - the Studio schema generates each page document from its `keys`
 *  - `mergeSiteContent()` overlays page documents onto the legacy singleton
 *    to produce one virtual document for the read layer
 *  - `scripts/migrate-to-page-docs.ts` copies values key-by-key
 *
 * Pure data — no Sanity imports — so node scripts and vitest can use it.
 */

export type PageDocumentDef = {
  /** Sanity document type AND fixed document _id (singletons). */
  type: string;
  /** Client-facing title in the Studio. */
  title: string;
  /** 'page' docs live in the Website Pages folder; 'site' docs sit alone. */
  kind: 'page' | 'site';
  /** Top-level siteContent field names this document owns. */
  keys: readonly string[];
};

export const PAGE_DOCUMENTS: readonly PageDocumentDef[] = [
  {
    type: 'pageHome',
    title: 'Homepage',
    kind: 'page',
    keys: [
      'imageHero',
      'heroMediaType',
      'heroVideo',
      'heroVideoAutoplay',
      'hero',
      'countdown',
      'marquee',
      'calendar',
      'dasRennen',
      'festivalOverview',
      'imageFestivalOverview',
      'events',
      'imageProgrammeFestival',
      'imageProgrammeBoaterX',
      'imageProgrammeOetzTrophy',
      'news',
      'seoHomepage',
    ],
  },
  {
    type: 'pageOetzTrophy',
    title: 'OETZ TROPHY Page',
    kind: 'page',
    keys: ['imageOetzTrophy', 'seoOetzTrophy'],
  },
  {
    type: 'pageKayakCross',
    title: 'Kayak Cross Page',
    kind: 'page',
    keys: ['imageBoaterX', 'seoBoaterX'],
  },
  {
    type: 'pageKajakfestival',
    title: 'Kayak Festival Page',
    kind: 'page',
    keys: ['imageKajakfestival', 'kajakfestival', 'seoKajakfestival'],
  },
  {
    type: 'pageProgram',
    title: 'Program Page',
    kind: 'page',
    keys: ['imageProgram', 'programm', 'programDays', 'seoProgram'],
  },
  {
    type: 'pageRegistration',
    title: 'Registration Page',
    kind: 'page',
    keys: ['imageRegistration', 'registration', 'seoRegistration'],
  },
  {
    type: 'pageNews',
    title: 'News Page',
    kind: 'page',
    keys: ['imageNews', 'seoNews'],
  },
  {
    type: 'pageGallery',
    title: 'Gallery Page',
    kind: 'page',
    keys: ['imageGallery', 'gallery', 'seoGallery'],
  },
  {
    type: 'pageResults',
    title: 'Results Page',
    kind: 'page',
    keys: ['imageResults', 'results', 'seoResults'],
  },
  {
    type: 'pageContact',
    title: 'Contact Page',
    kind: 'page',
    keys: ['imageKontakt', 'kontakt', 'seoKontakt'],
  },
  {
    type: 'pageLegal',
    title: 'Legal Pages',
    kind: 'page',
    keys: [
      'terms',
      'imageTerms',
      'seoTerms',
      'impressum',
      'imageImpressum',
      'seoImpressum',
      'datenschutz',
      'imageDatenschutz',
      'seoDatenschutz',
    ],
  },
  {
    type: 'siteNavigation',
    title: 'Navigation & Footer',
    kind: 'site',
    keys: ['menuItems', 'nav', 'imageLogo', 'footer', 'sponsors'],
  },
  {
    type: 'siteDesign',
    title: 'Design',
    kind: 'site',
    keys: ['accentColor'],
  },
];

export const PAGE_DOCUMENT_TYPES = PAGE_DOCUMENTS.map((def) => def.type);

export const KEYS_BY_TYPE: Record<string, readonly string[]> = Object.fromEntries(
  PAGE_DOCUMENTS.map((def) => [def.type, def.keys]),
);
