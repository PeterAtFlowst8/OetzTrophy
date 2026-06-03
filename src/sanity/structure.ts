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

// Singletons are enforced via the structure (fixed document id), not the schema.
const SINGLETONS = ['siteSettings', 'siteContent'];
const LISTED = ['post', 'event', 'result', 'galleryItem', 'sponsor'];

export const structure: StructureResolver = (S) =>
  S.list()
    .title('OETZ TROPHY')
    .items([
      // Singleton: all editable page text + images
      S.listItem()
        .title('Website Text & Images')
        .icon(EditIcon)
        .child(
          S.document()
            .schemaType('siteContent')
            .documentId('siteContent')
            .title('Website Text & Images'),
        ),

      // Singleton: site-wide settings (dates, registration)
      S.listItem()
        .title('Site Settings')
        .icon(CogIcon)
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId('siteSettings')
            .title('Site Settings'),
        ),

      S.divider(),

      S.documentTypeListItem('post').title('Blog Posts').icon(DocumentTextIcon),
      S.documentTypeListItem('event').title('Events').icon(CalendarIcon),
      S.documentTypeListItem('result').title('Race Results').icon(BoltIcon),
      S.documentTypeListItem('galleryItem').title('Gallery').icon(ImagesIcon),
      S.documentTypeListItem('sponsor').title('Sponsors').icon(StarIcon),

      S.divider(),

      // Any other document types not explicitly listed above
      ...S.documentTypeListItems().filter((item) => {
        const id = item.getId();
        return id ? ![...SINGLETONS, ...LISTED].includes(id) : false;
      }),
    ]);
