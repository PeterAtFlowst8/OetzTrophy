import type { StructureBuilder, StructureResolver } from 'sanity/structure';
import {
  CogIcon,
  DocumentTextIcon,
  StarIcon,
  BoltIcon,
  ImagesIcon,
  EditIcon,
} from '@sanity/icons';
import { PAGE_DOCUMENTS, PAGE_DOCUMENT_TYPES } from '../lib/pageDocuments';
import { PAGE_ICONS } from './schemaTypes/pageContent';

// Single-instance documents, kept out of the generic type lists below.
const SINGLETONS = ['siteSettings', ...PAGE_DOCUMENT_TYPES];
const LISTED = ['post', 'result', 'galleryItem', 'sponsor'];

// Each page document is a singleton whose _id equals its type, so the desk
// can open it directly — no create/delete, just edit and publish that page.
const singletonItem = (S: StructureBuilder, type: string, title: string) =>
  S.listItem()
    .title(title)
    .icon(PAGE_ICONS[type])
    .child(S.document().schemaType(type).documentId(type).title(title));

export const structure: StructureResolver = (S) =>
  S.list()
    .title('OETZ TROPHY')
    .items([
      // ─── PAGES (one document per page: text, photos & SEO) ────
      S.listItem()
        .title('Website Pages')
        .icon(EditIcon)
        .child(
          S.list()
            .title('Website Pages')
            .items(
              PAGE_DOCUMENTS.filter((def) => def.kind === 'page').map((def) =>
                singletonItem(S, def.type, def.title),
              ),
            ),
        ),

      S.divider(),

      // ─── SITE-WIDE ────────────────────────────────────────────
      ...PAGE_DOCUMENTS.filter((def) => def.kind === 'site').map((def) =>
        singletonItem(S, def.type, def.title),
      ),
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
