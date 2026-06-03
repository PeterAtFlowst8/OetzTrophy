import type { SchemaTypeDefinition } from 'sanity';

import { blockContent } from './blockContent';
import { post } from './post';
import { event } from './event';
import { sponsor } from './sponsor';
import { result } from './result';
import { galleryItem } from './galleryItem';
import { siteSettings } from './siteSettings';

export const schemaTypes: SchemaTypeDefinition[] = [
  // Documents
  post,
  event,
  sponsor,
  result,
  galleryItem,
  siteSettings,
  // Objects
  blockContent,
];
