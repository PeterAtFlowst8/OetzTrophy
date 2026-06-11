'use client';

// Configuration for the embedded Sanity Studio mounted at /studio.
// `'use client'` is required — the Studio is a client-side React app.
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { colorInput } from '@sanity/color-input';

import { projectId, dataset, apiVersion } from './src/sanity/env';
import { schemaTypes } from './src/sanity/schemaTypes';
import { structure } from './src/sanity/structure';
import { PAGE_DOCUMENT_TYPES } from './src/lib/pageDocuments';

// Per-page documents and the settings document exist exactly once with a
// fixed _id, so editors must not create, duplicate or delete them.
const SINGLETON_TYPES = new Set(['siteSettings', ...PAGE_DOCUMENT_TYPES]);

export default defineConfig({
  name: 'oetz-trophy',
  title: 'OETZ TROPHY',
  basePath: '/studio',
  projectId,
  dataset,
  schema: { types: schemaTypes },
  document: {
    newDocumentOptions: (prev, { creationContext }) =>
      creationContext.type === 'global'
        ? prev.filter((template) => !SINGLETON_TYPES.has(template.templateId))
        : prev,
    actions: (prev, { schemaType }) =>
      SINGLETON_TYPES.has(schemaType)
        ? prev.filter(
            ({ action }) =>
              action !== 'delete' && action !== 'duplicate' && action !== 'unpublish',
          )
        : prev,
  },
  plugins: [
    structureTool({ structure }),
    visionTool({ defaultApiVersion: apiVersion }),
    colorInput(),
  ],
});
