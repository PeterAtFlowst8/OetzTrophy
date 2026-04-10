#!/usr/bin/env node
/**
 * Migrate blog posts to Sanity with full Portable Text content
 * Run: SANITY_TOKEN=xxx node scripts/migrate-blog-posts.mjs
 */
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'mnazp3qy',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_TOKEN,
  useCdn: false,
});

/** Helper: create a Portable Text block from a paragraph string */
function textBlock(text) {
  return {
    _type: 'block',
    _key: Math.random().toString(36).slice(2, 10),
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: Math.random().toString(36).slice(2, 10), text, marks: [] }],
  };
}

function h2Block(text) {
  return {
    _type: 'block',
    _key: Math.random().toString(36).slice(2, 10),
    style: 'h2',
    markDefs: [],
    children: [{ _type: 'span', _key: Math.random().toString(36).slice(2, 10), text, marks: [] }],
  };
}

function boldTextBlock(text) {
  const markKey = Math.random().toString(36).slice(2, 10);
  return {
    _type: 'block',
    _key: Math.random().toString(36).slice(2, 10),
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: Math.random().toString(36).slice(2, 10), text, marks: ['strong'] }],
  };
}

// ── Post 1: Rules ──────────────────────────────────────────────────────────

const rulesPost = {
  _type: 'post',
  _id: 'post-regeln-kayak-cross',
  title: {
    de: 'Regeln zur Teilnahme am Oetz Kayak Cross',
    en: 'Rules for Participation in the Oetz Kayak Cross',
  },
  slug: {
    de: { _type: 'slug', current: 'regeln-zur-teilnahme' },
    en: { _type: 'slug', current: 'rules-for-participation' },
  },
  excerpt: {
    de: 'Sicherheit, Material und Ablauf — alles, was Athletinnen und Athleten vor dem Rennen wissen müssen.',
    en: 'Safety, equipment and procedures — everything athletes need to know before the race.',
  },
  publishedAt: '2024-08-28T00:00:00Z',
  categories: ['news'],
  body: {
    de: [
      h2Block('Sicherheit'),
      textBlock('In erster Linie müssen alle Athlet:innen erfahrene Kajakfahrer:innen sein, die sich auf der Slalomstrecke der Ötztaler Ache wohl fühlen (WW III–IV). Vor dem Rennen müssen die Athlet:innen beim Briefing anwesend sein. Während des Wettkampfes ist das Einsteigen auf dem oberen Teil der Slalomstrecke bzw. die Weiterfahrt unterhalb der Wellerbrückenstrecke verboten!'),
      h2Block('Material'),
      textBlock('Alle Paddler:innen müssen einen Wildwasserhelm (EN 1385) und eine Wildwasser-Schwimmweste mit Sicherheitsgurt (ISO 12402-5) tragen, die vom Rennleiter kontrolliert werden. Angesichts der niedrigen Wassertemperaturen und des kühlen Wetters im Herbst müssen die Athlet:innen während des gesamten Wettkampfes ausreichende Kälteschutzkleidung tragen: zulässig ist entweder eine lange Neoprenhose bzw. Long John oder eine Trockenhose mit Trockenjacke oder ein Trockenanzug.'),
      h2Block('Kajak'),
      textBlock('Serienmäßige Wildwasserkajaks aus PE. Maximale Länge von 275 cm (9 Fuß). Auftriebskörper hinten. Mindestgewicht von 18 kg (inklusive Auftriebskörpern). Ausreichend großes Cockpit, aus dem man leicht aussteigen kann. Das Kajak muss mit einer Vollplatten-Fußstütze oder ähnlichem ausgestattet sein. Mindestens zwei Befestigungspunkte vorne und hinten, die stark genug sind, um ein klemmendes Kajak (mindestens 500 kg) zu bergen.'),
      h2Block('Disqualifikationskriterien'),
      textBlock('Zusätzlich zu den genannten Regeln führen folgende Vergehen zur Disqualifikation: absichtlicher Körperkontakt, absichtliche Behinderung anderer Paddler, Nichtbeachtung der Sicherheitshinweise, Befahren gesperrter Streckenabschnitte.'),
    ],
    en: [
      h2Block('Safety'),
      textBlock('First and foremost, all athletes must be experienced kayakers who feel comfortable on the Ötztaler Ache slalom course (WW III–IV). Athletes must attend the briefing before the race. During the competition, embarking on the upper section of the slalom course or continuing below the Wellerbrücken section is prohibited!'),
      h2Block('Equipment'),
      textBlock('All paddlers must wear a whitewater helmet (EN 1385) and a whitewater life jacket with safety harness (ISO 12402-5), which will be checked by the race director. Given the low water temperatures and cool weather in autumn, athletes must wear adequate cold-weather protection clothing throughout the entire competition: either long neoprene trousers or long johns, or dry trousers with a dry jacket, or a dry suit are permitted.'),
      h2Block('Kayak'),
      textBlock('Standard whitewater kayaks made of PE. Maximum length of 275 cm (9 feet). Rear buoyancy body. Minimum weight of 18 kg (including buoyancy aids). Sufficiently large cockpit from which one can easily get out. The kayak must be equipped with a full plate footrest or similar. At least two attachment points at front and rear, strong enough to recover a jammed kayak (at least 500 kg).'),
      h2Block('Disqualification Criteria'),
      textBlock('In addition to the above rules, the following offences lead to disqualification: intentional body contact, intentional obstruction of other paddlers, ignoring safety instructions, paddling on closed sections of the course.'),
    ],
  },
};

// ── Post 2: Noetztal ───────────────────────────────────────────────────────

const noetztalPost = {
  _type: 'post',
  _id: 'post-noetztal-bren-orton',
  title: {
    de: '„Noetztal" — von Bren Orton',
    en: '"Noetztal" — by Bren Orton',
  },
  slug: {
    de: { _type: 'slug', current: 'noetztal-bren-orton' },
    en: { _type: 'slug', current: 'noetztal-bren-orton' },
  },
  excerpt: {
    de: 'Bren Orton über das Hochwasser 2023, die Ötztaler Ache und warum dieser Fluss ihn nicht loslässt.',
    en: 'Bren Orton on the 2023 flood, the Ötztaler Ache, and why this river won\'t let him go.',
  },
  publishedAt: '2023-11-03T00:00:00Z',
  categories: ['news'],
  body: {
    de: [
      textBlock('Als Bren uns gefragt hat, ob wir sein neuestes Filmprojekt unterstützen möchten, mussten wir nicht lange überlegen. Er wohnt seit einigen Jahren in Innsbruck, und die Ötztaler Ache ist ihm in dieser Zeit ziemlich ans Herz gewachsen.'),
      textBlock('In diesem Gastbeitrag beschreibt er, wie er das Hochwasser Ende August 2023 erlebt hat, das zur Absage der OETZ TROPHY geführt hat. In seinem Video räumt er mit dem hartnäckigen Vorurteil auf, dass die Ötztaler Ache ruiniert sei. Ganz im Gegenteil: Sie sei lebendiger als jemals zuvor!'),
    ],
    en: [
      textBlock('When Bren asked us if we would like to support his latest film project, we didn\'t have to think twice. He has lived in Innsbruck for several years and has grown quite fond of the Ötztaler Ache during this time.'),
      textBlock('In this guest post, he describes how he experienced the flood at the end of August 2023, which led to the cancellation of the OETZ TROPHY. In his video, he dispels the persistent prejudice that the Ötztaler Ache is ruined. Quite the opposite: it is more alive than ever before!'),
    ],
  },
};

// ── Post 3: New website announcement ───────────────────────────────────────

const newPost = {
  _type: 'post',
  _id: 'post-neuer-auftritt-2026',
  title: {
    de: 'Neuer Auftritt, neues Format — Wir sind zurück',
    en: 'New Look, New Format — We\'re Back',
  },
  slug: {
    de: { _type: 'slug', current: 'neuer-auftritt-neues-format' },
    en: { _type: 'slug', current: 'new-look-new-format' },
  },
  excerpt: {
    de: 'Die OETZ TROPHY hat eine neue Website und ein überarbeitetes Event-Format. Boater X Anmeldung ab 1. Mai.',
    en: 'The OETZ TROPHY has a new website and a revised event format. Boater X registration from 1 May.',
  },
  publishedAt: '2026-04-10T00:00:00Z',
  categories: ['news'],
  body: {
    de: [
      textBlock('Es hat etwas gedauert — aber es hat sich gelohnt. Die OETZ TROPHY hat eine neue Website, und dahinter steckt mehr als nur ein neues Design.'),
      textBlock('Nach der Absage 2024 und dem erfolgreichen Festival 2025 haben wir die Zeit genutzt, um nicht nur die Website, sondern auch das Event-Format weiterzudenken. Das Ergebnis: Das Ötztaler Kajakfestival 2026 wird vier Tage lang ein Treffpunkt für die europäische Paddel-Community — auf und abseits des Wassers.'),
      boldTextBlock('Was sich ändert:'),
      textBlock('Die OETZ TROPHY bekommt ein neues Format. Die Teilnahme bleibt auf Einladung — aber das Rennen wird anders als bisher. Mehr dazu in den kommenden Wochen.'),
      textBlock('Der Boater X ist offen für alle Paddler ab WW III. Anmeldung startet am 1. Mai 2026 — direkt hier auf der neuen Website.'),
      textBlock('Und das Wichtigste: Das Festival soll wieder das sein, wofür es steht. Community. Gemeinsam paddeln, gemeinsam feiern, gemeinsam am Fluss sein. Wir arbeiten gerade daran, einen neuen Campingplatz für das Festival zu sichern — damit alle vor Ort zusammen sein können.'),
      textBlock('Danke für die Geduld. Wir sehen uns im September.'),
    ],
    en: [
      textBlock('It took a while — but it was worth the wait. The OETZ TROPHY has a new website, and there\'s more behind it than just a fresh design.'),
      textBlock('After the 2024 cancellation and the successful 2025 festival, we used the time to rethink not just the website, but the event format itself. The result: the Ötztal Kayak Festival 2026 will be four days of bringing Europe\'s paddling community together — on and off the water.'),
      boldTextBlock('What\'s changing:'),
      textBlock('The OETZ TROPHY is getting a new format. Entry remains invite-only — but the race itself will be different from before. More details in the coming weeks.'),
      textBlock('Boater X is open to all paddlers from class III. Registration opens 1 May 2026 — right here on the new website.'),
      textBlock('And the most important thing: the festival should be what it\'s always been about. Community. Paddling together, celebrating together, being at the river together. We\'re currently working to secure a new campsite for the festival — so everyone can be together on site.'),
      textBlock('Thanks for your patience. See you in September.'),
    ],
  },
};

// ── Delete old posts and create new ones ──────────────────────────────────

async function main() {
  if (!process.env.SANITY_TOKEN) {
    console.error('Set SANITY_TOKEN env var');
    process.exit(1);
  }

  console.log('Deleting old migrated posts...');
  // Delete all posts that were auto-migrated from WP
  const oldPosts = await client.fetch('*[_type == "post" && _id match "post-*"]._id');
  if (oldPosts.length > 0) {
    const tx = client.transaction();
    for (const id of oldPosts) {
      tx.delete(id);
    }
    await tx.commit();
    console.log(`Deleted ${oldPosts.length} old posts`);
  }

  console.log('Creating 3 blog posts...');
  const tx = client.transaction();
  tx.createOrReplace(rulesPost);
  tx.createOrReplace(noetztalPost);
  tx.createOrReplace(newPost);
  const result = await tx.commit();
  console.log(`Created ${result.results.length} posts`);

  console.log('Done!');
}

main().catch(console.error);
