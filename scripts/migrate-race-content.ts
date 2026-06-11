/**
 * One-time (re-runnable) copy of the three `event` documents' content into
 * their matching page documents, so each race/festival page is edited in ONE
 * place (Studio: Website Pages). Patches ONLY the listed fields — the page
 * documents' existing photo/SEO data is untouched, and the event documents
 * are never modified (they stay as read fallback + archive). Verifies each
 * copied field by reading it back and deep-comparing.
 *
 *   npx sanity exec scripts/migrate-race-content.ts --with-user-token
 */
import { getCliClient } from 'sanity/cli';

const MAPPINGS = [
  { from: 'event-oetz-trophy', to: 'pageOetzTrophy' },
  { from: 'event-boater-x', to: 'pageKayakCross' },
  { from: 'event-kajakfestival', to: 'pageKajakfestival' },
];

// Everything except `slug`: the routes are fixed in code, so the editable
// slug (which once 404ed a page) is deliberately retired.
const FIELDS = ['title', 'pageLabel', 'date', 'excerpt', 'body', 'entryType', 'format', 'rules'];

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

const client = getCliClient({ apiVersion: '2024-01-01' });

async function run() {
  const draftIds = await client.fetch<string[]>(
    '*[_id in $ids]._id',
    { ids: MAPPINGS.map((m) => `drafts.${m.to}`) },
  );
  if (draftIds.length > 0) {
    console.warn(`WARNING: unpublished drafts will shadow the copied values: ${draftIds.join(', ')}`);
  }

  let mismatches = 0;
  for (const { from, to } of MAPPINGS) {
    const event = await client.fetch<Record<string, unknown> | null>('*[_id == $id][0]', {
      id: from,
    });
    if (!event) throw new Error(`Event document ${from} not found.`);

    const set: Record<string, unknown> = {};
    for (const field of FIELDS) {
      if (event[field] !== undefined) set[field] = event[field];
    }
    await client.patch(to).set(set).commit();

    const back = await client.fetch<Record<string, unknown>>('*[_id == $id][0]', { id: to });
    const copied = Object.keys(set);
    for (const field of copied) {
      if (!deepEqual(back[field], event[field])) {
        mismatches += 1;
        console.error(`MISMATCH ${to}.${field}`);
      }
    }
    console.log(`  ${from} -> ${to}: copied ${copied.join(', ')} — verified`);
  }

  if (mismatches > 0) {
    console.error(`${mismatches} field(s) differ after copy.`);
    process.exit(1);
  }
  console.log('Done — all three pages carry their race content.');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
