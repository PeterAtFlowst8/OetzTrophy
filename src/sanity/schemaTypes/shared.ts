import { defineField } from 'sanity';

/**
 * Field-level localization helpers.
 *
 * The site stores translations as `{ de, en }` objects on each field
 * (e.g. `title.de`, `excerpt.en`). These helpers keep that shape consistent
 * across every schema and match what the frontend GROQ queries expect.
 * German is the default locale, so the DE field is required.
 */

export function localizedString(name: string, title?: string, description?: string) {
  return defineField({
    name,
    title,
    description,
    type: 'object',
    options: { columns: 2 },
    fields: [
      defineField({
        name: 'de',
        title: '🇩🇪 Deutsch',
        type: 'string',
        validation: (rule) => rule.required(),
      }),
      defineField({ name: 'en', title: '🇬🇧 English', type: 'string' }),
    ],
  });
}

export function localizedText(name: string, title?: string, description?: string) {
  return defineField({
    name,
    title,
    description,
    type: 'object',
    options: { columns: 2 },
    fields: [
      defineField({
        name: 'de',
        title: '🇩🇪 Deutsch',
        type: 'text',
        rows: 4,
        validation: (rule) => rule.required(),
      }),
      defineField({ name: 'en', title: '🇬🇧 English', type: 'text', rows: 4 }),
    ],
  });
}

export function localizedBlockContent(name: string, title?: string, description?: string) {
  return defineField({
    name,
    title,
    description,
    type: 'object',
    fields: [
      defineField({ name: 'de', title: '🇩🇪 Deutsch', type: 'blockContent' }),
      defineField({ name: 'en', title: '🇬🇧 English', type: 'blockContent' }),
    ],
  });
}

/** A `{ de, en }` slug object, auto-derived from the matching title field. */
export function localizedSlug(name = 'slug', title = 'URL Slug') {
  return defineField({
    name,
    title,
    type: 'object',
    options: { columns: 2 },
    fields: [
      defineField({
        name: 'de',
        title: '🇩🇪 Slug (DE)',
        type: 'slug',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        options: { source: (doc: any) => doc?.title?.de, maxLength: 96 },
        validation: (rule) => rule.required(),
      }),
      defineField({
        name: 'en',
        title: '🇬🇧 Slug (EN)',
        type: 'slug',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        options: { source: (doc: any) => doc?.title?.en, maxLength: 96 },
      }),
    ],
  });
}
