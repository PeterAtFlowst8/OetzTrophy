import type { StructureResolver } from 'sanity/structure';
import {
  CogIcon,
  DocumentTextIcon,
  CalendarIcon,
  StarIcon,
  BoltIcon,
  ImagesIcon,
  EditIcon,
} from '@sanity/icons';
import { apiVersion } from './env';

// Single-instance documents, kept out of the generic type lists below.
const SINGLETONS = ['siteSettings', 'siteContent'];
const LISTED = ['post', 'event', 'result', 'galleryItem', 'sponsor'];

export const structure: StructureResolver = (S, context) =>
  S.list()
    .title('OETZ TROPHY')
    .items([
      // ─── PAGES ───────────────────────────────────────────────
      // All page text + images, organised page-by-page inside tabs
      // (Homepage, Contact Page, Legal Pages, Page Images, …).
      // Resolve the existing document by type (its id may be auto-generated),
      // falling back to a fixed id when none exists yet.
      S.listItem()
        .title('Website Pages — Text & Images')
        .icon(EditIcon)
        .child(() =>
          context
            .getClient({ apiVersion })
            .fetch<string | null>('*[_type == "siteContent"][0]._id')
            .then((id) =>
              S.document()
                .schemaType('siteContent')
                .documentId((id || 'siteContent').replace(/^drafts\./, ''))
                .title('Website Pages — Text & Images'),
            ),
        ),

      // Main body text for the race/festival pages (one document each:
      // OETZ TROPHY, Boater X, Kayak Festival).
      S.documentTypeListItem('event')
        .title('Race & Festival Pages (main text)')
        .icon(CalendarIcon),

      S.divider(),

      // ─── SETTINGS ────────────────────────────────────────────
      S.listItem()
        .title('Festival Dates & Registration')
        .icon(CogIcon)
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId('siteSettings')
            .title('Festival Dates & Registration'),
        ),

      S.divider(),

      // ─── COLLECTIONS (lists you add items to) ─────────────────
      S.documentTypeListItem('post').title('Blog Posts').icon(DocumentTextIcon),
      S.documentTypeListItem('result').title('Race Results').icon(BoltIcon),
      S.documentTypeListItem('galleryItem').title('Gallery Photos').icon(ImagesIcon),
      S.documentTypeListItem('sponsor').title('Sponsors').icon(StarIcon),

      S.divider(),

      // Any other document types not explicitly listed above
      ...S.documentTypeListItems().filter((item) => {
        const id = item.getId();
        return id ? ![...SINGLETONS, ...LISTED].includes(id) : false;
      }),
    ]);
