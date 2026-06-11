/**
 * One-off: the homepage ticker override still reads "Boater X · 18. Sept" /
 * "Boater X · 18 Sept" (pageHome.marquee.item1). The name Boater X may no
 * longer be used, so patch the stored override to Kayak Cross. Only touches
 * that one field; safe to re-run.
 *
 *   npx sanity exec scripts/patch-marquee-kayak-cross.ts --with-user-token
 */
import { getCliClient } from 'sanity/cli';

const client = getCliClient({ apiVersion: '2024-01-01' });

async function run() {
  const current = await client.fetch<{ de?: string; en?: string } | null>(
    '*[_id == "pageHome"][0].marquee.item1',
  );
  console.log('before:', JSON.stringify(current));
  if (!current) throw new Error('pageHome.marquee.item1 not found.');

  const patched = {
    de: (current.de ?? '').replace(/Boater X/g, 'Kayak Cross'),
    en: (current.en ?? '').replace(/Boater X/g, 'Kayak Cross'),
  };
  await client.patch('pageHome').set({ 'marquee.item1': patched }).commit();
  console.log('after: ', JSON.stringify(patched));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
