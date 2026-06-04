#!/usr/bin/env node
/**
 * Clean up Sanity content after moving from separate race registrations to one
 * shared race-weekend registration.
 *
 * Run:
 *   SANITY_TOKEN=xxx node scripts/cleanup-single-registration.mjs
 */
import { createClient } from '@sanity/client';

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

const client = await createSanityClient();

function textBlock(text) {
  return {
    _type: 'block',
    _key: Math.random().toString(36).slice(2, 10),
    style: 'normal',
    markDefs: [],
    children: [
      {
        _type: 'span',
        _key: Math.random().toString(36).slice(2, 10),
        text,
        marks: [],
      },
    ],
  };
}

async function findEventId(slug) {
  return client.fetch(
    '*[_type == "event" && (slug.de.current == $slug || slug.en.current == $slug)][0]._id',
    { slug },
  );
}

async function cleanupEvents() {
  const oetzTrophyId = await findEventId('oetz-trophy');
  if (oetzTrophyId) {
    await client.patch(oetzTrophyId).set({ entryType: 'qualification' }).commit();
    console.log(`Updated ${oetzTrophyId}: entry path is qualification`);
  }

  const boaterXId = await findEventId('boater-x');
  if (boaterXId) {
    await client
      .patch(boaterXId)
      .set({
        entryType: 'open',
        excerpt: {
          de: 'Der Oetz Kayak Cross, genannt Boater X, ist das Head-to-Head-Rennen am Freitagnachmittag und nutzt die gemeinsame Rennwochenende-Anmeldung.',
          en: 'The Oetz Kayak Cross, known as Boater X, is the head-to-head race on Friday afternoon and uses the shared race-weekend registration.',
        },
        body: {
          de: [
            textBlock(
              'Der Oetz Kayak Cross, genannt Boater X, bleibt das Head-to-Head-Rennen am Freitagnachmittag. Wer sich nicht für das Hauptrennen qualifiziert, kann mit ausreichender Wildwassererfahrung im Boater X starten. Die Teilnahme läuft über die gemeinsame Rennwochenende-Anmeldung.',
            ),
            textBlock(
              'Vier Paddler starten gleichzeitig auf einer vorgegebenen Strecke. Die ersten Zwei kommen weiter, Runde für Runde, bis nur noch vier Finalisten übrig sind. Spannung pur für Zuschauer und Athleten. Schnelle Entscheidungen, enge Duelle, voller Körpereinsatz.',
            ),
          ],
          en: [
            textBlock(
              'The Oetz Kayak Cross, known as Boater X, remains the head-to-head race on Friday afternoon. Paddlers who do not qualify for the main race can start in Boater X if they have sufficient whitewater experience. Participation runs through the shared race-weekend registration.',
            ),
            textBlock(
              'Four paddlers start simultaneously on a set course. The first two advance, round after round, until only four finalists remain. Pure excitement for spectators and athletes alike. Fast decisions, close duels, full commitment.',
            ),
          ],
        },
        rules: [
          {
            de: 'Teilnahme über die gemeinsame Rennwochenende-Anmeldung für Paddler mit Wildwasser-Erfahrung (min. WW IV).',
            en: 'Participation through the shared race-weekend registration for paddlers with whitewater experience (min. class IV).',
          },
          { de: 'Komplette Sicherheitsausrüstung ist Pflicht.', en: 'Full safety equipment is mandatory.' },
          {
            de: 'Vier Paddler pro Lauf, die ersten Zwei kommen in die nächste Runde.',
            en: 'Four paddlers per heat, the first two advance to the next round.',
          },
          {
            de: 'Absichtlicher Körperkontakt und Behinderung anderer Paddler führen zur Disqualifikation.',
            en: 'Intentional body contact and obstruction of other paddlers leads to disqualification.',
          },
        ],
      })
      .commit();
    console.log(`Updated ${boaterXId}: shared race-weekend registration copy`);
  }
}

async function cleanupSiteContent() {
  const siteContentId = await client.fetch('*[_type == "siteContent"][0]._id');
  if (!siteContentId) {
    console.log('No siteContent document found');
    return;
  }

  await client
    .patch(siteContentId)
    .set({
      'events.item1Subtitle': {
        de: 'Kayak-Cross-Rennen · Fr 18. Sept',
        en: 'Kayak Cross race · Fri 18 Sept',
      },
    })
    .unset(['registration.successText'])
    .commit();

  console.log(`Updated ${siteContentId}: removed old registration wording`);
}

async function main() {
  await cleanupEvents();
  await cleanupSiteContent();
  console.log('Single registration cleanup complete');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
