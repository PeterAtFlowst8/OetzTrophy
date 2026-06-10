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

export default defineConfig({
  name: 'oetz-trophy',
  title: 'OETZ TROPHY',
  basePath: '/studio',
  projectId,
  dataset,
  schema: { types: schemaTypes },
  plugins: [
    structureTool({ structure }),
    visionTool({ defaultApiVersion: apiVersion }),
    colorInput(),
  ],
});
