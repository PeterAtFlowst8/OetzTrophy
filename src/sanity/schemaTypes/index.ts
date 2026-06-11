import type { SchemaTypeDefinition } from 'sanity';

import { blockContent } from './blockContent';
import { post } from './post';
import { sponsor } from './sponsor';
import { result } from './result';
import { galleryItem } from './galleryItem';
import { siteSettings } from './siteSettings';
import { pageContentTypes } from './pageContent';

// The former `siteContent` singleton and `event` documents are intentionally
// NOT registered any more: their data stays in the dataset as a read-only
// fallback (siteContent also holds the legacy `images.*` uploads), but
// editing happens in the per-page documents.
export const schemaTypes: SchemaTypeDefinition[] = [
  // Documents
  post,
  sponsor,
  result,
  galleryItem,
  siteSettings,
  ...pageContentTypes,
  // Objects
  blockContent,
];
