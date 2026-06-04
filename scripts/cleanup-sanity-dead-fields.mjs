#!/usr/bin/env node
/**
 * Remove stale Sanity fields that are no longer shown in Studio or read by the
 * public site.
 *
 * Run:
 *   SANITY_TOKEN=xxx node scripts/cleanup-sanity-dead-fields.mjs
 * or:
 *   npx sanity exec scripts/cleanup-sanity-dead-fields.mjs --with-user-token
 */
import { createClient } from '@sanity/client';
import { readFileSync } from 'fs';

const projectId = 'mnazp3qy';
const dataset = 'production';
const apiVersion = '2024-01-01';

async function createSanityClient() {
  if (process.env.SANITY_TOKEN) {
    return createClient({
      projectId,
      dataset,
      apiVersion,
      token: process.env.SANITY_TOKEN,
      useCdn: false,
    });
  }

  const { getCliClient } = await import('sanity/cli');
  return getCliClient({ apiVersion });
}

function readEditableSiteContentKeys() {
  const source = readFileSync('src/lib/siteContentFields.ts', 'utf8');
  const match = source.match(/EDITABLE_SITE_CONTENT_KEYS[^=]*= (\{[\s\S]*?\n\});/);
  if (!match) throw new Error('Could not read editable site content keys.');
  return Function(`return ${match[1]}`)();
}

const client = await createSanityClient();
const editableSiteContentKeys = readEditableSiteContentKeys();

function withoutDraftPrefix(id) {
  return id.replace(/^drafts\./, '');
}

async function unsetByQuery(query, fields, label) {
  const ids = await client.fetch(query);
  if (!ids.length) {
    console.log(`No ${label} documents needed cleanup`);
    return;
  }

  const tx = client.transaction();
  for (const id of ids) {
    tx.patch(withoutDraftPrefix(id), (patch) => patch.unset(fields));
  }
  await tx.commit();
  console.log(`Removed ${fields.join(', ')} from ${ids.length} ${label} document(s)`);
}

async function cleanupSiteSettings() {
  await unsetByQuery(
    '*[_type == "siteSettings" && (defined(raceDate) || defined(registrationOpen) || defined(registrationDeadline) || defined(registrationFee) || defined(stripeProductId))]._id',
    ['raceDate', 'registrationOpen', 'registrationDeadline', 'registrationFee', 'stripeProductId'],
    'Festival Dates',
  );
}

async function cleanupSiteContent() {
  const doc = await client.fetch('*[_type == "siteContent"][0]');
  if (!doc?._id) {
    console.log('No Website Text & Images document found');
    return;
  }

  const fieldsToUnset = [];
  for (const namespace of Object.keys(doc)) {
    if (namespace.startsWith('_') || namespace === 'images') continue;

    const allowedKeys = editableSiteContentKeys[namespace];
    if (!allowedKeys) {
      fieldsToUnset.push(namespace);
      continue;
    }

    const allowed = new Set(allowedKeys);
    const section = doc[namespace];
    if (!section || typeof section !== 'object') continue;

    for (const key of Object.keys(section)) {
      if (!key.startsWith('_') && !allowed.has(key)) {
        fieldsToUnset.push(`${namespace}.${key}`);
      }
    }
  }

  if (!fieldsToUnset.length) {
    console.log('No stale Website Text & Images fields found');
    return;
  }

  await client.patch(withoutDraftPrefix(doc._id)).unset(fieldsToUnset).commit();
  console.log(`Removed ${fieldsToUnset.length} stale Website Text & Images field(s)`);
  for (const field of fieldsToUnset) console.log(`- ${field}`);
}

async function main() {
  await cleanupSiteSettings();
  await cleanupSiteContent();
  await unsetByQuery(
    '*[_type == "event" && (defined(image) || defined(seo))]._id',
    ['image', 'seo'],
    'Race / Festival Page',
  );
  await unsetByQuery(
    '*[_type == "post" && (defined(coverImage) || defined(seo))]._id',
    ['coverImage', 'seo'],
    'Blog Post',
  );
  console.log('Sanity dead-field cleanup complete');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
