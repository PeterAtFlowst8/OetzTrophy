/**
 * One-time (re-runnable) copy of the `siteContent` singleton into the new
 * per-page documents. Each page document gets exactly the top-level fields it
 * owns (see src/lib/pageDocuments.ts), under unchanged field names, with a
 * fixed _id equal to its type. `createOrReplace` makes the script idempotent:
 * re-running refreshes the page documents from the current singleton state.
 *
 * The singleton itself is NEVER modified — it stays in the dataset as the
 * read-layer fallback and keeps the legacy `images.*` uploads.
 *
 * Run from the project root:
 *   npx sanity exec scripts/migrate-to-page-docs.ts --with-user-token
 */
import { getCliClient } from 'sanity/cli';
import { PAGE_DOCUMENTS } from '../src/lib/pageDocuments';

const client = getCliClient({ apiVersion: '2024-01-01' });

async function run() {
  const legacy = await client.fetch<Record<string, unknown> | null>(
    '*[_type == "siteContent"][0]',
  );
  if (!legacy) throw new Error('No siteContent document found — nothing to migrate.');
  console.log(
    `Source: siteContent ${legacy._id} (last published change ${legacy._updatedAt})`,
  );

  const draftIds = await client.fetch<string[]>(
    '*[_type in $types && _id in path("drafts.**")]._id',
    { types: PAGE_DOCUMENTS.map((def) => def.type) },
  );
  if (draftIds.length > 0) {
    console.warn(
      `WARNING: unpublished drafts exist and will keep shadowing the copied values: ${draftIds.join(', ')}`,
    );
  }

  const tx = client.transaction();
  for (const def of PAGE_DOCUMENTS) {
    const doc: Record<string, unknown> = { _id: def.type, _type: def.type };
    let copied = 0;
    for (const key of def.keys) {
      if (legacy[key] !== undefined) {
        doc[key] = legacy[key];
        copied += 1;
      }
    }
    tx.createOrReplace(doc as { _id: string; _type: string });
    console.log(`  ${def.type}: ${copied}/${def.keys.length} fields have values`);
  }

  await tx.commit();
  console.log(`Done — ${PAGE_DOCUMENTS.length} page documents written.`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
