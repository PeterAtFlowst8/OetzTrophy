import { defineCliConfig } from 'sanity/cli';

import { projectId, dataset } from './src/sanity/env';

// Enables `npx sanity ...` commands (e.g. cors add, schema deploy) from the project root.
export default defineCliConfig({
  api: { projectId, dataset },
  studioHost: 'oetz-trophy',
});
