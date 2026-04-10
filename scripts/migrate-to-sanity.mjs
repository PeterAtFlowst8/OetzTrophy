#!/usr/bin/env node
/**
 * Migrate WP export data to Sanity CMS
 * Run: node scripts/migrate-to-sanity.mjs
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

function load(file) {
  return JSON.parse(readFileSync(resolve(__dirname, '../../export/data', file), 'utf8'));
}

function stripHtml(html) {
  return (html || '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#8222;/g, '"')
    .replace(/&#8220;/g, '"')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[äÄ]/g, 'ae')
    .replace(/[öÖ]/g, 'oe')
    .replace(/[üÜ]/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// ── Migrate Blog Posts ─────────────────────────────────────────────────────

async function migratePosts() {
  const posts = load('posts.json');

  // Separate DE (cat 10) and EN (cat 22) posts
  const dePosts = posts.filter(p => p.categories?.includes(10));
  const enPosts = posts.filter(p => p.categories?.includes(22));

  // Match DE/EN pairs by date (they're published on the same date)
  const paired = [];
  const usedEn = new Set();

  for (const de of dePosts) {
    const deDate = de.date?.slice(0, 10);
    const match = enPosts.find(en => {
      if (usedEn.has(en.id)) return false;
      return en.date?.slice(0, 10) === deDate;
    });

    if (match) usedEn.add(match.id);

    paired.push({
      de,
      en: match || null,
    });
  }

  console.log(`Found ${paired.length} post pairs (${dePosts.length} DE, ${enPosts.length} EN)`);

  const tx = client.transaction();

  for (const { de, en } of paired) {
    const deTitle = stripHtml(de.title?.rendered || de.title);
    const enTitle = en ? stripHtml(en.title?.rendered || en.title) : '';
    const deExcerpt = stripHtml(de.excerpt?.rendered || de.excerpt);
    const enExcerpt = en ? stripHtml(en.excerpt?.rendered || en.excerpt) : '';

    const doc = {
      _type: 'post',
      _id: `post-${de.id}`,
      title: { de: deTitle, en: enTitle || deTitle },
      slug: {
        de: { _type: 'slug', current: slugify(deTitle) },
        en: { _type: 'slug', current: en ? slugify(enTitle) : slugify(deTitle) },
      },
      excerpt: { de: deExcerpt, en: enExcerpt || deExcerpt },
      publishedAt: de.date,
      categories: ['news'],
    };

    tx.createOrReplace(doc);
  }

  const result = await tx.commit();
  console.log(`Migrated ${result.results.length} posts to Sanity`);
}

// ── Migrate Sponsors ───────────────────────────────────────────────────────

async function migrateSponsors() {
  const sponsors = [
    { name: 'VAUDE', url: 'https://www.vaude.com/', tier: 'gold', order: 1 },
    { name: 'Ötztal Tourismus', url: 'https://www.oetztal.com/', tier: 'gold', order: 2 },
    { name: 'Source To Sea', url: 'https://s2s.at', tier: 'gold', order: 3 },
    { name: 'Kayak Session', url: 'https://www.kayaksession.com/', tier: 'silver', order: 4 },
    { name: 'NRS', url: 'https://www.nrs.com/', tier: 'silver', order: 5 },
  ];

  const tx = client.transaction();

  for (const s of sponsors) {
    tx.createOrReplace({
      _type: 'sponsor',
      _id: `sponsor-${slugify(s.name)}`,
      name: s.name,
      url: s.url,
      tier: s.tier,
      order: s.order,
    });
  }

  const result = await tx.commit();
  console.log(`Migrated ${result.results.length} sponsors to Sanity`);
}

// ── Migrate Site Settings ──────────────────────────────────────────────────

async function migrateSiteSettings() {
  await client.createOrReplace({
    _type: 'siteSettings',
    _id: 'siteSettings',
    festivalDate: '2026-09-17T09:00:00Z',
    raceDate: '2026-09-19T09:00:00Z',
    festivalEndDate: '2026-09-20T18:00:00Z',
    registrationOpen: false,
    registrationFee: 50,
  });

  console.log('Migrated site settings to Sanity');
}

// ── Run ────────────────────────────────────────────────────────────────────

async function main() {
  if (!process.env.SANITY_TOKEN) {
    console.error('Set SANITY_TOKEN env var. Get one from: https://www.sanity.io/manage/project/mnazp3qy/api#tokens');
    process.exit(1);
  }

  console.log('Starting migration...\n');
  await migrateSiteSettings();
  await migrateSponsors();
  await migratePosts();
  console.log('\nMigration complete!');
}

main().catch(console.error);
