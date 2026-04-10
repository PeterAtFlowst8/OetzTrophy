#!/usr/bin/env node
/**
 * Migrate event data to Sanity
 * Run: SANITY_TOKEN=xxx node scripts/migrate-events.mjs
 */
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'mnazp3qy',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_TOKEN,
  useCdn: false,
});

function textBlock(text) {
  return {
    _type: 'block',
    _key: Math.random().toString(36).slice(2, 10),
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: Math.random().toString(36).slice(2, 10), text, marks: [] }],
  };
}

const events = [
  {
    _type: 'event',
    _id: 'event-oetz-trophy',
    title: { de: 'Oetz Trophy', en: 'Oetz Trophy' },
    slug: {
      de: { _type: 'slug', current: 'oetz-trophy' },
      en: { _type: 'slug', current: 'oetz-trophy' },
    },
    date: '2026-09-19T09:00:00Z',
    entryType: 'invite-only',
    format: 'Time Trial',
    excerpt: {
      de: 'Die OETZ TROPHY ist eines der härtesten Kajakrennen der Alpen. Auf der Ötztaler Ache — Wildwasser V — treten die besten Paddler der Welt gegeneinander an.',
      en: 'The OETZ TROPHY is one of the hardest kayak races in the Alps. On the Ötztaler Ache — whitewater class V — the world\'s best paddlers compete head to head.',
    },
    body: {
      de: [
        textBlock('Die OETZ TROPHY ist eines der härtesten Kajakrennen der Alpen. Auf der Ötztaler Ache — Wildwasser V — treten die besten Paddler der Welt gegeneinander an. Kein offener Start: Hier fährt man nur auf Einladung.'),
        textBlock('Die Rennstrecke führt über die anspruchsvollsten Abschnitte der Ötztaler Ache. Wildwasser V mit technischen Passagen, wuchtigen Walzen und schnellen Strömungen. Die Strecke fordert Erfahrung, Technik und die Bereitschaft, an die eigene Grenze zu gehen. Nur wer den Fluss kennt und respektiert, hat hier eine Chance.'),
      ],
      en: [
        textBlock('The OETZ TROPHY is one of the hardest kayak races in the Alps. On the Ötztaler Ache — whitewater class V — the world\'s best paddlers compete head to head. No open entry: you race here by invitation only.'),
        textBlock('The race course covers the most demanding sections of the Ötztaler Ache. Class V whitewater with technical passages, powerful hydraulics and fast currents. The course demands experience, technique, and the willingness to push your limits. Only those who know and respect the river stand a chance here.'),
      ],
    },
    rules: [
      { de: 'Teilnahme nur auf persönliche Einladung durch die Veranstalter.', en: 'Participation by personal invitation from the organisers only.' },
      { de: 'Alle Teilnehmer müssen über nachweisbare Erfahrung im schweren Wildwasser (WW IV–V) verfügen.', en: 'All participants must have proven experience in class IV–V whitewater.' },
      { de: 'Komplette Sicherheitsausrüstung ist Pflicht: Helm, Schwimmweste, Spritzdecke, Wurfsack.', en: 'Full safety equipment is mandatory: helmet, PFD, spray skirt, throw bag.' },
      { de: 'Die Anweisungen der Sicherheitsposten sind jederzeit zu befolgen.', en: 'Instructions from safety personnel must be followed at all times.' },
      { de: 'Akzeptanz der Teilnahmebedingungen und Datenschutzerklärung bei der Startnummernausgabe.', en: 'Acceptance of the terms & conditions and privacy policy at bib number distribution.' },
    ],
  },
  {
    _type: 'event',
    _id: 'event-boater-x',
    title: { de: 'Boater X', en: 'Boater X' },
    slug: {
      de: { _type: 'slug', current: 'boater-x' },
      en: { _type: 'slug', current: 'boater-x' },
    },
    date: '2026-09-18T09:00:00Z',
    entryType: 'open',
    format: 'Head-to-Head',
    excerpt: {
      de: 'Der Oetz Kayak Cross — genannt Boater X — ist das offene Rennen am Freitag vor der OETZ TROPHY.',
      en: 'The Oetz Kayak Cross — known as Boater X — is the open race on the Friday before the OETZ TROPHY.',
    },
    body: {
      de: [
        textBlock('Der Oetz Kayak Cross — genannt Boater X — ist das offene Rennen am Freitag vor der OETZ TROPHY. Hier kann jeder mit ausreichender Wildwassererfahrung teilnehmen. Vier Paddler starten gleichzeitig, Kopf an Kopf durch die Stromschnellen.'),
        textBlock('Vier Paddler starten gleichzeitig auf einer vorgegebenen Strecke. Die ersten Zwei kommen weiter — Runde für Runde, bis nur noch vier Finalisten übrig sind. Spannung pur für Zuschauer und Athleten. Schnelle Entscheidungen, enge Duelle, voller Körpereinsatz.'),
      ],
      en: [
        textBlock('The Oetz Kayak Cross — known as Boater X — is the open race on the Friday before the OETZ TROPHY. Anyone with sufficient whitewater experience can enter. Four paddlers start simultaneously, racing head to head through the rapids.'),
        textBlock('Four paddlers start simultaneously on a set course. The first two advance — round after round, until only four finalists remain. Pure excitement for spectators and athletes alike. Fast decisions, close duels, full commitment.'),
      ],
    },
    rules: [
      { de: 'Offene Anmeldung für alle Paddler mit Wildwasser-Erfahrung (min. WW III).', en: 'Open entry for all paddlers with whitewater experience (min. class III).' },
      { de: 'Komplette Sicherheitsausrüstung ist Pflicht.', en: 'Full safety equipment is mandatory.' },
      { de: 'Vier Paddler pro Lauf — die ersten Zwei kommen in die nächste Runde.', en: 'Four paddlers per heat — the first two advance to the next round.' },
      { de: 'Absichtlicher Körperkontakt und Behinderung anderer Paddler führen zur Disqualifikation.', en: 'Intentional body contact and obstruction of other paddlers leads to disqualification.' },
    ],
  },
  {
    _type: 'event',
    _id: 'event-kajakfestival',
    title: { de: 'Kajakfestival', en: 'Kayak Festival' },
    slug: {
      de: { _type: 'slug', current: 'kajakfestival' },
      en: { _type: 'slug', current: 'kajakfestival' },
    },
    date: '2026-09-17T09:00:00Z',
    entryType: 'free',
    format: 'Festival',
    excerpt: {
      de: 'Das Ötztaler Kajakfestival ist das Herzstück des Wochenendes. Vier Tage lang treffen sich Paddler aus ganz Europa in Oetz.',
      en: 'The Ötztal Kayak Festival is the heart of the weekend. For four days, paddlers from across Europe gather in Oetz.',
    },
    body: {
      de: [
        textBlock('Das Ötztaler Kajakfestival ist das Herzstück des Wochenendes. Vier Tage lang treffen sich Paddler aus ganz Europa in Oetz — zum Fahren, Feiern und Austauschen. Neben den Rennen gibt es Testboote, Filmvorführungen, Workshops und Livemusik.'),
        textBlock('Das Festival findet in Oetz im Ötztal, Tirol statt. Camping direkt am Festivalgelände ist möglich. Für Unterkünfte empfehlen wir das Ötztal Tourismus Portal. Von Innsbruck sind es ca. 45 Minuten mit dem Auto.'),
      ],
      en: [
        textBlock('The Ötztal Kayak Festival is the heart of the weekend. For four days, paddlers from across Europe gather in Oetz — to paddle, celebrate and connect. Beyond the races, there are demo boats, film screenings, workshops and live music.'),
        textBlock('The festival takes place in Oetz in the Ötztal valley, Tyrol. Camping is available directly at the festival grounds. For accommodation, we recommend the Ötztal Tourism portal. From Innsbruck, it\'s approximately 45 minutes by car.'),
      ],
    },
    rules: [],
  },
];

async function main() {
  if (!process.env.SANITY_TOKEN) {
    console.error('Set SANITY_TOKEN env var');
    process.exit(1);
  }

  console.log('Creating 3 event documents...');
  const tx = client.transaction();
  for (const event of events) {
    tx.createOrReplace(event);
  }
  const result = await tx.commit();
  console.log(`Created ${result.results.length} events`);
}

main().catch(console.error);
