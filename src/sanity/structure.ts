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
      // Singleton: all editable page text + images.
      // Resolve the existing document by type (its id may be auto-generated),
      // falling back to a fixed id when none exists yet.
      S.listItem()
        .title('Main Website Text & Images')
        .icon(EditIcon)
        .child(() =>
          context
            .getClient({ apiVersion })
            .fetch<string | null>('*[_type == "siteContent"][0]._id')
            .then((id) =>
              S.document()
                .schemaType('siteContent')
                .documentId((id || 'siteContent').replace(/^drafts\./, ''))
                .title('Main Website Text & Images'),
            ),
        ),

      // Singleton: site-wide settings (dates, registration)
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

      S.documentTypeListItem('post').title('Blog Posts').icon(DocumentTextIcon),
      S.documentTypeListItem('event').title('Race & Festival Page Text').icon(CalendarIcon),
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
