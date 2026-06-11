/**
 * Read-only check that the per-page documents reproduce the legacy
 * `siteContent` singleton exactly: merges the page documents the same way the
 * website does (mergeSiteContent) and deep-compares every owned key against
 * the singleton. Run AFTER scripts/migrate-to-page-docs.ts:
 *
 *   npx tsx scripts/verify-page-docs.ts
 *
 * Public dataset read — no token needed. Exits 1 on any mismatch.
 */
import { createClient } from '@sanity/client';
import { PAGE_DOCUMENTS, PAGE_DOCUMENT_TYPES } from '../src/lib/pageDocuments';
import { mergeSiteContent } from '../src/lib/mergeSiteContent';

const client = createClient({
  projectId: 'mnazp3qy',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
});

// Order-insensitive for object keys (GROQ may reorder attributes),
// order-sensitive for arrays (item order is content).
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, i) => deepEqual(item, b[i]));
  }
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const aKeys = Object.keys(a as object);
    const bKeys = Object.keys(b as object);
    return (
      aKeys.length === bKeys.length &&
      aKeys.every((key) =>
        deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]),
      )
    );
  }
  return false;
}

async function run() {
  const { legacy, pages } = await client.fetch<{
    legacy: Record<string, unknown> | null;
    pages: Record<string, unknown>[];
  }>('{ "legacy": *[_type == "siteContent"][0], "pages": *[_type in $types] }', {
    types: [...PAGE_DOCUMENT_TYPES],
  });

  if (!legacy) throw new Error('No siteContent document found.');
  console.log(`Page documents in dataset: ${pages.length}/${PAGE_DOCUMENTS.length}`);

  const merged = mergeSiteContent(legacy, pages);
  if (!merged) throw new Error('Merge produced nothing.');

  let checked = 0;
  let mismatches = 0;
  for (const def of PAGE_DOCUMENTS) {
    for (const key of def.keys) {
      checked += 1;
      if (!deepEqual(merged[key], legacy[key])) {
        mismatches += 1;
        console.error(`MISMATCH ${def.type}.${key}`);
        console.error(`  legacy: ${JSON.stringify(legacy[key])?.slice(0, 200)}`);
        console.error(`  merged: ${JSON.stringify(merged[key])?.slice(0, 200)}`);
      }
    }
  }

  if (mismatches > 0) {
    console.error(`${mismatches}/${checked} keys differ.`);
    process.exit(1);
  }
  console.log(`OK — all ${checked} keys identical between singleton and merged page docs.`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
