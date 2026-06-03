#!/usr/bin/env node
/**
 * Seed the `siteContent` singleton in Sanity from the next-intl message files.
 *
 * This pre-fills the "Website Text & Images" document in Studio with the
 * current DE/EN copy so the client can edit in place instead of from blank
 * fields. Values are read verbatim from messages/{de,en}.json — no manual
 * transcription — so it is safe to re-run.
 *
 * Run once (order matters: seed BEFORE editing in Studio, or it overwrites):
 *   SANITY_TOKEN=xxx node scripts/migrate-site-content.mjs
 *
 * The token needs Editor/write access to project mnazp3qy. Create one at
 * https://www.sanity.io/manage/project/mnazp3qy/api
 */
import { createClient } from '@sanity/client';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const client = createClient({
  projectId: 'mnazp3qy',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_TOKEN,
  useCdn: false,
});

function load(locale) {
  return JSON.parse(
    readFileSync(resolve(__dirname, `../messages/${locale}.json`), 'utf8'),
  );
}

async function main() {
  if (!process.env.SANITY_TOKEN) {
    console.error('Set SANITY_TOKEN env var (needs write access to mnazp3qy).');
    process.exit(1);
  }

  const de = load('de');
  const en = load('en');

  // Reuse the existing siteContent document if there is one (its id may have
  // been auto-generated), otherwise fall back to a stable id.
  const existing = await client.fetch(
    '*[_type == "siteContent"][0]{ _id, images }',
  );
  const id = existing?._id?.replace(/^drafts\./, '') || 'siteContent';

  // Build { namespace: { key: { de, en } } } from the two message files.
  const doc = { _id: id, _type: 'siteContent' };
  for (const namespace of Object.keys(en)) {
    const section = {};
    for (const key of Object.keys(en[namespace])) {
      section[key] = {
        de: de[namespace]?.[key] ?? en[namespace][key],
        en: en[namespace][key],
      };
    }
    doc[namespace] = section;
  }

  // Preserve any images already uploaded in Studio.
  if (existing?.images) doc.images = existing.images;

  await client.createOrReplace(doc);
  console.log('Seeded siteContent with', Object.keys(en).length, 'sections.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
